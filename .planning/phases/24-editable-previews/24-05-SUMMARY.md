---
phase: 24-editable-previews
plan: 5
subsystem: ui
tags: [react, next-app-router, url-state, debounce, tabs, playground, jsdom]

requires:
  - phase: 24-editable-previews
    provides: "PlaygroundPropsForm (plan 04), playground-url-state (plan 02), ComponentDef.playground field (plan 03)"
provides:
  - ComponentPlayground client component (canvas + form + URL sync)
  - Conditional Playground tab on 11 component pages
  - URL p[*] state round-trip on mount and on change (pushState-only)
affects: [24-06, 24-07]

tech-stack:
  added: []
  patterns:
    - Hand-rolled setTimeout-ref debounce (no new dep for one call site)
    - Hook-safe gate via body-split (outer component returns null before any hooks)
    - ReadonlyURLSearchParams → URLSearchParams via toString() (Next.js 16 typing)

key-files:
  created:
    - apps/artax/src/components/component-playground.tsx
    - apps/artax/tests/component-playground.test.tsx
  modified:
    - apps/artax/src/components/component-page-client.tsx

key-decisions:
  - "Body-split pattern: outer ComponentPlayground returns null on disabled; PlaygroundBody hosts all hooks. Keeps React's hook-ordering contract intact without a conditional-hook lint suppression."
  - "Hand-rolled setTimeout ref for the 300ms debounce — single call site, no use-debounce or lodash.debounce dependency."
  - "Timer cleared on unmount AND on subsequent change (clearTimeout in handleChange) so rapid edits collapse into one push."
  - "Tests query disambiguated <select> elements by name attribute rather than getByRole('combobox') because Button exposes two literal-union props (variant + size)."

patterns-established:
  - "Body-split gate pattern for components with optional hook usage (excluded components stay hook-free)."
  - "useSearchParams → new URLSearchParams(searchParams.toString()) bridge for passing a mutable URLSearchParams into pure decoder helpers."

requirements-completed: [ARTAX-08]

duration: ~10min
completed: 2026-04-19
---

# Phase 24 Plan 5: Playground Tab Integration Summary

**ComponentPlayground client component renders dot-grid canvas + PlaygroundPropsForm with URL p[*] hydration on mount and a 300ms debounced pushState flush on every change — gated per-component by `comp.playground?.enabled`.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-19T04:20:50Z (session start)
- **Completed:** 2026-04-19T04:30:44Z
- **Tasks:** 2 (TDD RED + GREEN)
- **Files modified:** 3 (1 created: `component-playground.tsx`, 1 created: `component-playground.test.tsx`, 1 modified: `component-page-client.tsx`)

## Accomplishments

- Playground tab now appears on the 11 enabled component pages (atoms + molecules excluding dialog/dropdown/tooltip/accordion) as a conditional `<TabsTrigger>` + `<TabsContent>` pair after Code/Props.
- Excluded components render zero Playground UI (outer guard returns `null` before any hooks run).
- Initial form state hydrates from `?p[*]=` params on mount via `decodePlaygroundParams(new URLSearchParams(searchParams.toString()))`.
- Every form change is debounced 300ms and flushed via `pushPlaygroundParams` — URL updates without triggering an RSC re-fetch (pushState path, per D-04).
- Canvas reuses `bg-[radial-gradient(...)]` + `min-h-[120px] p-6` classes verbatim from `ComponentPreview` so the playground-canvas and preview-strip aesthetic stays identical.
- Preview renders the registry default (`comp.preview()` with no arg); full prop→preview wiring remains deferred.
- Top-of-page static `<ComponentPreview>` strip is untouched; `defaultValue="code"` on the Tabs is untouched; Playground is discoverable, not default.

## Task Commits

1. **Task 1 — RED: failing tests for ComponentPlayground** — `1622af4` (test)
2. **Task 2 — GREEN: ComponentPlayground implementation + component-page-client wiring** — `926c29a` (feat)

**Plan metadata:** pending (this SUMMARY + state updates, separate commit)

## Files Created/Modified

- `apps/artax/src/components/component-playground.tsx` (created) — Client component: gate + canvas + '// playground' label + PlaygroundPropsForm + URL hydration + 300ms debounced push.
- `apps/artax/tests/component-playground.test.tsx` (created) — jsdom suite: canvas/form layout, excluded-component null return, section label, URL hydration (variant + size), 300ms debounce, rapid-change collapse.
- `apps/artax/src/components/component-page-client.tsx` (modified) — Added `ComponentPlayground` import, conditional `<TabsTrigger value="playground">`, and conditional `<TabsContent value="playground">`.

## Decisions Made

- **Body-split gate:** outer `ComponentPlayground` returns `null` when `!comp.playground?.enabled`; inner `PlaygroundBody` holds all hooks. This avoids the React hook-ordering footgun (hooks must be called unconditionally in the same order on every render). Plan wording suggested a single-component gate with `useSearchParams` above the null-return — that would fail React's rules-of-hooks on the 4 excluded components. Split is idiomatic and requires no lint suppression.
- **Hand-rolled debounce:** one call site, no new dep. A `useRef<ReturnType<typeof setTimeout> | null>` pattern, clearing on every change and on unmount. No `use-debounce`, no `lodash.debounce`.
- **useSearchParams typing (Next.js 16):** `useSearchParams()` returns `ReadonlyURLSearchParams | null`. Bridged via `new URLSearchParams(searchParams.toString())` so `decodePlaygroundParams` can consume a mutable `URLSearchParams` without widening its signature.
- **Test query strategy:** Button registry entry defines two literal-union props (`variant` and `size`) — both render as `<select>`. `getByRole('combobox')` matches multiple and throws. Tests disambiguate by `container.querySelector('select[name="variant"]')`, matching how `playground-props-form.test.tsx` queries inputs by name.

## Deviations from Plan

None — plan executed exactly as written, with two small enhancements resolved inline:

1. **Body-split for hook safety** — the plan's sample code calls `useSearchParams` above `if (!comp.playground?.enabled) return null`, which would violate rules-of-hooks on excluded components. Resolved by splitting into `ComponentPlayground` (gate) + `PlaygroundBody` (hooks). No behavioral change versus the plan spec; the gate still returns `null` for excluded components and the hooks still run unconditionally inside the body.
2. **Test disambiguation** — Button has two literal-union props, so `getByRole('combobox')` is ambiguous. Switched to `container.querySelector('select[name="variant"]')`. Same behavior asserted, cleaner queries.

Neither qualifies as a Rule 1/2/3 deviation — both are minor refinements of the plan's example code that keep the exact same runtime contract.

## Issues Encountered

- None. Build and typecheck passed on first try after initial RED/GREEN cycle.

## ROADMAP Alignment Caveat

Per the plan's `<deferred>` block: ROADMAP success criterion #2 ("component previews accept user-editable props/data that update the preview in real time") is **not** satisfied by this plan. The props-form path ships URL-shareable state only; the canvas still renders `comp.preview()` with no props threaded in. Real-time prop→preview wiring is routed through plan 24-06's JSX editor (LiveProvider re-renders on every keystroke). If the react-live spike had failed, criterion #2 would need escalation before `/gsd-verify-work`. Spike already passed (24-01), so 24-06 is the path forward.

A future plan extending `ComponentDef.preview(props: Record<string, string>)` would let the props-form drive the canvas directly — candidate for a Phase 24 follow-up plan or a later phase.

## Self-Check: PASSED

- `apps/artax/src/components/component-playground.tsx` — FOUND
- `apps/artax/tests/component-playground.test.tsx` — FOUND
- `apps/artax/src/components/component-page-client.tsx` — modified (2 × `comp.playground?.enabled` matches confirmed via grep)
- Commit `1622af4` (test: RED) — FOUND in `git log --oneline`
- Commit `926c29a` (feat: GREEN) — FOUND in `git log --oneline`
- `pnpm --filter artax test` — 108/108 passed (13 suites)
- `pnpm --filter artax typecheck` — passed
- `pnpm --filter artax build` — compiled (21 static pages generated)
- `grep -c "comp.playground?.enabled" component-page-client.tsx` — 2 (expected)
- `grep -c "ComponentPreview" component-page-client.tsx` — 2 (import + usage, unchanged)
- `grep -c "react-live" component-playground.tsx` — 0 (correctly NOT imported; 24-06's layer)

## Next Phase Readiness

- Plan 24-06 (JSX editor via react-live) slots into `ComponentPlayground` as a second panel beneath the canvas. No further refactor needed to accommodate it — the `PlaygroundBody` layout is `space-y-4` with the form as the last child, so a `<PlaygroundJsxEditor>` can be inserted above or below the form without disturbing the canvas.
- Plan 24-07 (route-level integration tests) should cover the URL round-trip end-to-end (visit `/components/atoms/button?p[variant]=outline`, assert form pre-selected, change a value, assert `window.history.pushState` called with merged params). The unit tests here mock `pushPlaygroundParams`; the integration tests should exercise the real helper.

---
*Phase: 24-editable-previews*
*Completed: 2026-04-19*
