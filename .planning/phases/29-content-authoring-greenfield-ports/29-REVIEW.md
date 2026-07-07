---
phase: 29-content-authoring-greenfield-ports
reviewed: 2026-05-13T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - apps/blakepetersen.io/jest.config.ts
  - apps/blakepetersen.io/playwright.config.ts
  - apps/blakepetersen.io/src/app/install/[type]/[slug]/copy-command-block.tsx
  - apps/blakepetersen.io/src/app/install/[type]/[slug]/page.tsx
  - apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts
  - lint-staged.config.mjs
  - packages/blink-cli/src/scaffold/generator.ts
findings:
  critical: 0
  warning: 4
  info: 5
  total: 9
status: issues_found
---

# Phase 29: Code Review Report

**Reviewed:** 2026-05-13T00:00:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Reviewed seven source files spanning the new install-context route, the Playwright visual-regression suite, lint-staged plumbing, and a blink-cli scaffold fix. No critical security or correctness defects. Four warnings worth addressing before merge — most notable is **WR-01**, where the `/install/[type]/[slug]` route serializes the entire artifact registry into the RSC payload on every request, even though `ArtifactBody` consumes exactly one entry. The remaining warnings are around clipboard error handling (silent failure on permission denial), Playwright's `webServer` running `pnpm dev` instead of a production build (a known source of visual-snapshot flake), and reliance on `waitForLoadState('networkidle')` in the snapshot path. Info items are smaller robustness/cleanup suggestions.

## Warnings

### WR-01: Install route ships full artifact registry to client on every request

**File:** `apps/blakepetersen.io/src/app/install/[type]/[slug]/page.tsx:46-51`
**Issue:** `artifactData` is built by mapping over **all** artifacts (including every file's full `content` string), then handed to `ArtifactDataProvider` — a `'use client'` component (`src/components/mdx/artifact-body.tsx:4,18`). React serializes the entire prop tree into the RSC payload, so each `/install/<type>/<slug>` response includes every other artifact's source on the wire and in the client bundle, even though `ArtifactBody` only reads the single matching entry. This scales linearly with the artifact count (currently ~20 entries from Phase 29; will grow).
**Fix:** Pass only the artifact for the current slug. Since `ArtifactBody` looks up by slug in a Map, a single-entry provider works:
```ts
const artifactForRoute = {
  slug: artifact.slug,
  name: artifact.name,
  type: artifact.type,
  files: artifact.files.map((f) => ({ path: f.path, content: f.content })),
}

// ...
<ArtifactDataProvider artifacts={[artifactForRoute]}>
  <ArtifactBody slug={slug} />
</ArtifactDataProvider>
```
This also removes the second linear pass over `all`.

### WR-02: Playwright `webServer` runs `pnpm dev`, not a production build

**File:** `apps/blakepetersen.io/playwright.config.ts:48-53`
**Issue:** Visual-regression baselines were captured against `next dev`, which differs from `next build && next start` in bundling, minification, hydration timing, and React DevTools artifacts. Baselines taken in dev can flake under CI (or vice versa) once any difference touches paint. This is a documented gotcha for Playwright + Next.js visual diffs.
**Fix:** Run snapshots against a production server:
```ts
webServer: {
  command: process.env.CI ? 'pnpm build && pnpm start' : 'pnpm dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 180000,
},
```
If the intent of using `pnpm dev` locally is iteration speed, at minimum gate CI on the production command so baseline regenerations match what CI compares against.

### WR-03: `navigator.clipboard.writeText` has no error handling

**File:** `apps/blakepetersen.io/src/app/install/[type]/[slug]/copy-command-block.tsx:11-15`
**Issue:** If the user denies clipboard permission, the page is served over an insecure (non-HTTPS, non-localhost) context, or the browser lacks the Async Clipboard API, `writeText` rejects. The `await` is unguarded, so the rejection bubbles as an unhandled promise rejection, `setCopied(true)` never runs, and the user gets zero feedback — the button just looks broken.
**Fix:**
```ts
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  } catch {
    // Optional: surface a "copy failed" state, or fall back to a textarea select.
    setCopied(false)
  }
}
```
A visible failed state is friendlier than the silent no-op, but at minimum swallow the rejection so it doesn't show up as an unhandled error in the console / Sentry.

### WR-04: Snapshot test relies on `networkidle` for paint readiness

**File:** `apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts:21`
**Issue:** Playwright's own documentation discourages `waitForLoadState('networkidle')` for tests because it doesn't actually wait for hydration, layout, or theme application — it only waits for ~500ms of network silence. With next-themes flipping `data-theme` on mount, the theme paint can land *after* networkidle resolves, producing intermittent diffs against the baseline.
**Fix:** Anchor on a deterministic post-hydration condition. The `await expect(authorNote).toBeVisible()` on line 26 partially does this, but theme readiness is separate:
```ts
await page.goto(`/skills/${SKILL_SLUG}`)
// Wait for next-themes to apply the attribute (data-theme is set on <html> by ThemeProvider)
await page.waitForFunction(
  (expected) => document.documentElement.getAttribute('data-theme') === expected,
  theme,
)
await expect(authorNote).toBeVisible()
```
This removes the `networkidle` step entirely and gates the screenshot on the actual condition the test cares about.

## Info

### IN-01: `setTimeout` in `CopyCommandBlock` is not cleared on unmount

**File:** `apps/blakepetersen.io/src/app/install/[type]/[slug]/copy-command-block.tsx:14`
**Issue:** If the user clicks "copy" and navigates away within 2s, the timer fires `setCopied(false)` on an unmounted component. React 19 silently no-ops, but the pattern leaks the timer until it fires.
**Fix:** Track the timeout id in a ref and clear it in a cleanup effect, or use a small custom hook. Low priority — purely a cleanup-hygiene nit.

### IN-02: `readArtifactsJson()` invoked twice per request

**File:** `apps/blakepetersen.io/src/app/install/[type]/[slug]/page.tsx:33,46`
**Issue:** `all` is captured on line 33 and reused on line 34 (`find`) — fine — but then `artifactData = all.map(...)` re-iterates the same array on line 46. Once WR-01 is fixed to use a single-element provider, this collapses naturally. Flagging here as the trigger to revisit.
**Fix:** Folded into WR-01.

### IN-03: Artifact lookup by `slug` alone is order-sensitive across types

**File:** `apps/blakepetersen.io/src/app/install/[type]/[slug]/page.tsx:34,40`
**Issue:** `all.find((a) => a.slug === slug)` returns the first match. If two artifacts share a slug across types (e.g., a future `skills/foo` and `hooks/foo`), the wrong one is selected and then the type-mismatch guard on line 40 raises a 404 — so the URL silently breaks rather than resolving the correct artifact. Today no slugs collide, but this couples correctness to data shape rather than code.
**Fix:** Match by both fields up front:
```ts
const artifactType = TYPE_SEGMENT_TO_ARTIFACT_TYPE[type]
const artifact = all.find((a) => a.slug === slug && a.type === artifactType)
if (!artifact) notFound()
```
Removes the separate type guard on line 40 and makes the resolution unambiguous.

### IN-04: `lint-staged` passes `--files` as a comma-joined arg without quoting

**File:** `lint-staged.config.mjs:24-26`
**Issue:** Two minor fragilities:
1. `files.map(...).join(',')` is interpolated into the shell command without quotes. Any staged path containing a space (legal, though rare for `content/**/*.mdx`) will be split by the shell and read as multiple args.
2. blink CLI splits `--files` on `,` (`packages/blink-cli/src/commands/lint.ts:34`), so any path containing a `,` would be split incorrectly. Even rarer, but it's a sharp edge.
**Fix:** Wrap the comma-joined list in single quotes:
```js
return `pnpm --filter blakepetersen.io exec blink lint --files '${relative}'`
```
Or, sturdier still, switch blink's `--files` to repeated flags and emit one per file. Low priority — present content paths are slug-shaped.

### IN-05: `APP_ROOT` in `lint-staged.config.mjs` is `cwd`-dependent

**File:** `lint-staged.config.mjs:14`
**Issue:** `path.resolve('apps/blakepetersen.io')` resolves against `process.cwd()`. Husky invokes lint-staged from the repo root so this is correct in the normal flow, but running `lint-staged` directly from a subdirectory (or from inside `apps/blakepetersen.io/`) silently produces wrong paths and a confusing CLI error from blink.
**Fix:** Pin to this config file's location:
```js
import { fileURLToPath } from 'node:url'
const HERE = path.dirname(fileURLToPath(import.meta.url))
const APP_ROOT = path.join(HERE, 'apps/blakepetersen.io')
```
Robust to any cwd. Low priority — pre-commit flow is the only intended invocation.

---

_Reviewed: 2026-05-13T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
