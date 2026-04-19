---
phase: 24-editable-previews
plan: 7
subsystem: ui
tags: [route-tests, integration, url-round-trip, regression, coverage]

# Dependency graph
requires:
  - phase: 24-editable-previews
    provides: "ComponentPlayground + Playground tab wiring (24-05)"
  - phase: 24-editable-previews
    provides: "JSX editor integration (24-06)"
  - phase: 24-editable-previews
    provides: "ComponentDef.playground?.enabled opt-in (24-03), 11-enabled/4-excluded partition"
provides:
  - Route-level regression suite for Playground tab visibility (11 enabled / 4 excluded)
  - URL → form round-trip integration test exercising decodePlaygroundParams through ComponentPlayground
  - Registry size guard (generateStaticParams output ≡ getAllComponents() set equality)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "describe.each per-slug drives the 11/4 partition in a data-table style — adding/removing a playground-enabled slug requires editing the test's ENABLED/EXCLUDED array, making drift visible"
    - "Triple-locked exclusion list: source (omission in component-registry.ts) + 24-03 unit tests + 24-07 route tests — any future drift trips at least one"
    - "getByRole('tab', { name: 'Playground' }) for TabsTrigger assertions — avoids brittle CSS selectors and matches Radix Tabs' ARIA semantics"

key-files:
  created:
    - apps/artax/tests/playground-routes.test.tsx
  modified:
    - apps/artax/tests/component-routes.test.ts

key-decisions:
  - "File extension .tsx not .ts (plan spec was .ts) — JSX syntax cannot compile in a .ts file under ts-jest. Deviation: Rule 3 blocking issue. No behavioral impact; jest glob still matches."
  - "Partition duplicated locally (ENABLED/EXCLUDED arrays) rather than imported from a shared constant. Locality-of-intent: this test's job is to PIN the partition so registry drift breaks it. Importing would create a pointer to the thing under test."
  - "Excluded tier corrections: accordion, dialog, dropdown are 'organisms' (not 'molecules' as the plan read_first comments implied). Verified against registry source; tests updated to match truth."
  - "Task 3 coverage gap-closing was NOT needed: all 4 target modules already ≥ 80% line coverage from prior plans' tests (24-02/04/05/06). No additional tests added."

patterns-established:
  - "Route-level integration tests: mock next/navigation's useSearchParams, render ComponentPageClient directly, assert via ARIA roles from jsdom. Repeatable for any future route-level test."
  - "describe.each(PARTITION) pattern for enumerated-set invariants. If Phase 25+ adds another component, it goes in ENABLED or EXCLUDED (not both, not neither) — this test catches the omission."

requirements-completed: [ARTAX-08]

# Metrics
duration: ~8min
completed: 2026-04-17
---

# Phase 24 Plan 7: Route-Level Integration Tests Summary

**Two new regression layers: (1) a 28-test `playground-routes.test.tsx` suite pinning the 11-enabled / 4-excluded Playground tab partition and exercising URL → form round-trip hydration; (2) a 2-assertion extension to `component-routes.test.ts` that locks `getAllComponents()` at 15 and asserts set-equality with `generateStaticParams()` output.**

## Performance

- **Duration:** ~8 min
- **Tasks:** 3 (2 test-writing, 1 verification-only)
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- Playground tab visibility matrix pinned at the route-integration layer. 11 `describe.each`-generated tests assert the Playground tab trigger is present; 4 further `describe.each`-generated tests assert it is absent for the trigger-based components (tooltip, accordion, dialog, dropdown).
- URL round-trip integration locked: `?p[variant]=outline` → variant select value `"outline"`; `?p[size]=sm` → size select value `"sm"`; combined params hydrate both; unknown `p[bogus]=x` keys do not crash and do not produce controls.
- Partition size guard: `ENABLED.length === 11`, `EXCLUDED.length === 4`, plus a double-check that each slug in each list resolves to a real registry entry with the expected `playground?.enabled` truthiness.
- Registry size guard extension: `getAllComponents().length === 15` and the `generateStaticParams()` output forms an exact set-equal to the registry's `${tier}/${slug}` keys. Any future drift (adding a 16th component, renaming a slug, swapping a tier) breaks this test before build time.
- Full suite: 148/148 tests passing, up from 118 in 24-06.
- Coverage snapshot for the four Playground modules captured below — all ≥ 80% line coverage on first read.

## Task Commits

1. **Task 1: playground-routes regression suite** — `80af7b6` (test)
2. **Task 2: component-routes size guard** — `0e32449` (test)
3. **Task 3: full-suite + coverage gate** — no commit (verification-only task)

**Plan metadata:** pending (this SUMMARY + state updates, separate commit).

## Files Created/Modified

- `apps/artax/tests/playground-routes.test.tsx` (created) — 28 tests across 3 `describe` blocks: Playground tab visibility (enabled 11 × 1 test + excluded 4 × 2 tests = 19), URL round-trip hydration (5), partition size guard (4). Mocks `next/navigation.useSearchParams`, `@/lib/playground-url-state.pushPlaygroundParams`, and `react-live`.
- `apps/artax/tests/component-routes.test.ts` (modified) — Added `describe('registry size guard', …)` block with 2 `it(…)` assertions. 3 existing assertions intact; total suite now 5 tests.

## Coverage Report (four target modules)

| Module | % Lines | % Stmts | % Branch | % Funcs | Gate (≥ 80% lines) |
| ------ | ------- | ------- | -------- | ------- | ------------------ |
| `src/lib/playground-url-state.ts` | **100%** | 100% | 75% | 100% | PASS |
| `src/lib/playground-prop-coercion.ts` | **100%** | 100% | 100% | 100% | PASS |
| `src/components/playground-props-form.tsx` | **90.9%** | 90.9% | 91.66% | 77.77% | PASS |
| `src/components/component-playground.tsx` | **96.42%** | 93.93% | 83.33% | 77.77% | PASS |

All four modules cleared the 80% line coverage bar on first read. No gap-closing tests were added (Task 3 step 3 condition not triggered).

## 15-Slug Matrix Asserted

**Enabled (11 — Playground tab rendered):**
- atoms: button, input, badge, separator, copy-button, toggle
- molecules: card, table, callout, code-block, tabs

**Excluded (4 — Playground tab omitted):**
- molecules: tooltip
- organisms: accordion, dialog, dropdown

**Total: 15** — matches `getAllComponents().length` assertion in `component-routes.test.ts` and the 15 static params emitted by `generateStaticParams`.

## Decisions Made

- **File extension `.tsx` not `.ts`.** The plan's frontmatter and the `<files_modified>` block both listed the path as `playground-routes.test.ts`. That path cannot host JSX under ts-jest — TS1005 / TS1109 compile errors. Renamed to `.tsx` immediately after the first test run failed with compile errors. No behavioral impact; the jest test glob (`<rootDir>/tests` with `testPathIgnorePatterns` defaults) matches `.tsx` files the same as `.ts`. Per-file ABOUTME and jsdom docblock semantics unchanged.
- **Partition duplicated locally (not imported).** The `ENABLED` and `EXCLUDED` arrays are hardcoded in the test file rather than derived from `getAllComponents().filter(…)`. This is deliberate: the test's job is to pin the partition so registry drift breaks it. Deriving the list from the registry would create a tautology (test passes because it asks the registry about the registry). Locality-of-intent beats DRY here.
- **Task 3 coverage gap-closing skipped.** The plan allowed for adding targeted tests if any of the four modules fell below 80% line coverage. All four cleared the bar, so no additional tests were written. Recording the numbers above for phase auditability.
- **Lint warnings out of scope.** `pnpm --filter artax lint` surfaces 6 pre-existing `@eslint-react/no-unnecessary-use-prefix` warnings in `props-table.test.ts` and `sidebar.test.ts`. These predate 24-07 (they're in 23-era test files) and are out of this plan's scope per the Scope Boundary rule. Logged here as an observation, not fixed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] JSX in a `.ts` file fails to compile**
- **Found during:** Task 1 (first test run)
- **Issue:** Plan spec listed the path as `apps/artax/tests/playground-routes.test.ts`. ts-jest compiled with `tsconfig.test.json` rejects JSX (`<ComponentPageClient … />`) in `.ts` files: 18 TS1005/TS1109 errors.
- **Fix:** Renamed the file to `.tsx` via `mv`. Re-ran the suite; 4 test failures surfaced (below), all content-correctness issues resolved in the next auto-fix.
- **Files modified:** `apps/artax/tests/playground-routes.test.tsx` (renamed from `.ts`)
- **Committed in:** `80af7b6`

**2. [Rule 1 — Bug] Excluded-component tier mapping wrong**
- **Found during:** Task 1 (second test run, post-rename)
- **Issue:** Initial `EXCLUDED` array in the test listed all 4 components as `tier: 'molecules'`. Registry source shows accordion (line 848), dialog (line 940), and dropdown (line 1041) are `tier: 'organisms'`. `getComponent(…)` returned `undefined` for those three, causing `ComponentPageClient` to early-return null, which meant the "Code / Props tabs still present" assertions found nothing. Also the `partition size guard › every EXCLUDED slug resolves to a registered component` test caught the same bug from a different angle.
- **Fix:** Updated `EXCLUDED` array: accordion, dialog, dropdown → `tier: 'organisms'`; tooltip stays `tier: 'molecules'`. Re-ran suite — 28/28 green.
- **Files modified:** `apps/artax/tests/playground-routes.test.tsx`
- **Committed in:** `80af7b6` (same commit as the rename — both fixes landed together before the first commit was finalized)

### No Rule 2 or Rule 4 deviations

No missing critical functionality or architectural decisions triggered. Plan executed exactly as written except for the two auto-fixes above.

## Issues Encountered

- None post-fix. Typecheck, build, and full suite all green.

## Verification Results

- `pnpm --filter artax test -- playground-routes` — **28/28 passed**
- `pnpm --filter artax test -- component-routes` — **5/5 passed** (3 pre-existing + 2 new)
- `pnpm --filter artax test --coverage` — **148/148 passed** across 15 suites; coverage report above
- `pnpm --filter artax typecheck` — **passed** (no output)
- `pnpm --filter artax build` — **compiled successfully**; 21 static pages generated, 15 component paths included (`● /components/[tier]/[component]` with atoms/button, input, badge + 12 more)
- `pnpm --filter artax lint` — **0 errors**, 6 pre-existing warnings in unrelated 23-era test files (out of scope)
- `grep -c "toHaveLength(15)" apps/artax/tests/component-routes.test.ts` — **2** (≥ 1 per done-criteria)

## Phase 24 Closure Readiness

This is the final plan of phase 24. With 24-07 merged:

- All 7 plans complete: 24-01 (spike), 24-02 (url-state), 24-03 (registry), 24-04 (props-form), 24-05 (ComponentPlayground), 24-06 (JSX editor), 24-07 (route tests).
- ARTAX-08 fully satisfied (per 24-06 summary: props-form + JSX editor both shipped).
- ROADMAP success criteria #1 (react-live spike VERDICT: PASS) and #2 (user-editable props/data that update the preview in real time — JSX editor via react-live LiveProvider) both met.
- Exclusion list is pinned in three places: source (by omission in `component-registry.ts`), plan 24-03 unit tests, plan 24-07 route tests. Drift in any one breaks at least one test.
- No stubs, no deferred-items.md entries created during 24-07.
- Ready for `/gsd-verify-work`.

## Self-Check: PASSED

- `apps/artax/tests/playground-routes.test.tsx` — FOUND
- `apps/artax/tests/component-routes.test.ts` — modified (registry size guard describe block confirmed)
- Commit `80af7b6` (test: playground-routes) — FOUND in `git log --oneline`
- Commit `0e32449` (test: size guard) — FOUND in `git log --oneline`
- `pnpm --filter artax test` — 148/148 passed (15 suites)
- `pnpm --filter artax typecheck` — passed
- `pnpm --filter artax build` — 21 static pages generated, 15 component paths
- `grep -c "toHaveLength(15)" apps/artax/tests/component-routes.test.ts` — 2
- ENABLED.length === 11 and EXCLUDED.length === 4 both asserted in new tests — confirmed passing

## TDD Gate Compliance

This plan's frontmatter declares `type: execute` (not `type: tdd`), and the plan's `<objective>` explicitly states: "these tasks are integration/regression tests written AGAINST already-shipped code from 24-05 and 24-06. They are NOT TDD — there is no RED→GREEN→REFACTOR cycle because the implementation is already locked. Tests should pass on first run."

Both tasks followed that non-TDD posture. Task 1 tests went from failing (path+tier errors) to passing via content-correctness fixes, not via implementation. Task 2 tests passed on first run. No RED gate commit is required or expected. Commits are `test(24-07): …` because the only changes are test files.

---
*Phase: 24-editable-previews*
*Completed: 2026-04-17*
