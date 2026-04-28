---
phase: 27-schema-foundations
plan: 07
subsystem: testing
tags: [perf, baseline, velite, next-webpack, tsx, esbuild]

# Dependency graph
requires:
  - phase: 27-schema-foundations
    provides: All prior phase 27 plans (00-06) — baseline measures POST-Phase-27 numbers per D-11
provides:
  - Manual `pnpm --filter blakepetersen.io perf:baseline` capture script
  - Committed v1.4 baseline JSON at .planning/intel/build-perf-baseline.json
  - Shape-only Jest regression guard for the baseline file
affects: [v1.5, perf-regression, schema-foundations-gate-out]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "tsx scripts that invoke pnpm --filter <pkg> via spawnSync argv (no shell)"
    - "Async main()-wrapped tsx scripts (CJS-compatible) using fileURLToPath(import.meta.url) for __dirname"
    - "Build-tool stdout regex parsing with null-tolerance (Next.js 'Compiled successfully in Xs' / 'Ready in Xs')"

key-files:
  created:
    - apps/blakepetersen.io/scripts/perf-baseline.ts
    - apps/blakepetersen.io/tests/phase27-perf-baseline.test.ts
    - .planning/intel/build-perf-baseline.json
  modified:
    - apps/blakepetersen.io/package.json

key-decisions:
  - "ESM/CJS pattern (Rule 3 deviation): wrap async work in main() and use fileURLToPath(import.meta.url) — top-level await is unsupported under tsx in CJS package context"
  - "Baseline JSON committed via git add -f (.planning/ is gitignored as a directory; tracked individual files persist) — same pattern Phase 27 already uses for SUMMARY/PLAN/STATE files"

patterns-established:
  - "v1.4 perf baseline: full build 12.46s, velite-only 3.51s, webpack compile 6.30s, next dev ready 0.18s, content count 23"
  - "Future regression checks (v1.5+) compare new captures against this committed JSON; meaningful regressions are >2x current values per Risk #5/D-09"

requirements-completed: [SCHEMA-07]

# Metrics
duration: ~25min (active work; system suspended between cold-build run and final commit so wall-clock spans longer)
completed: 2026-04-28
---

# Phase 27 Plan 07: Perf Baseline Summary

**Manual perf:baseline tsx script + committed v1.4 baseline JSON capturing four post-Phase-27 build/dev metrics for v1.5+ regression comparison.**

## Performance

- **Duration:** ~25min active
- **Started:** 2026-04-27T07:29:50Z
- **Completed:** 2026-04-28T03:13:25Z (system suspended between baseline capture and commit; wall-clock differs from active work)
- **Tasks:** 2
- **Files modified:** 4 (3 created, 1 modified)

## Accomplishments

- Authored `apps/blakepetersen.io/scripts/perf-baseline.ts` — tsx script that spawns four sub-measurements via spawnSync/spawn with argv arrays (no shell), parses Next webpack compile from stdout, watches `next dev` stdout for "Ready in Xs", computes content count from `content/` mdx walk
- Captured v1.4 baseline on a clean state (`.next/`, `.velite/`, `.turbo/`, `node-compile-cache/` purged before run): fullBuildWallMs 12,456.79ms / veliteWallMs 3,509.55ms / webpackCompileMs 6,300ms / nextDevReadyMs 181ms / contentCount 23 / nodeVersion v24.14.0 / capturedAt 2026-04-28T03:11:37.754Z
- Added Jest shape-only regression guard (`tests/phase27-perf-baseline.test.ts`) — 8 assertions covering top-level keys, ISO date validity, nodeVersion prefix, contentCount integer-ness, all four metric keys present, three required-positive metrics, webpackCompileMs nullable tolerance per Risk #5
- Closes Phase 27 — final plan in the schema-foundations phase per D-11 sequencing constraint

## Task Commits

1. **Task 1: Author perf-baseline.ts and add the perf:baseline script** — `3616723` (feat)
2. **Task 2: Author the perf-baseline shape test** — `cb42a89` (test)

_TDD framing for Task 2: source-of-truth (the baseline JSON) was written by Task 1, so the test is a regression guard rather than an inverted-RED-then-GREEN cycle. Plan acceptance reflects this — the test is shape-only against the existing JSON._

## Files Created/Modified

- `apps/blakepetersen.io/scripts/perf-baseline.ts` (created) — capture orchestrator
- `apps/blakepetersen.io/tests/phase27-perf-baseline.test.ts` (created) — shape-only regression guard
- `.planning/intel/build-perf-baseline.json` (created) — committed v1.4 baseline numbers
- `apps/blakepetersen.io/package.json` (modified) — added `perf:baseline` script

## Decisions Made

- **ESM/CJS reconciliation:** The plan's reference snippet used top-level await + bare `__dirname`. Both fail under tsx when the host package is CJS (no `"type": "module"`). Wrapped script body in `async function main()` and used `fileURLToPath(import.meta.url)` to derive `__dirname` — same pattern the existing `migrate-content.ts` (Plan 27-06) established. Avoided flipping the whole app package to ESM (out-of-scope, would touch Next/Velite runtime).
- **`.planning/intel/build-perf-baseline.json` commit mechanism:** `.planning/` is gitignored as a directory but tracked individual files persist (the entire `.planning/` tree of PLAN/STATE/ROADMAP/SUMMARY files works this way). Used `git add -f` once on the new JSON; future re-captures will commit naturally as a tracked-file modification.
- **No HTTP-poll fallback for next dev readiness (per Risk #5):** Skeleton ships regex-only. If a future Next 16.x release silently changes the "Ready in Xs" stdout format, the script's 60s timeout will reject — operator notices, updates regex.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] tsx top-level await + bare __dirname incompatible with CJS host package**
- **Found during:** Task 1 (first invocation of `pnpm perf:baseline`)
- **Issue:** Plan's reference snippet placed `await timeNextDev()` at module top level and used `__dirname` directly. tsx in `apps/blakepetersen.io` runs scripts in CJS mode (the package has no `"type": "module"`); esbuild rejects with `Top-level await is currently not supported with the "cjs" output format`. Bare `__dirname` would also be undefined under any ESM future.
- **Fix:** Wrapped the orchestration body in `async function main()` and called `main().catch(...)` at module bottom. Imported `fileURLToPath` from `node:url` and derived `__filename`/`__dirname` from `import.meta.url` (tsx polyfills `import.meta.url` even in CJS contexts — same pattern proven by `migrate-content.ts` from Plan 27-06).
- **Files modified:** apps/blakepetersen.io/scripts/perf-baseline.ts
- **Verification:** Subsequent `pnpm --filter blakepetersen.io perf:baseline` exited 0 and wrote a valid JSON; node-script verification of all four metric values > 0 passed; 8 Jest assertions green.
- **Committed in:** 3616723 (Task 1 commit; deviation noted in commit body)

---

**Total deviations:** 1 auto-fixed (Rule 3 — Blocking)
**Impact on plan:** Necessary for the script to execute at all. No scope creep — the fix uses the exact ESM-pattern already established in Plan 27-06's migrate-content.ts.

## Issues Encountered

- None beyond the deviation above.

## Manual Verification (Blake)

Per VALIDATION.md `Manual-Only Verifications` row:
- [x] `fullBuildWallMs < 60000` — actual 12,456.79ms (well under)
- [x] `nextDevReadyMs < 10000` — actual 181ms (well under)
- [x] No obvious outliers — webpackCompileMs (6.3s) and veliteWallMs (3.5s) are consistent with the full-build wall-time of 12.5s (full build = velite + webpack compile + next overhead, which roughly checks out: 3.5 + 6.3 + ~2.7 overhead = 12.5)

## Threat Flags

None — no new attack surface introduced. spawnSync/spawn invocations use argv arrays of static literal commands (T-27-07-04 mitigation honored).

## User Setup Required

None.

## Next Phase Readiness

Phase 27 complete (8 of 8 plans landed). The committed baseline JSON anchors v1.5+ regression comparisons. Phase 28 (Scaffolds + Lint) inherits:
- A clean `dxFields` schema with `voice` + `requires_artifact`
- Per-collection slug-uniqueness enforcement
- Cross-ref validator + content-hash CalVer gate as build-time invariants
- Codemod harness skeleton ready for migration #001
- This perf baseline as the cost-of-change yardstick for the prepare-hook work in Phase 28

No blockers carried forward.

## Self-Check: PASSED

- File exists: `apps/blakepetersen.io/scripts/perf-baseline.ts` — FOUND
- File exists: `apps/blakepetersen.io/tests/phase27-perf-baseline.test.ts` — FOUND
- File exists: `.planning/intel/build-perf-baseline.json` — FOUND
- Commit `3616723` (Task 1) — FOUND in git log
- Commit `cb42a89` (Task 2) — FOUND in git log
- Acceptance criteria met: perf:baseline exits 0, shape test 8/8 green, typecheck clean, app suite 248/248 green

---
*Phase: 27-schema-foundations*
*Completed: 2026-04-28*
