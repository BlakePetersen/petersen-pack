---
phase: 27-schema-foundations
plan: 04
subsystem: schema-foundations

tags: [velite, cross-references, schema, mdx, dx-collections, build-time-validation]

requires:
  - phase: 27-schema-foundations
    provides: phase27-velite-runner.ts + dangling-cross-ref + valid-cross-ref fixture trees (Plan 00); per-collection bare-slug uniqueness (Plan 03)

provides:
  - Build-time enforcement that every DX `dependencies[]` / `related[]` value resolves to a real entry
  - Accumulator-then-throw cross-ref validator (D-04) inside Velite `prepare`, post-draft-filter (Risk #7)
  - Failure-path regression test asserting offending ref + field name + 'Broken cross-references' header
  - Happy-path canary asserting cross-collection refs continue to build green

affects: [27-05-calver-hash-gate, 28-scaffolds-and-lint, 29-content-density]

tech-stack:
  added: []
  patterns:
    - "Cross-collection integrity: build per-collection Set<fullPathSlug> from `data.<coll>` post-filter; walk DX items' dependencies/related; accumulate broken refs; throw once"
    - "Direct-equality lookup of `<collection>/<slug>` refs against the path-shaped `entry.slug` set — avoids the `.pop()` bug that breaks on nested slugs (e.g. skills/claude-code/writing-custom-skills)"

key-files:
  created:
    - apps/blakepetersen.io/tests/phase27-dangling-cross-ref.test.ts
  modified:
    - apps/blakepetersen.io/velite.config.ts

key-decisions:
  - "Deviation from plan's reference snippet: store path-shaped slugs in per-collection Sets and match the ref string directly, instead of `pop()`-ing the last segment. The plan's `(i) => i.slug.split('/').pop()` design produces a false-positive dangling error against the existing real content `related: [\"skills/claude-code/writing-custom-skills\"]` — the bare-slug Set would only contain `writing-custom-skills`, so the lookup `bare = 'claude-code/writing-custom-skills'` would miss. Direct full-slug equality preserves the path-shaped ref-equals-slug contract that Velite's `s.path()` already produces."
  - "Insertion point: between dxItems construction and buildGraph(dxItems) (line ~227). Catches dangling refs before graph computation walks them, per Q4 placement guidance."
  - "TDD ordering: RED test commit before GREEN implementation, mirroring 27-03's plan-level TDD discipline. Plan declared Task 1 (impl) before Task 2 (test); the test-first commit gate overrides declaration order."

patterns-established:
  - "Pattern: per-collection cross-ref integrity via post-filter walk + Set<pathSlug> lookup + accumulator-then-throw — generalizes to any future cross-reference field by adding the field name to the inner `for (const field of [...] as const)` loop."

requirements-completed: [SCHEMA-04]

duration: 3m51s
completed: 2026-04-27
---

# Phase 27 Plan 04: Cross-Reference Validator Summary

**Velite now fails the build with a single accumulator-then-throw error naming every dangling `dependencies[]` / `related[]` cross-reference across all DX collections — implemented as a ~50-line block inside the `prepare` hook between dxItems construction and the dependency-graph build.**

## Performance

- **Duration:** 3m51s
- **Started:** 2026-04-27T07:02:04Z
- **Completed:** 2026-04-27T07:05:55Z
- **Tasks:** 2 (executed in TDD order: test RED → impl GREEN)
- **Files changed:** 2 (1 created, 1 modified)

## Accomplishments

- Cross-reference validator block added to `apps/blakepetersen.io/velite.config.ts:227-285` between dxItems construction and `buildGraph(dxItems)`
- Per-collection `Set<pathSlug>` built from `data.skills/hooks/configs/guides` (post-draft-filter, so dev = prod for valid published content per Risk #7)
- Walks `dependencies` and `related` only — `decisions` excluded per D-01 (wrong shape, no slugs); posts excluded by virtue of dxItems already excluding them
- Three failure modes surfaced individually: invalid format (no slash / leading slash / trailing slash), unknown collection, target not found
- All broken refs accumulate into a single string array; throws once with the count + indented list per D-04
- Failure-path regression test (`tests/phase27-dangling-cross-ref.test.ts`) asserts non-zero exit, the offending ref string, the field name, and the `Broken cross-references` header — all assertions green
- Happy-path canary asserts `valid-cross-ref` fixture still builds green
- Existing 16 real DX entries continue to build green — no false-positive dangling refs surfaced
- `pnpm --filter blakepetersen.io build` exits 0 (Next + Pagefind postbuild clean)
- `pnpm --filter blakepetersen.io typecheck` exits 0
- All 11 Phase 27 tests pass (`pnpm test -- --testPathPattern phase27`)

## Task Commits

1. **Task 2 (RED): Author dangling-cross-ref + valid-cross-ref tests** — `364368d` (test)
2. **Task 1 (GREEN): Insert cross-ref validator into prepare hook** — `d1c511c` (feat)

_Plan metadata commit captures SUMMARY.md, STATE.md, ROADMAP.md, REQUIREMENTS.md updates._

## Files Created/Modified

- `apps/blakepetersen.io/tests/phase27-dangling-cross-ref.test.ts` (created) — Jest regression: failure-path asserts ref/field/header, happy-path asserts exit 0
- `apps/blakepetersen.io/velite.config.ts` (modified) — added ~58-line validator block after dxItems construction, before `buildGraph(dxItems)`

## Decisions Made

- **27-04:** Deviation from RESEARCH.md Q4's reference snippet on the slug-set construction. The plan paste-verbatim line `skills: new Set(data.skills.map((i) => i.slug.split('/').pop()!))` produces a `Set<bareSlug>` and the plan's lookup line `collectionSlugs[coll].has(bare)` where `bare = ref.slice(slashIndex + 1)`. For a real entry like `related: ["skills/claude-code/writing-custom-skills"]`, the Set would contain `'writing-custom-skills'` (last segment) but the lookup key would be `'claude-code/writing-custom-skills'` — a false-positive miss. Fixed by storing the full path-shaped slug in the Set and matching the ref string directly: `collectionSlugs[coll].has(ref)`. Both Velite's `s.path()` output and author-written refs use the same `<collection>/<slug>` shape, so direct equality is correct and forward-compatible with arbitrarily nested paths.
- **27-04:** Validator placement at line ~227 (after dxItems construction, before `buildGraph`) per Q4. Drafts are filtered at lines 165-172 if `NODE_ENV === 'production'`; the validator runs against the post-filter `data.skills/hooks/configs/guides` so dev builds with drafts validate the same shape prod does (Risk #7 — drafts are excluded from validation entirely).
- **27-04:** TDD ordering — authored Task 2's failing test first (`test(27-04): ...`), confirmed RED (exit code 0 vs expected non-zero), then implemented Task 1's validator (`feat(27-04): ...`), confirmed GREEN (1/1 → 2/2 tests). Same plan-level TDD discipline applied in 27-03.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Slug-set construction in plan's reference snippet would false-positive on nested slugs**
- **Found during:** Task 1 (impl), pre-commit verification against real `data.skills`
- **Issue:** RESEARCH.md Q4's reference code uses `new Set(data.skills.map(i => i.slug.split('/').pop()!))` — yielding a Set of bare-slug LAST segments. The lookup key from `ref.slice(slashIndex + 1)` is everything after the first slash, which for nested skill paths (`skills/claude-code/writing-custom-skills`) is `claude-code/writing-custom-skills` — not equal to the Set's `writing-custom-skills`. Existing real content (`content/guides/content-authoring.mdx` → `related: ["skills/claude-code/writing-custom-skills"]`) would falsely fail the build.
- **Fix:** Build per-collection Set from full path-shaped `i.slug` and match `collectionSlugs[coll].has(ref)` directly. Velite's `s.path()` returns the same shape authors write in refs, so equality is correct.
- **Files modified:** `apps/blakepetersen.io/velite.config.ts` (validator block uses direct full-slug equality, not slice+pop comparison)
- **Verification:** `pnpm velite` against real content exits 0; both fixture tests pass; build/typecheck green
- **Committed in:** `d1c511c`

### Order Adjustments

**2. [Rule 3 - Blocking] Reordered tasks to satisfy plan-level TDD gate**
- **Found during:** Task setup
- **Issue:** Plan declared Task 1 (impl) before Task 2 (test). Both tasks have `tdd="true"`. The plan-level TDD gate (RED before GREEN) requires the `test(...)` commit BEFORE the `feat(...)` commit; following declaration order would have produced GREEN-without-RED.
- **Fix:** Authored Task 2's test first against unchanged code, confirmed RED, committed as `test(27-04)`. Then implemented Task 1, confirmed GREEN, committed as `feat(27-04)`.
- **Files modified:** None additional — same files as plan specified
- **Verification:** RED commit `364368d` (test fails: exitCode 0 vs not 0). GREEN commit `d1c511c` (test passes: 2/2 green).

---

**Total deviations:** 2 (1 bug-fix, 1 order-only)
**Impact on plan:** Same scope, same files, correctness-preserving fix to the validator's data shape.

## Issues Encountered

- None beyond the deviation above. The fixture configs spread `baseConfig` so the new validator runs inside fixture builds automatically — no fixture config changes required.
- Pre-commit hook (lint-staged ESLint) ran clean on both commits.
- The first build after the validator landed surfaced the `node:warning` about `blink-registry` not declaring `"type": "module"` — pre-existing, unrelated to this plan, out of scope per executor's scope-boundary rule.

## User Setup Required

None — pure schema/test work, no external services.

## Next Phase Readiness

- **Plan 27-05 (CalVer hash gate):** unaffected. Operates on `singleArtifacts`/`multiArtifacts`, which are intentionally outside this plan's DX-only scope.
- **Phase 28+ content authoring:** every new DX entry's `dependencies` and `related` must point at existing slugs — broken refs now fail the build with a single error listing all offenses.
- **Velite version pin:** the validator depends only on `data.<coll>[i].slug` shape (path-shaped string), which is a stable Velite API. Independent of the `meta.config.cache` private-API risk that 27-03's slug-uniqueness helper rests on.

## Self-Check: PASSED

Verified all created/modified files exist and both task commits are reachable:

- FOUND: `apps/blakepetersen.io/tests/phase27-dangling-cross-ref.test.ts`
- FOUND: `apps/blakepetersen.io/velite.config.ts` (modified, contains `Broken cross-references in DX content` + `brokenRefs` x6)
- FOUND: commit `364368d` (test RED)
- FOUND: commit `d1c511c` (feat GREEN)

Verification commands:
- `pnpm --filter blakepetersen.io velite` → exits 0 against real content
- `pnpm --filter blakepetersen.io test -- --testPathPattern phase27-dangling-cross-ref` → 2/2 passed
- `pnpm --filter blakepetersen.io test -- --testPathPattern phase27` → 11/11 passed (no Phase 27 regressions)
- `pnpm --filter blakepetersen.io typecheck` → exits 0
- `pnpm --filter blakepetersen.io build` → exits 0 (Next + Pagefind postbuild clean)
- `grep -c "Broken cross-references in DX content" velite.config.ts` → 1
- `grep -c "brokenRefs" velite.config.ts` → 6 (≥ 4 required)

## TDD Gate Compliance

- **RED gate:** `364368d` (`test(27-04): add failing dangling-cross-ref regression for SCHEMA-04`) — confirmed failing against unchanged code (`expect(result.exitCode).not.toBe(0)` with received `0`).
- **GREEN gate:** `d1c511c` (`feat(27-04): add cross-reference validator to Velite prepare hook`) — confirmed passing (2/2 tests green; 11/11 phase27 suite green).
- **REFACTOR gate:** not needed — initial implementation already tight (single validator block, single throw, three discriminated error messages).

---
*Phase: 27-schema-foundations*
*Completed: 2026-04-27*
