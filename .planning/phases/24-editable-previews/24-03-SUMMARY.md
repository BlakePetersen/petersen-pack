---
phase: 24-editable-previews
plan: 3
subsystem: ui
tags: [registry, opt-in, schema-extension, tdd, jest]

# Dependency graph
requires:
  - phase: 23-component-catalog-documentation
    provides: component-registry.ts (ComponentDef shape extended here)
  - phase: 24-editable-previews
    provides: 24-01 spike PASS verdict (react-live compat confirmed; Playground is buildable)
provides:
  - ComponentDef.playground?: { enabled: boolean; defaultExampleIndex?: number }
  - 11 components marked playground.enabled = true; 4 (tooltip/accordion/dialog/dropdown) deliberately omit the field
  - Regression test locking the exclusion list to 24-CONTEXT D-05
affects: [24-05-playground-tab-wiring]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Additive optional schema extension — no existing consumer needs updates
    - Exclusion list encoded twice (source by omission + test by literal array) so drift fails loudly

key-files:
  created: []
  modified:
    - apps/artax/src/lib/component-registry.ts
    - apps/artax/tests/component-registry.test.ts

key-decisions:
  - "Exclusion expressed by field omission, not playground.enabled=false — keeps the registry data surface minimal for excluded components"
  - "No defaultExampleIndex populated on any entry — index 0 is the sensible default for all 11, so the field stays absent per YAGNI"
  - "Test holds ENABLED_PLAYGROUND_SLUGS + EXCLUDED_PLAYGROUND_SLUGS as literal arrays (not derived from registry) — adding a new component without deliberate opt-in/opt-out choice fails the partition test"

patterns-established:
  - "TDD schema-extension: RED test commit pinning exclusion-list invariant → GREEN interface+data commit adding the field and populating the 11 entries"

requirements-completed: [ARTAX-08]

# Metrics
duration: ~10min
completed: 2026-04-19
---

# Phase 24 Plan 3: ComponentDef playground opt-in Summary

**Single source of truth for Playground enablement: `ComponentDef.playground?.enabled` is `true` on 11 components and absent on 4 (Tooltip, Accordion, Dialog, Dropdown), locked by a partition test so future registry additions can't silently flip Playground on for trigger-based components.**

## Accomplishments

- `ComponentDef` gains `playground?: { enabled: boolean; defaultExampleIndex?: number }` — additive, optional; no existing consumer breaks.
- 11 enabled entries populated: `button, input, badge, separator, copy-button, toggle, card, table, callout, code-block, tabs`.
- 4 entries deliberately omit the field: `tooltip, accordion, dialog, dropdown`.
- 5 new tests added in a `describe('playground opt-in', ...)` block asserting count, enabled set, excluded set, exact partition of the registry, and `defaultExampleIndex` bounds when present.
- `pnpm --filter artax test -- component-registry` → 22/22 passing.
- `pnpm --filter artax typecheck` → clean.

## Enabled Playground components (11)

| Slug         | Tier      | Form-control rationale                                     |
| ------------ | --------- | ---------------------------------------------------------- |
| button       | atoms     | variant + size + disabled all expressible                  |
| input        | atoms     | type, placeholder, disabled — native form controls         |
| badge        | atoms     | variant → select                                           |
| separator    | atoms     | orientation → select                                       |
| copy-button  | atoms     | text → string input                                        |
| toggle       | atoms     | pressed / defaultPressed → boolean controls                |
| card         | molecules | className → string input; children skipped                 |
| table        | molecules | className → string input; children skipped                 |
| callout      | molecules | variant → select                                           |
| code-block   | molecules | filename, language, rawCode → string inputs                |
| tabs         | molecules | defaultValue → string input                                |

## Excluded Playground components (4)

| Slug      | Tier      | Exclusion rationale (24-RESEARCH Pattern 5)                                     |
| --------- | --------- | ------------------------------------------------------------------------------- |
| tooltip   | molecules | Requires TooltipProvider wrapper + hover state — single-render model breaks     |
| accordion | organisms | Multi-child composition — form can't express AccordionItem structure            |
| dialog    | organisms | Trigger-based; portal z-index conflicts with preview canvas                     |
| dropdown  | organisms | Same as dialog — trigger-based, portal escapes canvas bounds                    |

## Shape of the new field

```ts
export interface ComponentDef {
  // ... existing fields ...
  playground?: {
    enabled: boolean
    defaultExampleIndex?: number
  }
}
```

Reading pattern (used by 24-05): `comp.playground?.enabled` — `undefined` and `false` both resolve falsy, so a missing field is equivalent to disabled. This is why exclusion is encoded by omission rather than `playground: { enabled: false }`.

## Task Commits

1. **RED: failing tests for playground opt-in exclusion list** — `63bf31d` (test)
2. **GREEN: add playground opt-in to ComponentDef + 11 enabled entries** — `2364b58` (feat)

No REFACTOR commit — the field placement (`playground: { enabled: true },` as the last property of each enabled entry) is already uniform; nothing to clean up.

## Decisions Made

- **Exclusion by omission, not `enabled: false`:** Keeps the data surface minimal for the 4 excluded components — no reason to carry a playground object at all when the only information it holds is "no". The test's partition assertion still catches drift because `c.playground === undefined || c.playground.enabled === false` is the exclusion predicate.
- **`defaultExampleIndex` left unpopulated on all 11:** Index 0 is the sensible default for every enabled component's `codeExamples` array (the "Basic" example is always first). Populating the field would be premature — if 24-05 finds a component where index 0 isn't right, it can be added then.
- **Partition test is the drift gate:** If a new component is added in a future phase without a deliberate opt-in/opt-out decision, either the enabled count (11), the enabled set, the excluded set, or the partition invariant will fail — four independent anchors. Planner intent is encoded in the test source, not just in review discipline.

## Deviations from Plan

None. Plan executed exactly as written. No Rule 1/2/3 auto-fixes triggered; no Rule 4 architectural questions surfaced.

## Issues Encountered

None. RED fired exactly 3 expected failures (count, enabled set, excluded set) — partition and defaultExampleIndex tests passed trivially at RED because no `playground` field existed yet, so the set filters returned empty arrays for "enabled" and the full 15-slug set for "excluded or missing", which caused the excluded set test to fail loudly (not the partition test). GREEN flipped all three failing tests to passing on the first try.

## Self-Check: PASSED

- [x] `grep -c "playground: { enabled: true }" apps/artax/src/lib/component-registry.ts` → `11`
- [x] `ComponentDef` interface in `apps/artax/src/lib/component-registry.ts` has `playground?: { enabled: boolean; defaultExampleIndex?: number }`
- [x] Commit `63bf31d` found in `git log` (RED)
- [x] Commit `2364b58` found in `git log` (GREEN)
- [x] `pnpm --filter artax test -- component-registry` → 22/22 passing
- [x] `pnpm --filter artax typecheck` → passes
- [x] Tooltip, Accordion, Dialog, Dropdown entries have no `playground` field (verified via grep + test partition)

## Next Phase Readiness

- `24-05` (playground tab wiring) can import `getComponent(tier, slug)` and conditionally render the Playground tab via `comp.playground?.enabled`. Exactly 11 components will render the tab; the other 4 will show only Code + Props.
- `24-04` (props-form) doesn't read this field — it's a dumb renderer called only when 24-05 decides to mount it.
- No blockers for Wave 3.

---
*Phase: 24-editable-previews*
*Completed: 2026-04-19*
