---
phase: 24-editable-previews
plan: 4
subsystem: ui
tags: [props-form, controlled-state, type-dispatch, tdd, jest-dom, always-ships]

# Dependency graph
requires:
  - phase: 24-editable-previews
    provides: parsePropType + ControlType discriminated union (24-02)
  - phase: 24-editable-previews
    provides: ComponentDef.playground?.enabled opt-in field (24-03 — consumed by 24-05, not this plan)
provides:
  - PlaygroundPropsForm — controlled leaf component driven by PropDef[] + values + onChange
  - jest.setup.ts wiring @testing-library/jest-dom matchers for every jsdom suite in apps/artax
affects: [24-05-playground-tab-wiring, 24-06-jsx-editor, 24-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Client-side controlled-form component that keeps all state in Record<string, string> — boolean coerced to 'true'/'false' at the boundary
    - Type-dispatched control rendering via parsePropType(prop.type).kind (boolean / select / number / text)
    - Native <select> for string-literal unions (avoids Radix portal conflicts inside the preview canvas per D-06)
    - jest.setup.ts + setupFilesAfterEnv so jest-dom matchers are ambient for all suites (not per-suite wired)
    - Pre-filter step for exclusion rules (prop.name === 'children' || prop.type.includes('=>')) keeps dispatch cases simple
    - Test query strategy: getByText for Radix Toggle buttons — wrapping <label> does not propagate an accessible name to a <button> in dom-accessibility-api, so name-based getByRole queries do not match

key-files:
  created:
    - apps/artax/src/components/playground-props-form.tsx
    - apps/artax/tests/playground-props-form.test.tsx
    - apps/artax/jest.setup.ts
  modified:
    - apps/artax/jest.config.ts

key-decisions:
  - "Corrected 'setupFilesAfterEach' in the plan text to Jest's actual option name 'setupFilesAfterEnv' — the former is not a Jest configuration key, the latter is the canonical post-environment hook (per Jest docs v30)"
  - "@testing-library/react, @testing-library/user-event, and @testing-library/jest-dom were already present in apps/artax/package.json at the time of execution — no pnpm add needed; the install step from Task 1 reduced to a no-op"
  - "Test queries for Radix Toggle use getByText('disabled') instead of getByRole('button', { name: /disabled/i }) — wrapping the <button> in a <label> does not give the button an accessible name under the WAI-ARIA accessible-name algorithm that dom-accessibility-api implements"

patterns-established:
  - "jsdom RTL test file pattern: `/** @jest-environment jsdom */` docblock first, then two ABOUTME lines, then imports. Matches the existing convention in tests/component-preview.test.ts and tests/props-table.test.ts."
  - "Controlled-form pattern with string-serialized state: callers hold Record<string, string>, component merges via { ...values, [name]: value } on every change and calls onChange with the merged object — no internal useState."

requirements-completed: [ARTAX-08]

# Metrics
duration: ~20min
completed: 2026-04-19
---

# Phase 24 Plan 4: PlaygroundPropsForm Summary

**Always-ships controlled form: renders one control per PropDef (Toggle / native select / number Input / text Input) driven by parsePropType; jest-dom matchers now ambient across every jsdom suite in apps/artax via a new jest.setup.ts.**

## Performance

- **Duration:** ~20 min
- **Tasks:** 3 (1 chore config, 2 TDD RED+GREEN)
- **Files created:** 3
- **Files modified:** 1
- **Tests after:** 102 passing (was 93 before this plan — +9 new tests)

## Accomplishments

- `PlaygroundPropsForm` exports a controlled leaf component with the exact `{ props, values, onChange }` interface the plan specified. No `useState` internally; the parent owns the `Record<string, string>` state.
- Control dispatch via `parsePropType(prop.type).kind`:
  - `boolean` → `<Toggle pressed onPressedChange>` from `artax-ui` (Radix-backed)
  - `select` → native `<select>` with `control.options.map(...)` — no Radix `Dropdown`, per D-06
  - `number` → `<Input type="number">` from `artax-ui`
  - `text` (fallback) → `<Input type="text">`
- Exclusion rules enforced in a single `.filter()` step: props named `children` and props whose `type` contains `=>` render nothing.
- Empty state: when `visibleProps.length === 0`, renders the canonical `No props documented` copy in `text-sm text-muted-foreground py-4`.
- `jest.setup.ts` imports `@testing-library/jest-dom` once; `jest.config.ts` references it via `setupFilesAfterEnv`. All downstream jsdom suites (24-05/06/07 and retro fits for component-preview/props-table) now get `toHaveValue`, `toBeInTheDocument`, etc. for free.
- Full `pnpm test` green (12 suites / 102 tests) and `pnpm typecheck` clean.

## artax-ui primitives consumed

- `Toggle` — Radix-backed toggle button, `pressed` / `onPressedChange` API. Renders a native `<button>` with `aria-pressed`.
- `Input` — thin wrapper over `<input>`, used for both `type="number"` and `type="text"` cases.

_Intentionally NOT consumed: `Dropdown` family_ — the plan (and D-06) mandate native `<select>` to avoid Radix portal conflicts inside the preview canvas. Confirmed by `grep -E "Dropdown|react-live" apps/artax/src/components/playground-props-form.tsx` returning 0 matches.

## Boolean / string serialization handling

- **Parent → component:** values flow in as `Record<string, string>`. For a boolean prop, the component reads `values[prop.name] === 'true'` and passes that boolean into `<Toggle pressed={...}>`.
- **Component → parent:** `onPressedChange(v)` receives the next boolean, and the component calls `update(prop.name, String(v))` — serializing `true`/`false` back to the flat string map.
- **Design intent:** keeping the state shape a flat `Record<string, string>` simplifies URL-encoding (plan 24-02's `encodePlaygroundParams` expects strings) and avoids a parallel type-per-prop scheme. The string-to-native coercion for preview rendering is plan 24-05's concern, not this plan's.

## @testing-library dev dependencies

All three packages were already present in `apps/artax/package.json` at the start of this plan:

| Package                         | Version | Already installed? |
| ------------------------------- | ------- | ------------------ |
| `@testing-library/react`        | 16.3.2  | Yes                |
| `@testing-library/user-event`   | _(not present; also not imported by this plan's tests)_ | N/A |
| `@testing-library/jest-dom`     | 6.9.1   | Yes                |

Note: `@testing-library/user-event` is **not** in `package.json`, and this plan did not install it — the tests use `fireEvent` from `@testing-library/react` for the two interaction assertions (a `change` on `<select>` and a `click` on the toggle). If a downstream plan (24-05/06) needs richer user simulation, `pnpm --filter artax add -D @testing-library/user-event` will be a one-line addition.

## Task Commits

1. **Task 1 chore: wire jest-dom setup file** — `e0f536e` (chore)
2. **Task 2 RED: failing tests for PlaygroundPropsForm** — `e2e6849` (test)
3. **Task 3 GREEN: implement PlaygroundPropsForm** — `8b146f5` (feat)

No REFACTOR commit — the initial GREEN implementation already matched the PATTERNS.md sketch exactly; cleanup would have been a no-op.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Jest config option name**
- **Found during:** Task 1
- **Issue:** The plan's `<action>` block instructed to add `setupFilesAfterEach: ['<rootDir>/jest.setup.ts']`. `setupFilesAfterEach` is not a Jest configuration key — Jest's canonical option that runs a module after the test framework is installed is `setupFilesAfterEnv`.
- **Fix:** Used `setupFilesAfterEnv` in `jest.config.ts`. Verified against Jest v30 docs via ctx7.
- **Files modified:** `apps/artax/jest.config.ts`
- **Commit:** `e0f536e`

**2. [Rule 1 — Bug] Toggle accessibility query strategy**
- **Found during:** Task 3 (GREEN run)
- **Issue:** The RED test file queried the Radix Toggle button via `screen.getByRole('button', { name: /disabled/i })`, assuming the wrapping `<label>...<button>disabled</button></label>` would give the button an accessible name. RTL uses `dom-accessibility-api`, which follows the WAI-ARIA accessible-name algorithm: a `<label>` does not propagate its text to a `<button>` descendant (labels only name associated form controls — typically input/textarea/select). Both Toggle tests failed on the lookup even though the DOM was correct.
- **Fix:** Switched both Toggle assertions to `screen.getByText('disabled')`, then asserted `toggle.tagName === 'BUTTON'` and the `aria-pressed` attribute from there. The behavior under test is unchanged; only the query strategy moved from accessible-name to text-content.
- **Files modified:** `apps/artax/tests/playground-props-form.test.tsx`
- **Commit:** `8b146f5` (same commit as the GREEN impl because both landed together after verifying the full suite)

### Plan-sketch deviations (cosmetic / optional)

- **@testing-library install step was a no-op:** Task 1 step 1 said to install three packages with `pnpm --filter artax add -D`, but all three (save `user-event`) were already in `devDependencies`. No commands were run and no lockfile change was introduced. `user-event` was not needed and was not added. Noted in the commit body for Task 1.

No architectural (Rule 4) deviations surfaced.

## Issues Encountered

- **pnpm wrapper segfault (environment only):** `pnpm --filter artax test` segfaulted once in the shell. Running from inside `apps/artax` via `cd apps/artax && pnpm test` worked every time. Not a code issue; a known pnpm shim quirk on this workstation.

## User Setup Required

None.

## Next Phase Readiness

- `24-05` (playground tab wiring) can now import `PlaygroundPropsForm` directly, pass it the component's `props` / a controlled `values` state / an `onChange` handler, and wire the result to `pushPlaygroundParams` from plan 24-02 (debounced per RESEARCH Pattern 2).
- `24-06` (react-live JSX editor) and `24-07` (overall playground polish) inherit the ambient jest-dom matcher setup — no per-suite wiring needed.
- No blockers. Wave 2 (this plan) is closed; Wave 3 is unblocked.

## Self-Check: PASSED

- [x] `apps/artax/src/components/playground-props-form.tsx` exists
- [x] `apps/artax/tests/playground-props-form.test.tsx` exists
- [x] `apps/artax/jest.setup.ts` exists
- [x] `apps/artax/jest.config.ts` references `setupFilesAfterEnv`
- [x] Commit `e0f536e` (chore) found in `git log`
- [x] Commit `e2e6849` (test) found in `git log`
- [x] Commit `8b146f5` (feat) found in `git log`
- [x] `pnpm --filter artax test` → 12 suites / 102 tests, all green
- [x] `pnpm --filter artax typecheck` → passes
- [x] `grep -c "'use client'" apps/artax/src/components/playground-props-form.tsx` → 1
- [x] `grep -E "(Dropdown|react-live)" apps/artax/src/components/playground-props-form.tsx` → 0 matches
- [x] Test suite query verified: `screen.getByRole('combobox')` resolves the native `<select>`, satisfying the D-06 "no Radix Dropdown" invariant at the test layer too

---
*Phase: 24-editable-previews*
*Completed: 2026-04-19*
