---
phase: 24-editable-previews
plan: 2
subsystem: ui
tags: [url-state, prop-coercion, pure-module, tdd, jest]

# Dependency graph
requires:
  - phase: 23-component-catalog-documentation
    provides: component-registry.ts (ComponentDef/PropDef shapes that parsePropType classifies)
provides:
  - encodePlaygroundParams / decodePlaygroundParams / pushPlaygroundParams (URL-state API for Playground)
  - ControlType discriminated union + parsePropType heuristic (PropDef.type -> form control)
affects: [24-04-props-form, 24-05-playground-tab-wiring, 24-06-jsx-editor]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure data-shaped modules for testable playground logic (no React/DOM imports)
    - URL state via URLSearchParams + window.history.pushState (shallow, no RSC re-fetch)
    - Regex-based TS literal-union parser as PropDef -> ControlType heuristic
    - Jest docblock `/** @jest-environment jsdom */` to override the default node env per-file

key-files:
  created:
    - apps/artax/src/lib/playground-url-state.ts
    - apps/artax/src/lib/playground-prop-coercion.ts
    - apps/artax/tests/playground-url-state.test.ts
    - apps/artax/tests/playground-prop-coercion.test.ts
  modified: []

key-decisions:
  - "URL helper does not own non-playground query params: callers merge with any site-level params before pushing"
  - "pushPlaygroundParams writes only the pathname when the encoded payload is empty (prevents a trailing '?' in the URL)"
  - "Data-driven coercion test pins the heuristic to every real PropDef.type in the registry, failing loudly if a new shape appears"

patterns-established:
  - "Pure-module TDD: RED (test commit) → GREEN (impl commit) — no extra refactor commit when the initial impl already carries the extracted literalUnionRe constant"
  - "Round-trip assertion via decode(URLSearchParams(encode(x))) avoids coupling tests to URLSearchParams' bracket-encoding choice"

requirements-completed: [ARTAX-08]

# Metrics
duration: 14min
completed: 2026-04-19
---

# Phase 24 Plan 2: URL-state + prop-coercion foundation Summary

**TDD-first delivery of two pure modules: `?p[*]=` URL-state encode/decode/push helpers (shallow pushState, no RSC re-fetch) and a regex-based `PropDef.type -> ControlType` parser covering every live registry prop shape.**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-04-19T03:30:00Z
- **Completed:** 2026-04-19T03:44:22Z
- **Tasks:** 2 (both TDD)
- **Files created:** 4

## Accomplishments

- `playground-url-state.ts` ships `encodePlaygroundParams`, `decodePlaygroundParams`, and `pushPlaygroundParams` with round-trip-tested encode/decode under the `p[*]` namespace and a jsdom-stubbed `window.history.pushState` path verified by `jest.spyOn`.
- `playground-prop-coercion.ts` ships `ControlType` + `parsePropType` as a pure module (0 imports) — classified as `boolean | number | select | text` with a shared `literalUnionRe` constant.
- Data-driven test pins the coercion heuristic against **16 distinct PropDef.type strings** exercised across all 15 registry components; every real `prop.type` in the registry now has an expected `ControlType.kind` anchor.
- Full `pnpm --filter artax typecheck` passes; all 24 new test cases green; broader suite untouched.

## Task Commits

1. **Task 1 RED: failing tests for playground-url-state** — `5e00174` (test)
2. **Task 1 GREEN: implement playground-url-state helpers** — `2aecf74` (feat)
3. **Task 2 RED: failing tests for playground-prop-coercion** — `6561eb0` (test)
4. **Task 2 GREEN: implement parsePropType heuristic** — `1eb7b8f` (feat)

_No REFACTOR commit — the initial GREEN implementation already extracted `literalUnionRe` as a named constant, so refactor would have been a no-op._

## Files Created/Modified

- `apps/artax/src/lib/playground-url-state.ts` — URL-state encode/decode/push helpers (45 lines, no `'use client'`, no React imports)
- `apps/artax/src/lib/playground-prop-coercion.ts` — `ControlType` union + `parsePropType` (35 lines, zero imports)
- `apps/artax/tests/playground-url-state.test.ts` — 12 tests; `/** @jest-environment jsdom */` for pushState spy (99 lines)
- `apps/artax/tests/playground-prop-coercion.test.ts` — 12 tests including a data-driven pass over every live registry `PropDef.type` (127 lines)

## Decisions Made

- **Empty-payload pathname-only push:** When `encodePlaygroundParams({})` returns `''`, `pushPlaygroundParams` writes just `window.location.pathname` rather than `pathname + '?'`. Cleaner URL when the user clears all playground state. Not in the plan's bullets but a trivial correctness nicety that kept test assertions simple.
- **Round-trip asserted via decode(encode(x)):** Rather than pinning exact query-string bytes (URLSearchParams may emit `%5B` vs `[`), tests assert the round-trip equality. This matches the plan's `<behavior>` guidance verbatim.
- **Coercion test expectation table:** Rather than iterate blindly and assert `typeof kind === 'string'`, the data-driven test carries an explicit `EXPECTED_KIND_BY_TYPE` map covering all 16 live registry `prop.type` strings. A future registry addition introducing an unknown `prop.type` will fail the test loudly — drift is visible in review.

## Deviations from Plan

None — plan executed exactly as written. No Rule 1/2/3 auto-fixes triggered; no Rule 4 architectural questions surfaced.

## Issues Encountered

None. All tests went RED-then-GREEN on the first attempt per task. Husky (Prettier + ESLint + typecheck) passed all four commits without intervention.

## Notable Edge Cases Pinned

- **Input.type's trailing `...`:** `"'text' | 'email' | 'password' | 'number' | 'search' | ..."` deliberately does *not* match `literalUnionRe` and falls through to `{ kind: 'text' }`. Acceptable per RESEARCH Pattern 3; the test explicitly documents the fallback contract.
- **Callback signatures:** `(pressed: boolean) => void`, `(value: string) => void`, `(open: boolean) => void` all fall through to `{ kind: 'text' }`. They won't be rendered as text inputs in practice — the props-form (24-04) excludes props whose `type.includes('=>')` before dispatching — but the parser's fallback is deterministic.
- **Mixed `string | string[]` union:** Not a pure literal union; falls through to text as expected.

## User Setup Required

None — no external services, no env vars.

## Next Phase Readiness

- `24-04` (props-form) can import `parsePropType` + `ControlType` directly and dispatch on `.kind` to render Toggle / native `<select>` / `Input`.
- `24-05` (playground tab wiring) can import `pushPlaygroundParams` for keystroke-driven URL syncing (plan 24-05 will add the 300ms debounce wrapper per RESEARCH Pattern 2).
- No blockers. Wave 1 (this plan) is fully closed; downstream waves are unblocked.

## Self-Check: PASSED

- [x] `apps/artax/src/lib/playground-url-state.ts` exists
- [x] `apps/artax/src/lib/playground-prop-coercion.ts` exists
- [x] `apps/artax/tests/playground-url-state.test.ts` exists
- [x] `apps/artax/tests/playground-prop-coercion.test.ts` exists
- [x] Commit `5e00174` found in `git log`
- [x] Commit `2aecf74` found in `git log`
- [x] Commit `6561eb0` found in `git log`
- [x] Commit `1eb7b8f` found in `git log`
- [x] `pnpm --filter artax test -- playground-url-state playground-prop-coercion` exits green (24/24)
- [x] `pnpm --filter artax typecheck` passes
- [x] `grep "window.history.pushState" apps/artax/src/lib/playground-url-state.ts` matches
- [x] `grep -c "^import" apps/artax/src/lib/playground-prop-coercion.ts` returns 0
- [x] Neither module contains `'use client'`

---
*Phase: 24-editable-previews*
*Completed: 2026-04-19*
