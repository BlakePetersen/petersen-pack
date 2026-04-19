---
phase: 24-editable-previews
reviewed: 2026-04-17T00:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - apps/artax/jest.config.ts
  - apps/artax/jest.setup.ts
  - apps/artax/src/components/component-page-client.tsx
  - apps/artax/src/components/component-playground.tsx
  - apps/artax/src/components/playground-jsx-editor.tsx
  - apps/artax/src/components/playground-props-form.tsx
  - apps/artax/src/lib/component-registry.ts
  - apps/artax/src/lib/playground-prop-coercion.ts
  - apps/artax/src/lib/playground-theme.ts
  - apps/artax/src/lib/playground-url-state.ts
  - apps/artax/tests/component-playground.test.tsx
  - apps/artax/tests/component-registry.test.ts
  - apps/artax/tests/component-routes.test.ts
  - apps/artax/tests/playground-jsx-editor.test.tsx
  - apps/artax/tests/playground-prop-coercion.test.ts
  - apps/artax/tests/playground-props-form.test.tsx
  - apps/artax/tests/playground-routes.test.tsx
  - apps/artax/tests/playground-url-state.test.ts
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 24: Code Review Report

**Reviewed:** 2026-04-17
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

Phase 24 delivers the editable previews surface for ARTAX-08 cleanly. The spike
recommendations are visibly honored in the production code: `jsxEditorScope` in
`component-playground.tsx` is an enumerated 22-name whitelist (not a wildcard
spread), `pushPlaygroundParams` uses `window.history.pushState` per D-04, the
debounce timer is cleared on unmount, and the `key={resetCounter}` remount
pattern is correctly wired on `PlaygroundJsxEditor`. Test coverage is strong and
the partition invariant (ENABLED 11 + EXCLUDED 4 = 15 registry slugs) is pinned
at both the unit (`component-registry.test.ts`) and route-integration
(`playground-routes.test.tsx`) layers.

No critical security or correctness defects were found. Three warnings flag
behavioral gaps worth addressing before the next wave; four info items note
minor defensive opportunities and one visible deferred concern.

## Warnings

### WR-01: `pushPlaygroundParams` discards all non-playground query params

**File:** `apps/artax/src/lib/playground-url-state.ts:39-45`

**Issue:** `pushPlaygroundParams` rebuilds the URL from `window.location.pathname`
plus the encoded `p[*]` payload only — any existing non-playground query params
(e.g. a future `?tab=props` or analytics params like `?utm_source=...`) are
silently wiped on every debounced form change. The `encodePlaygroundParams`
JSDoc explicitly says "Other application-level params should be merged by the
caller", but `pushPlaygroundParams` is the only caller and does not merge. This
contradicts the stated contract and will bite the first time a sibling feature
adds a non-playground search param.

**Fix:**
```ts
export function pushPlaygroundParams(props: Record<string, string>): void {
  const next = new URLSearchParams(window.location.search)
  // Drop any stale p[*] keys before setting the new ones.
  for (const key of [...next.keys()]) {
    if (/^p\[.+\]$/.test(key)) next.delete(key)
  }
  for (const [k, v] of Object.entries(props)) {
    next.set(`p[${k}]`, v)
  }
  const qs = next.toString()
  const url = qs
    ? `${window.location.pathname}?${qs}${window.location.hash}`
    : `${window.location.pathname}${window.location.hash}`
  window.history.pushState(null, '', url)
}
```
Also preserves `window.location.hash`, which is currently dropped on every push.

### WR-02: `<label>` wrapping Radix `<Toggle>` can double-fire click

**File:** `apps/artax/src/components/playground-props-form.tsx:42-52`

**Issue:** The boolean branch wraps a Radix `Toggle` (which renders a native
`<button>`) inside a `<label>`. Native label semantics forward click events to
the first form control inside — for a `<button>` child this can result in the
click being dispatched twice (once on the button, once via label forwarding),
depending on browser. The existing test passes because `fireEvent.click` targets
the button directly, not the label. The visible text "disabled" is also
rendered as the label content AND as the Toggle children, so clicking the text
is ambiguous. This does not manifest as a visible bug today (state toggles twice
→ lands on same value) but will confuse any future async onPressedChange
handler.

**Fix:** Drop the wrapping `<label>` and let the Toggle carry its own
`aria-label`:
```tsx
case 'boolean':
  return (
    <div key={prop.name} className="flex items-center gap-2 font-mono text-xs">
      <Toggle
        aria-label={prop.name}
        pressed={current === 'true'}
        onPressedChange={(v) => update(prop.name, String(v))}
      >
        {prop.name}
      </Toggle>
    </div>
  )
```

### WR-03: Live preview does not reflect form values (deferred, but URL still writes)

**File:** `apps/artax/src/components/component-playground.tsx:141-144`

**Issue:** The preview canvas calls `comp.preview()` with no arguments, ignoring
the controlled `values` state. Meanwhile the form continues to debounce-push
those values to the URL. The net UX is: user changes `variant=outline`, URL
updates after 300ms, but the on-screen preview never changes. The inline
comment acknowledges this is deferred, but shipping the URL write without the
preview wiring creates a shareable link whose payload the recipient cannot see
reflected either. Either (a) plumb `values` through to `preview(values)` now,
or (b) suppress the URL push until the preview is wired, so we don't ship
"share broken state" links.

**Fix:** The registry `preview` signature already accepts `variant?: string`.
Extend it to `preview(values?: Record<string, string>)` and pass `values` from
the playground body:
```tsx
{comp.preview(values)}
```
Each component's `preview` implementation then reads the values it cares about
(with fallback to current defaults). If this must stay deferred, gate the
`handleChange` URL push behind a feature flag so an incomplete link isn't
shareable yet.

## Info

### IN-01: `parsePropType` silently falls through single-literal types

**File:** `apps/artax/src/lib/playground-prop-coercion.ts:14-15`

**Issue:** `literalUnionRe` requires at least one `|` separator, so a type like
`'only'` (a single string literal) falls through to `{ kind: 'text' }` instead
of being recognized as a 1-option select. No such type exists in the registry
today (the expectation table in the test pins every real shape), but the
heuristic is stricter than its intent.

**Fix:** Relax the regex to allow a single-literal case, or add a comment
documenting the deliberate exclusion:
```ts
const literalUnionRe =
  /^(?:'[^']*'|"[^"]*")(?:\s*\|\s*(?:'[^']*'|"[^"]*"))*$/ // *, not +
```

### IN-02: `ComponentPageClient` silently renders null on missing component

**File:** `apps/artax/src/components/component-page-client.tsx:22-24`

**Issue:** `if (!comp) return null` masks lookup failures with an empty page. In
practice `generateStaticParams` pre-filters the tier/slug pairs so this branch
is unreachable, but a future code path that routes to this component
dynamically would produce a blank screen with no diagnostic. Consider
`notFound()` from `next/navigation`, or at minimum a dev-mode `console.warn`.

**Fix:**
```tsx
import { notFound } from 'next/navigation'
// ...
if (!comp) notFound()
```

### IN-03: `jsxEditorScope` duplicates the registry import surface

**File:** `apps/artax/src/components/component-playground.tsx:61-87`

**Issue:** The 22-name scope whitelist is hand-maintained alongside the registry.
The comment documents the invariant ("22 names match the playground-enabled
registry entries"), but there is no test asserting scope ⊆ enabled registry
components. If someone adds a new playground-enabled component they will update
the registry, the exclusion partition test will pass, but the JSX editor will
silently lack the new export.

**Fix:** Add a regression test that the keys of `jsxEditorScope` (minus
`React`) match the set of enabled registry component names:
```ts
it('jsxEditorScope covers every playground-enabled component by name', () => {
  const enabledNames = getAllComponents()
    .filter((c) => c.playground?.enabled)
    .map((c) => c.name)
  // ...assert every enabledName is a key in jsxEditorScope.
})
```
Either that, or export `jsxEditorScope` from a module that derives it from the
registry and list of compound names.

### IN-04: `artaxTerminalTheme` hex values are hand-synced to `theme.css`

**File:** `apps/artax/src/lib/playground-theme.ts:9-27`

**Issue:** The comment is explicit: "if tokens shift these literals must be
swept by hand." This is acceptable per plan 24-06, but there is no test or
lint rule pinning the values against `packages/artax-ui/src/styles/theme.css`.
A token change in the next design-token pass will silently desync the JSX
editor from the rest of the site.

**Fix:** At minimum, add a snapshot/golden test that asserts the six hex values
match the source of truth. Better: generate the theme at build time from the
CSS variables. Out of scope for v1 but worth a backlog note.

---

_Reviewed: 2026-04-17_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
