---
phase: 29-content-authoring-greenfield-ports
plan: 02
subsystem: content
tags: [playwright, voice-primitives, convex-patterns, obsidian-port, torture-test, hard-gate, install-route]

# Dependency graph
requires:
  - phase: 29-content-authoring-greenfield-ports
    plan: 01
    provides: "Playwright 1.59.1 + 3 viewport projects, Jest isolated from tests/visual, lint baseline frozen at 24/5, Blake-locked Monodex shortlist + Option B authorization"
provides:
  - "First v1.4-compliant skill entry shipped: content/skills/convex-patterns.mdx with <AuthorNote> + <DecisionRationale> co-invocation per D-06"
  - "Companion artifact at content/skills/convex-patterns.artifact.md (single-file, type=skill, real working content per D-13)"
  - "Three Playwright torture-test baselines (desktop-light, desktop-dark, mobile-light) — Blake-approved, regression-free"
  - "Generalized install-context route at /install/[type]/[slug] — handles skills, configs, hooks with notFound() guards for unknown types and slug/type mismatches"
  - "Authoring pattern locked: architectural framing + quoted snippets with new-tab /install/<type>/<slug> links, no inline <ArtifactBody>, voice primitives placed naturally in prose"
affects: [29-03, 29-04, 29-05, 29-06, 30]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Quoted-snippet authoring pattern: prose contains short illustrative code blocks, each followed by a new-tab anchor link to /install/<type>/<slug> (no inline <ArtifactBody>) — keeps reading flow narrative, defers full-file detail to install-context view"
    - "Parametric install route: /install/[type]/[slug] with INSTALLABLE_TYPES allowlist (skills/configs/hooks) + artifact-type cross-check guard — Plans 03/04/05 author content without infra changes; guides (Plan 06) correctly 404 from this surface per D-14"
    - "Plural-segment-vs-singular-artifact-type mapping (skills→skill, configs→config, hooks→hook) lives in a single TYPE_SEGMENT_TO_ARTIFACT_TYPE record in the page component — single edit if collection naming ever shifts"

key-files:
  created:
    - "apps/blakepetersen.io/content/skills/convex-patterns.mdx"
    - "apps/blakepetersen.io/content/skills/convex-patterns.artifact.md"
    - "apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts"
    - "apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts-snapshots/skill-detail-desktop-light.png"
    - "apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts-snapshots/skill-detail-desktop-dark.png"
    - "apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts-snapshots/skill-detail-mobile-light.png"
    - "apps/blakepetersen.io/src/app/install/[type]/[slug]/page.tsx"
    - "apps/blakepetersen.io/src/app/install/[type]/[slug]/copy-command-block.tsx"
  modified: []

key-decisions:
  - "29-02: Variant 3 (install-context view) picked over Variant 1 (bare artifact viewer) at checkpoint — `blink apply` command is the page protagonist; file render is supporting context"
  - "29-02: Install route generalized to /install/[type]/[slug] (parametric) rather than three sibling top-level routes — single page handles skills/configs/hooks, INSTALLABLE_TYPES allowlist guards unknown segments, cross-check guard rejects type/slug mismatches"
  - "29-02: Snippet links in prose use new-tab anchors with target=_blank rel=noopener — explicitly Blake-requested; defers full-file context to install-route without breaking reading flow"
  - "29-02: <ArtifactBody> not used in the convex-patterns body — reading flow stays prose-first, full artifact lives at /install/skills/convex-patterns; this pattern carries forward to Plans 03/04/05 and supersedes the Pitfall 4 path-shaped-slug guidance for new entries"

patterns-established:
  - "Quoted snippet + new-tab install link: short illustrative code fences in prose paired with anchor links to /install/<type>/<slug> — replaces inline <ArtifactBody> for entries authored to architectural-framing voice"
  - "Parametric install route validation chain: INSTALLABLE_TYPES.has(type) → readArtifactsJson().find(a => a.slug === slug) → artifact.type === TYPE_SEGMENT_TO_ARTIFACT_TYPE[type] — three independent notFound() gates"
  - "Bare-slug artifact lookup is authoritative: artifacts.json keys via deriveArtifactSlug (filename-only, no collection prefix); /install route consumes bare slug from URL segment, no path-reconstruction needed"

requirements-completed: []  # CONTENT-06 is delivered (torture test passes in 3 viewports, install route generalized); CONTENT-01 stays Pending because only 1 of 5 skills has shipped — Plan 03 ships the remaining 4

# Metrics
duration: "~43 min wall for finalize (2026-05-12 23:14 first task commit → 23:57 last task commit); plan spans 2 wall-days when counting upstream infra pre-fixes (2026-05-12 evening + 2026-05-13 metadata commit)"
completed: 2026-05-13
---

# Phase 29 Plan 02: HARD GATE Torture Test Summary

**First v1.4-compliant skill entry (convex-patterns) ships with `<AuthorNote>` + `<DecisionRationale>` co-invocation, three Playwright baselines (desktop-light/dark + mobile-light) regression-free, install-context route generalized to `/install/[type]/[slug]` for Plans 03/04/05 reuse, and the comparison-section experiment cleaned up after Variant 3 won the checkpoint.**

## Performance

- **Duration:** ~43 min wall on the active authoring evening (2026-05-12 23:14 → 23:57); plan crossed into 2026-05-13 for the final metadata/state commit. Excludes the upstream infra pre-fixes (`1401246`, `f12c0c1`, `715a959`) that landed earlier in the day.
- **Started:** 2026-05-12T23:14:39-07:00 (`8cc7d8a` wr-01 port commit)
- **Completed:** 2026-05-13T (metadata commit timestamp — see plan metadata commit hash below)
- **Tasks:** 3 plan tasks (port + author, write/regen baselines, Blake checkpoint) + 4 finalize commits (delete Variant 1, generalize route, strip comparison + retarget links, regen baselines)
- **Files created:** 8 (1 MDX, 1 artifact, 1 spec, 3 PNGs, 2 install-route files)
- **Files modified:** 0 (all paths in the keyfiles list are net-new; the install-route generalization moved the existing prototype into its current location via git rename)

## Accomplishments

- **convex-patterns skill entry shipped** at `apps/blakepetersen.io/content/skills/convex-patterns.mdx` — 1437-word architectural orientation to Convex for Next.js developers, with both voice primitives invoked (`<AuthorNote>` for the "queries are subscriptions" pivot, `<DecisionRationale>` for the index-everywhere rule), frontmatter declaring `voice: ['author-note', 'decision-rationale']` + `requires_artifact: true`, and a 2-entry `decisions:` array for the convex-as-peer + webhook-provisioning calls.
- **Companion artifact** at `convex-patterns.artifact.md` — single-file, `type: skill`, real working content (schema + http + tasks consolidated; `blink apply skill/convex-patterns` produces a runnable Convex starter).
- **Playwright torture-test infrastructure delivered** — `tests/visual/voice-primitives.spec.ts` with `addInitScript` next-themes handoff, `getByRole('note', { name: "Author's note" })` anchor for fail-fast, three baseline PNGs committed and Blake-approved (no `artax-ui` regression — both voice primitives render to UI-SPEC contract in light/dark/mobile).
- **Install-context route shipped** at `apps/blakepetersen.io/src/app/install/[type]/[slug]/` — parametric over `type ∈ {skills, configs, hooks}` (Plan 06 guides intentionally 404), validates slug/type consistency against artifacts.json, foregrounds `blink apply <type>/<slug>` as the protagonist with an inline copy button, supporting `<ArtifactBody>` rendered below for "what gets written" context.
- **Authoring pattern locked for Plans 03–06** — architectural framing > quoted illustrative snippets > new-tab anchor to install route > no inline `<ArtifactBody>` in the body. Documented in the Downstream-consumer notes section below.

## Task Commits

Plan-task commits and finalize commits, in execution order:

1. **wr-01: port + author convex-patterns skill + companion artifact** — `8cc7d8a` (feat)
2. **wr-02: voice-primitives Playwright spec with 3 viewport baselines** — `46e99c6` (test)
3. **wr-03a: Variant 1 prototype (bare artifact viewer)** — `e116e4d` (feat) — *reverted in 83a2a13 after Blake's checkpoint pick*
4. **wr-03c: Variant 3 prototype (install-context view)** — `9a0f628` (feat) — *kept; generalized in 505723d*
5. **wr-04: rewrite convex-patterns prose for accessibility + architectural framing** — `af89301` (feat)
6. **Finalize 1: drop Variant 1 prototype after checkpoint pick** — `83a2a13` (revert)
7. **Finalize 2: generalize /install route to /install/[type]/[slug]** — `505723d` (refactor)
8. **Finalize 3 (wr-05): strip comparison section + retarget links to Variant 3** — `cb0fd8b` (feat)
9. **Finalize 4 (wr-06): regenerate voice-primitives baselines against rewritten skill page** — `9fe8355` (test)

**Plan metadata:** *(see final commit below this SUMMARY)*

### Upstream infra pre-fixes (not strictly part of Plan 02, but unblocked it)

These landed earlier on 2026-05-12 to unblock the Plan 02 build/lint chain. Phase 30's verification work should know about them but they are not Plan 02 deliverables:

- `1401246` — `fix(blink-cli): use relative imports in scaffold/generator.ts for Next workspace typecheck` (Blocker 1 pre-fix — typecheck was failing on a workspace import resolution edge case)
- `f12c0c1` — `chore(infra): route content lint-staged through blink lint --files for per-file validation` (lint-staged was running full-tree lint:content, slow and noisy)
- `715a959` — `fix(infra): narrow content lint-staged matcher to .mdx entries only` (matcher was picking up .artifact.md files which `blink lint` doesn't accept as direct input)

## Files Created/Modified

### Created (this plan)

- `apps/blakepetersen.io/content/skills/convex-patterns.mdx` — torture-test entry: 1437 words, both voice primitives invoked, 5 new-tab links to `/install/skills/convex-patterns`, no inline `<ArtifactBody>`
- `apps/blakepetersen.io/content/skills/convex-patterns.artifact.md` — single-file companion artifact, `type: skill`, real working Convex starter
- `apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts` — Playwright spec with next-themes `addInitScript` theme handoff + `getByRole('note')` anchor
- `apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts-snapshots/skill-detail-desktop-light.png` — 1280px-wide light-mode baseline (regenerated 9fe8355 against rewritten page)
- `apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts-snapshots/skill-detail-desktop-dark.png` — 1280px-wide dark-mode baseline (regenerated 9fe8355)
- `apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts-snapshots/skill-detail-mobile-light.png` — Pixel 5 (~393px) light-mode baseline (regenerated 9fe8355)
- `apps/blakepetersen.io/src/app/install/[type]/[slug]/page.tsx` — parametric install-context page (skills/configs/hooks), validates type segment + slug consistency, renders `blink apply <type>/<slug>` + `<ArtifactBody>`
- `apps/blakepetersen.io/src/app/install/[type]/[slug]/copy-command-block.tsx` — type-agnostic client island for the protagonist command, copy-to-clipboard with 2s "copied!" feedback

### Removed during finalize

- `apps/blakepetersen.io/src/app/artifacts/skills/[slug]/page.tsx` — Variant 1 bare viewer prototype, removed in `83a2a13` after Variant 3 won
- `apps/blakepetersen.io/src/app/install/skills/[slug]/page.tsx` — Variant 3 prototype at its initial location, moved to `/install/[type]/[slug]/page.tsx` in `505723d` (git rename, 66% similarity)
- `apps/blakepetersen.io/src/app/install/skills/[slug]/copy-command-block.tsx` — same, moved to `/install/[type]/[slug]/copy-command-block.tsx` (git rename, 85% similarity)

## Downstream-consumer notes (CRITICAL — Plans 03/04/05/06 executors MUST read)

### Authoring pattern (carry forward from convex-patterns)

The Plan 02 entry establishes the v1.4 skill/config/hook authoring shape:

1. **Architectural framing in prose** — orient the reader to where the thing fits in their existing mental model (e.g., "Convex inverts request-response — queries are subscriptions"). Reference-level density, not tutorial. 500-1500 words per D-10.
2. **Quoted illustrative snippets inline** — short code fences (≤25 lines, single concern: a schema, a query, a handler) within the prose, each with an explicit language tag (` ```ts`, never bare ` ``` `). Heading is a noun-phrase or imperative, NOT a question.
3. **New-tab anchor to install route** — after each snippet, an `<a href="/install/<type>/<slug>" target="_blank" rel="noopener">View full <filename> →</a>` link. Blake explicitly asked for new-tab behavior; preserve `target="_blank" rel="noopener"` on every anchor.
4. **No inline `<ArtifactBody>` in the entry body** — the install route is the canonical full-artifact surface. This supersedes Pitfall 4's path-shaped-slug guidance for new entries (see Plan deviations → Phase 30 doc cleanup below).
5. **Voice primitives placed naturally** — at least one `<AuthorNote>` (anonymous, < 4 sentences, first-person, specific per UI-SPEC) AND at least one `<DecisionRationale decision="…" rationale="…" />` per D-06 (Plan 02 hard gate) / D-11 (general). Headings noun-phrase or imperative, NOT a question.

### Per-plan applicability

- **Plan 03 (4 more skill ports — `nextjs-stack-patterns`, `macbook-dev-setup`, `terminal-webdev-tuning`, `tmux-power-workflows`):** Use the same authoring pattern. The `/install/skills/<slug>` URL works for each — no infra changes needed. Option B authorization (manual voice-primitive injection — vault has zero callouts) carries forward; executor must manually add at least one voice primitive per D-11.
- **Plan 04 (7 configs, all artifact-bearing):** Same pattern, links point to `/install/configs/<slug>`. The parametric route already handles `configs`. Plan 04 just authors MDX + artifact files.
- **Plan 05 (4 hooks, all artifact-bearing):** Same pattern, links point to `/install/hooks/<slug>`. Route already handles `hooks`.
- **Plan 06 (4 guides, NO artifacts per D-14):** No install route surface needed — `/install/guides/<slug>` intentionally 404s from the INSTALLABLE_TYPES allowlist. Prose-only. Voice primitives still required per D-11.

### Hard gate status

The CONTENT-06 torture test is **passed**. The voice primitives (`AuthorNote`, `DecisionRationale`) render correctly in light/dark/mobile per the UI-SPEC §Voice Primitive Visual Contract — no `artax-ui` regression surfaced, so no upstream `packages/artax-ui` fix was required. Plans 03/04/05/06 are unblocked.

## Decisions Made

- **Variant 3 over Variant 1.** Blake's checkpoint pick. The install-context view foregrounds the action (`blink apply`) the reader is at the page to perform; the bare viewer leaves the action implicit. Plans 03/04/05 inherit the framing.
- **Parametric `[type]/[slug]` route over three sibling routes.** Single page component, single set of guards, single edit if the validation chain ever shifts. The plural-segment-to-singular-artifact-type mapping lives in one record (`TYPE_SEGMENT_TO_ARTIFACT_TYPE`) at the top of the page module.
- **New-tab anchors for snippet links.** Blake's explicit request. Reading the entry should not navigate away from the entry; the install route is companion context, not a successor page. `target="_blank" rel="noopener"` preserved on all 5 anchors in convex-patterns.mdx (the `noreferrer` complement was not added — `noopener` already defeats the window.opener vector; adding `noreferrer` would lose referrer analytics. Defer to a separate Phase 30 decision if Blake wants the stricter form.).
- **No `<ArtifactBody>` in the entry body.** Supersedes Pitfall 4's path-shaped-slug guidance for new entries authored to this pattern. Pitfall 4 documentation should be archived/redacted in Phase 30.
- **Baselines regenerated rather than diff-merged.** Page rendered very differently after Steps 1-3 (comparison section removed, link text + URLs changed). A semantic diff isn't useful when the page shape itself shifted; full regen is cheaper than reasoning about diff thresholds.

## Deviations from Plan

The plan-as-written specified an `<ArtifactBody slug="skills/convex-patterns" />` invocation in the entry body (per D-15 / RESEARCH Pattern 2). The Plan 02 checkpoint introduced two prototype variants that explored alternative artifact surfacing, and Blake's pick (Variant 3) supersedes the in-body `<ArtifactBody>` approach for this entry. Treating this as a **plan-time evolution rather than an auto-fix deviation** — Blake's checkpoint authority drove the shift, and the new pattern is documented above for downstream consumers.

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed Variant 1 prototype after checkpoint pick**

- **Found during:** Step 1 of finalize (post-checkpoint cleanup)
- **Issue:** `apps/blakepetersen.io/src/app/artifacts/skills/[slug]/page.tsx` was a prototype route that lost the checkpoint comparison; leaving it in the tree would expose an unmaintained route surface and confuse Plan 03+ readers about which install path to link.
- **Fix:** `git rm -r apps/blakepetersen.io/src/app/artifacts`. Confirmed via `rg /artifacts/skills` that the only remaining references were the 5 snippet links in `convex-patterns.mdx`, which Step 3 retargets.
- **Committed in:** `83a2a13`

**2. [Rule 2 - Missing Critical Functionality] Generalized install route for Plans 03/04/05**

- **Found during:** Step 2 of finalize (looking ahead to Plans 04/05 needs)
- **Issue:** Variant 3 lived at `/install/skills/[slug]` only. Plans 04 (configs × 7) and 05 (hooks × 4) need parallel install routes; without generalization here, each plan would either duplicate the route or stall on infra work.
- **Fix:** Moved to `/install/[type]/[slug]/` with an INSTALLABLE_TYPES allowlist (`skills`/`configs`/`hooks`) and a cross-check guard that rejects URLs whose `type` segment doesn't match the resolved artifact's `type` field. Guides correctly 404 from this surface per D-14.
- **Verification:** `pnpm --filter blakepetersen.io typecheck` clean; `pnpm --filter blakepetersen.io build` green; Playwright spec re-run green.
- **Committed in:** `505723d`

**3. [Rule 1 - Bug Fix] Retargeted snippet links + removed comparison section**

- **Found during:** Step 3 of finalize
- **Issue:** Five `<a href="/artifacts/skills/convex-patterns">` snippet links in the body pointed at the now-deleted Variant 1 route — would 404 on first click after Step 1's deletion. Separately, the H2 "Compare artifact-page layouts" section was Blake-review scaffolding that needed to come out.
- **Fix:** Retargeted all 5 anchors to `/install/skills/convex-patterns` (preserving `target="_blank" rel="noopener"`); removed the comparison H2 and its two-bullet list. Word count dropped 1501 → 1437 (back inside the D-10 500-1500 band; the comparison section was the only reason the entry was over by 1 word).
- **Verification:** `pnpm --filter blakepetersen.io exec blink lint --files content/skills/convex-patterns.mdx` clean; `rg /artifacts/skills apps/blakepetersen.io/{content,src}` returns no matches.
- **Committed in:** `cb0fd8b`

**4. [Rule 1 - Bug Fix] Regenerated stale baselines**

- **Found during:** Step 4 of finalize
- **Issue:** The page rendered shorter and the link text changed after Step 3; the baselines from `e116e4d` were stale and would fail diff on the next run.
- **Fix:** `pnpm exec playwright test tests/visual --update-snapshots` → 3 baselines regenerated → re-run without `--update-snapshots` → 3 passed in 2.0s.
- **Verification:** Visual eyeball against UI-SPEC §Voice Primitive Visual Contract (AuthorNote 2px info border + tint, DecisionRationale 4px primary border + card surface, mobile reading column intact, no horizontal scroll).
- **Committed in:** `9fe8355`

---

**Total deviations:** 4 auto-fixed (1 blocking cleanup, 1 critical functionality add, 2 bug fixes)
**Impact on plan:** All four were strictly required after Blake's checkpoint pick — the checkpoint chose a different end-state than the plan-as-written assumed, and the finalize steps reconcile the tree to that end-state. No scope creep.

## Plan deviations / Phase 30 documentation cleanup

The following items are downstream-only and should be tracked in Phase 30's docs-cleanup scope:

- **Pitfall 4 redaction.** `29-RESEARCH.md` Pitfall 4 describes `<ArtifactBody slug="<type>/<slug>" />` as path-shaped. That guidance no longer applies to new entries authored under the Plan 02 pattern (which doesn't use `<ArtifactBody>` in-body at all). The Pitfall is still accurate as a historical note for any pre-existing entries that do use the component, but it should be marked "superseded by Plan 02 pattern" in Phase 30. Artifact slugs in `.velite/artifacts.json` are bare (filename-only) per `deriveArtifactSlug` in `packages/blink-cli/.../velite-prepare.ts:220-226` — the install route consumes the bare slug directly.
- **Variant 2 routing note (for future "subroute under a skill" designs).** During Plan 02 prototype exploration, a `/skills/[...slug]/<sub>` shape was considered. It is unreachable while the existing skills page is a catch-all (`apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx`). Any future "subroute under a skill" design needs to refactor that catch-all into a route group (`(detail)/[...slug]`) first. Logged here so Phase 30's audit catches it if/when that pattern resurfaces.
- **Word count check (1501 → 1437).** The entry was 1 word over the D-10 1500-word ceiling pre-Step-3 (only because of the comparison section). Step 3 removed the section and brought it back into compliance. Plan 07's verifier should confirm `awk -F'^---$' '...'` body-only count is ≤1500 across all v1.4 entries.
- **Upstream infra pre-fixes (3 commits).** `1401246` / `f12c0c1` / `715a959` landed before Plan 02's first task commit but aren't strictly part of the Plan 02 deliverable. Surfaced here so Phase 30 knows where they came from when auditing the branch.

## Known Stubs

None. The entry, artifact, and install route all ship with real content. The `tags` row in the listing renders from `applies_to` + `tags` frontmatter; both are populated. The `<DecisionRationale alternatives>` array on the in-body invocation has 1 entry (the only honest alternative — defensible `filter()` on bounded tables) and is intentional, not a stub.

## Threat Flags

None new. Plan 02's threat register (T-29-02-01..06 in the plan frontmatter) covers all surface introduced. The new `/install/[type]/[slug]` route is a read-only static page rendering frozen artifact content from `.velite/artifacts.json` — no user input, no auth surface, no execution.

## Issues Encountered

- **`pnpm lint:content` not at repo root.** During Step 5 verification, `pnpm lint:content` exited with `Command "lint:content" not found`. The script lives on `apps/blakepetersen.io` (workspace-local), not the repo root. Switched to `pnpm --filter blakepetersen.io lint:content`. Noting here so the next finalize step in this phase doesn't re-trip.
- **Untracked `home-desktop.png` at repo root.** Pre-existed this session (file timestamp 2026-05-12 23:57, predates the finalize work). Not from Plan 02. Left alone — would need Blake's call to either gitignore or commit (or delete if it's a screenshot artifact).
- **Commitlint body-line-length on the wr-05 commit.** First message rejected for a >100-char body line. Rewrote with shorter lines, no functional content lost. Noting so Phase 30's commit-message audit doesn't flag the rewrite as suspicious.

## Next Phase Readiness

**Plan 03 (Wave 2 — batch port of 4 skill entries) is unblocked.** Required artifacts on disk:

- Install route at `/install/[type]/[slug]/` ready to receive new slugs — Plan 03's 4 entries link to `/install/skills/<slug>` without any infra changes.
- Authoring pattern documented in Downstream-consumer notes above — Plan 03 executor has the explicit shape (architectural framing → quoted snippets → new-tab install link → no in-body `<ArtifactBody>` → voice primitives).
- Option B authorization (manual voice-primitive injection) carries forward — vault still has zero callouts, executor must manually add at least one voice primitive per D-11.

**Plans 04 (configs) and 05 (hooks) are unblocked from Plan 02's side.** They depend on their own per-plan authoring work; the install route is ready. Plan 06 (guides) does not interact with the install route at all.

**Phase 30 carry-forward items:**

- Redact / supersede Pitfall 4 in `29-RESEARCH.md`
- Audit the branch's 3 upstream infra pre-fixes (`1401246`, `f12c0c1`, `715a959`)
- Decide on `noreferrer` complement to `noopener` on snippet anchors (currently `noopener` only)
- Variant 2 catch-all-route routing note (only relevant if "subroute under a skill" ever resurfaces)

## Self-Check: PASSED

Verifications performed before writing this SUMMARY:

- `git log --oneline --all | grep 29-02` → 9 task/finalize commits present (`8cc7d8a`, `46e99c6`, `e116e4d`, `9a0f628`, `af89301`, `83a2a13`, `505723d`, `cb0fd8b`, `9fe8355`)
- `[ -f apps/blakepetersen.io/content/skills/convex-patterns.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/skills/convex-patterns.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts ]` → FOUND
- `ls apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts-snapshots/` → 3 PNGs (desktop-light, desktop-dark, mobile-light)
- `[ -f apps/blakepetersen.io/src/app/install/[type]/[slug]/page.tsx ]` → FOUND
- `[ -f apps/blakepetersen.io/src/app/install/[type]/[slug]/copy-command-block.tsx ]` → FOUND
- `[ -d apps/blakepetersen.io/src/app/artifacts ]` → ABSENT (Variant 1 cleanly removed)
- `[ -d apps/blakepetersen.io/src/app/install/skills ]` → ABSENT (Variant 3 cleanly relocated)
- `pnpm --filter blakepetersen.io build` → exit 0 (Velite + Webpack + Pagefind all green, 25 pages indexed, 2383 words)
- `pnpm --filter blakepetersen.io test` (Jest) → 40 suites / 280 tests passed
- `pnpm --filter blakepetersen.io lint:content` → 24 errors / 5 warnings — **delta zero vs Wave 0 baseline** (errors all in `content/posts/*` per Phase 30 scope; warnings all in `content/configs/*` orphan-artifact advisories)
- `pnpm exec playwright test tests/visual` → 3 passed (2.0s, no `--update-snapshots`)
- `rg /artifacts/skills apps/blakepetersen.io/{content,src}` → no matches
- Both voice primitives present in the live page (verified via Playwright `getByRole('note', {name: "Author's note"})` toBeVisible assertion in the spec, which precedes the snapshot)

---
*Phase: 29-content-authoring-greenfield-ports*
*Plan: 02*
*Completed: 2026-05-13*
