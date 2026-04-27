---
phase: 27-schema-foundations
plan: 03
subsystem: schema-foundations

tags: [velite, zod, schema, slug-uniqueness, mdx, dx-collections]

requires:
  - phase: 27-schema-foundations
    provides: phase27-velite-runner.ts + duplicate-slug fixture tree (Plan 00); blink-registry direct imports (Plan 02)

provides:
  - Per-collection bare-slug uniqueness enforcement on the four DX collections (skills, hooks, configs, guides)
  - `pathSlugWithCollectionDedup(collection)` helper reusing Velite's own `meta.config.cache` Map
  - `dxSchemaFor(collection)` factory replacing the static `dxSchema` constant; entry.slug remains path-shaped
  - Failure-path regression test asserting both offending file paths surface in the build error

affects: [27-04-cross-ref-validator, 27-05-calver-hash-gate, 28-scaffolds-and-lint, 29-content-density]

tech-stack:
  added: []
  patterns:
    - "Schema factories per collection (`dxSchemaFor(name)`) when validation needs collection-name closure"
    - "Reuse of Velite's private `meta.config.cache` for fail-fast cross-file invariants — pinned-version contract enforced by regression test"

key-files:
  created:
    - apps/blakepetersen.io/tests/phase27-duplicate-slug.test.ts
  modified:
    - apps/blakepetersen.io/velite.config.ts

key-decisions:
  - "Smallest-delta deviation from D-19 literal wording: keep `slug: s.path()` and bolt on dedup via `superRefine`, instead of swapping to `s.slug('<collection>')` (which returns a BARE slug and would break every consumer of `entry.slug`, `dxSchema.transform`'s category fallback, and require `slug:` frontmatter on all 16 existing MDX files)"
  - "Factory shape (`dxSchemaFor(collection)`) chosen over wrapper-extends-dxSchema (Option A) — single declaration, four typed call sites, no leakage of the bare `dxSchema` identifier"
  - "DX-only scope per D-19: posts/singleArtifacts/multiArtifacts unchanged; v1.4 leaves the posts collection intact (CONTEXT.md `<deferred>`)"

patterns-established:
  - "Pattern: per-collection slug dedup via `s.path().superRefine` with cache key `phase27:collection-slug:<collection>:<bareSlug>` — the Plan 00 duplicate-slug fixture is the canary if Velite ever changes the cache shape"
  - "Pattern: TDD ordering for plan-level RED/GREEN — author the failure-path test first, commit `test(...)` (RED), implement, commit `feat(...)` (GREEN); satisfies plan-level TDD gate even when plan declares the implementation task before the test task"

requirements-completed: [SCHEMA-03]

duration: 1m50s
completed: 2026-04-27
---

# Phase 27 Plan 03: Per-Collection Slug Uniqueness Summary

**Velite now fails the build with a location-aware error when two MDX files in the same DX collection share a bare-slug filename — implemented via a factory + `superRefine` that piggybacks on Velite's own duplicate-detection cache, preserving the path-shaped `entry.slug` value every consumer already depends on.**

## Performance

- **Duration:** 1m50s
- **Started:** 2026-04-27T06:56:17Z
- **Completed:** 2026-04-27T06:58:07Z
- **Tasks:** 2 (executed in TDD order: test RED → impl GREEN)
- **Files modified:** 2

## Accomplishments

- `pathSlugWithCollectionDedup(collection)` helper added above `dxSchema` in `velite.config.ts`; reuses Velite's own `meta.config.cache` (Map) the same way `s.slug(by)` does internally
- `dxSchema` constant replaced by `dxSchemaFor(collection)` factory; transform output unchanged (path-shaped slug preserved → zero downstream consumer changes)
- Four DX collections (skills, hooks, configs, guides) wired to their own per-collection dedup namespace; cross-collection slug collisions are intentionally allowed per D-02
- Posts, singleArtifacts, and multiArtifacts schemas untouched per D-19 scope
- Failure-path regression test (`tests/phase27-duplicate-slug.test.ts`) asserts non-zero exit, both offending file paths, the bare slug `'foo'`, and the word "duplicate" — all four assertions green
- Real content build (`pnpm --filter blakepetersen.io velite`) still exits 0 — no regressions on the existing 16 DX entries

## Task Commits

1. **Task 2 (RED): Author failure-path test for duplicate-slug fixture** — `fa4afa4` (test)
2. **Task 1 (GREEN): Add `pathSlugWithCollectionDedup` helper + `dxSchemaFor` factory + per-collection wiring** — `bfb3f25` (feat)

_Plan metadata commit captures SUMMARY.md, STATE.md, ROADMAP.md, REQUIREMENTS.md updates._

## Files Created/Modified

- `apps/blakepetersen.io/tests/phase27-duplicate-slug.test.ts` (created) — Jest regression: `runVeliteFixture(fixtureDir('duplicate-slug'))` exits non-zero with both file paths, bare slug, and "duplicate" surfaced in the combined output
- `apps/blakepetersen.io/velite.config.ts` (modified) — added helper (~28 lines) above `dxSchema`, converted `const dxSchema = ...` to `function dxSchemaFor(collection) { ... }`, swapped four `defineCollection({ schema: dxSchema })` call sites to `dxSchemaFor('<collection>')`

## Decisions Made

- **27-03:** Plan-level deviation from D-19 literal wording — keep `s.path()` + add `superRefine`, do NOT swap to `s.slug('<collection>')`. Rationale (RESEARCH.md Q1): Velite's `s.slug()` returns a BARE slug that doesn't carry the `<collection>/<bare>` path needed by `entry.slug`'s consumers (`.velite/<collection>.json` readers, `dxSchema.transform`'s `data.slug.split('/')[0]` category fallback, every consumer that uses path-shaped slugs). The smallest delta path satisfies D-19's substance (per-collection duplicate detection) without the consumer blast radius. The deviation is called out in both the plan's `<objective>` and the GREEN commit message.
- **27-03:** Factory shape (`dxSchemaFor(name)`) over wrapper/Option-A — fewer indirection layers; the bare `dxSchema` identifier is fully removed (no accidental "static schema" reuse possible). One declaration, four typed call sites.
- **27-03:** TDD execution order swapped from the plan's declared task order — RED test (`test(27-03): ...`) committed BEFORE the GREEN implementation (`feat(27-03): ...`). Plan declared Task 1 (impl) before Task 2 (test); plan-level TDD discipline (test-first commit gate) overrides the literal declaration order. Both tasks shipped; both `<acceptance_criteria>` sections satisfied.

## Deviations from Plan

### Order Adjustments

**1. [Rule 3 - Blocking] Reordered task execution to satisfy plan-level TDD gate**
- **Found during:** Task setup (before any code change)
- **Issue:** Plan declares Task 1 (helper + wiring) before Task 2 (failure-path test). Task 1's `tdd="true"` and the plan-level TDD gate require a `test(...)` commit BEFORE a `feat(...)` commit. Following declaration order would have produced a `feat` commit with no preceding `test`, violating the RED-before-GREEN contract.
- **Fix:** Authored Task 2's test first, ran against unchanged code to confirm RED, committed as `test(27-03)`. Then implemented Task 1, ran to confirm GREEN, committed as `feat(27-03)`.
- **Files modified:** None additional — same files as plan specified
- **Verification:** RED commit `fa4afa4` (test fails: exitCode 0 vs not 0). GREEN commit `bfb3f25` (test passes: 1/1 green).
- **Committed in:** Both Task commits — order swapped, content preserved.

---

**Total deviations:** 1 (order-only, no scope change)
**Impact on plan:** No scope creep. Both tasks delivered exactly as specified; only the commit sequence changed to satisfy TDD discipline.

## Issues Encountered

- None. Velite's private `meta.config.cache` API (Risk #8 in RESEARCH.md, threat T-27-03-02) behaved exactly as the source-read predicted — `cache.get(key)` returns the prior `meta.path` and the `addIssue({ fatal: true, code: 'custom' })` shape produces the location-aware error message. The Task 2 test is the canary if a future Velite upgrade changes that shape.
- Pre-commit hook (lint-staged ESLint) ran clean on both commits.
- `pnpm --filter blakepetersen.io build` postbuild Pagefind step ran clean — no upstream impact.

## User Setup Required

None — pure schema/test work, no external services.

## Next Phase Readiness

- **Plan 27-04 (cross-ref validator):** can now rely on per-collection bare-slug uniqueness as a precondition. The `Map<collection, Set<bareSlug>>` construction in 27-04's prepare-hook walker will not see duplicate keys within a collection.
- **Plan 27-05 (CalVer hash gate):** unaffected; artifact slugs use the singleArtifacts/multiArtifacts schemas, which are intentionally outside this plan's scope.
- **Velite version pin (`^0.3.1`):** continues to be the contract that protects `meta.config.cache` access. If a future upgrade lifts the pin, run `pnpm --filter blakepetersen.io test -- --testPathPattern phase27-duplicate-slug` first — failing means the cache shape changed and the helper needs adjustment.

## Self-Check: PASSED

Verified all created/modified files exist and both task commits are reachable:

- FOUND: `apps/blakepetersen.io/tests/phase27-duplicate-slug.test.ts`
- FOUND: `apps/blakepetersen.io/velite.config.ts` (modified, contains `pathSlugWithCollectionDedup` and `dxSchemaFor`)
- FOUND: commit `fa4afa4` (test RED)
- FOUND: commit `bfb3f25` (feat GREEN)

Verification commands:
- `pnpm --filter blakepetersen.io velite` → exits 0 against real content
- `pnpm --filter blakepetersen.io test -- --testPathPattern phase27-duplicate-slug` → 1/1 passed
- `pnpm --filter blakepetersen.io typecheck` → exits 0
- `pnpm --filter blakepetersen.io build` → exits 0 (Next build + Pagefind postbuild clean)

## TDD Gate Compliance

- **RED gate:** `fa4afa4` (`test(27-03): add failing duplicate-slug regression for SCHEMA-03`) — confirmed failing against unchanged code (`expect(result.exitCode).not.toBe(0)` with received `0`).
- **GREEN gate:** `bfb3f25` (`feat(27-03): add per-collection slug uniqueness for DX collections`) — confirmed passing (1/1 test green).
- **REFACTOR gate:** not needed — initial implementation already clean (single helper, single factory, four parallel call sites).

---
*Phase: 27-schema-foundations*
*Completed: 2026-04-27*
