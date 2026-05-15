---
phase: 27-schema-foundations
plan: 06
subsystem: tooling
tags: [tsx, codemod, migrations, scripts, schema-foundations]

# Dependency graph
requires:
  - phase: 27-schema-foundations
    provides: schema lock (SCHEMA-01..05) — codemod harness ships into a stable schema surface
provides:
  - Vanilla `tsx scripts/migrate-content.ts` codemod harness skeleton
  - `--list` and `--dry-run <name>` flag vocabulary aligned with planned `blink scaffold`
  - Migration discovery contract: `scripts/migrations/<NNN>-<name>.ts` exports default `{ name, description, run(contentRoot) }`
  - Stub `000-noop` migration template for future schema migrations
  - Build-isolated execution surface (harness lives in `scripts/`, never invoked by `next build`)
affects: [phase-28-scaffolds, phase-29-content, phase-30-debt]

# Tech tracking
tech-stack:
  added: [tsx@^4.21.0 in apps/blakepetersen.io/devDependencies]
  patterns:
    - "Numbered migration prefix (000-, 001-) for deterministic discovery + ordering"
    - "Migration default export shape: { name, description, run(contentRoot) }"
    - "spawnSync(argv-array) — no shell — for subprocess-based CLI tests"
    - "ESM scripts under apps/blakepetersen.io/scripts/ use fileURLToPath(import.meta.url) instead of CJS __filename polyfill"

key-files:
  created:
    - apps/blakepetersen.io/scripts/migrate-content.ts
    - apps/blakepetersen.io/scripts/migrations/000-noop.ts
    - apps/blakepetersen.io/tests/phase27-migrate-harness.test.ts
  modified:
    - apps/blakepetersen.io/package.json (added tsx devDep + migrate script)
    - pnpm-lock.yaml (workspace tsx wiring)

key-decisions:
  - "Use ESM-native fileURLToPath(import.meta.url) instead of plan's CJS-shim polyfill — tsx 4.x supports ESM natively, cleaner code"
  - "Add tsx ^4.21.0 to apps/blakepetersen.io devDependencies despite tsx already being at workspace root — plan acceptance criterion explicitly greps the app's package.json"
  - "Defer build-isolation negative test from Jest to manual smoke per plan note — full pnpm build inside Jest would add ~30-60s suite latency"

patterns-established:
  - "Codemod harness contract: migrations land as scripts/migrations/<NNN>-<name>.ts files, harness discovers via fs.readdirSync filtered by /^\\d{3}-[a-z0-9-]+\\.ts$/, dynamically imported with default-export validation"
  - "Skeleton --dry-run is a printf-only path — does NOT invoke migration.run(). Future migrations that own the dryRun contract must respect a dryRun option themselves (T-27-06-02 mitigation, documented for whoever lands migration #001)"

requirements-completed: [SCHEMA-06]

# Metrics
duration: ~25min
completed: 2026-04-27
---

# Phase 27 Plan 06: Codemod Harness Summary

**Vanilla `tsx scripts/migrate-content.ts` codemod harness with `--list` / `--dry-run` flags and a `000-noop` template migration — skeleton-only deliverable per D-13..D-16, build-isolated from Velite/Next.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-27T07:00:00Z
- **Completed:** 2026-04-27T07:25:20Z
- **Tasks:** 2
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments

- `apps/blakepetersen.io/scripts/migrate-content.ts` ships the harness — discovers migrations from `scripts/migrations/` via `fs.readdirSync` + dynamic `import()`, validates each module exports `{ name, description, run }`, dispatches `--list` / `--dry-run <name>` / `<name>` (positional execute) / no-args usage
- `apps/blakepetersen.io/scripts/migrations/000-noop.ts` ships as the canary stub — proves harness wiring with `filesChanged: 0` and serves as the template for future migrations
- `pnpm --filter blakepetersen.io migrate --list` / `--dry-run 000-noop` / `000-noop` all exit 0 with expected stdout
- Build isolation verified: `pnpm --filter blakepetersen.io build` stdout has zero "migrate" or "Running 000-noop" mentions
- 3-test Jest suite (`tests/phase27-migrate-harness.test.ts`) covers `--list`, `--dry-run` happy-path, `--dry-run` unknown-migration failure-path
- Full `pnpm --filter blakepetersen.io test` (35 suites / 240 tests) green; `typecheck` green

## Task Commits

1. **Task 1: Add tsx devDep, migrate script, harness + stub migration** — `3e8d044` (feat)
2. **Task 2: Author the migrate-harness test** — `7a1ff17` (test)

_Note: Task 2 is `test(...)` rather than the full TDD `test → feat` cycle because Task 1's harness implementation precedes Task 2's test by plan ordering; the test here is a regression contract for the already-implemented harness, not a RED gate driving GREEN implementation._

## Files Created/Modified

- `apps/blakepetersen.io/scripts/migrate-content.ts` — the harness; flag parser + dynamic-import migration loader
- `apps/blakepetersen.io/scripts/migrations/000-noop.ts` — stub migration validating wiring; template for future migrations
- `apps/blakepetersen.io/tests/phase27-migrate-harness.test.ts` — 3 spawnSync-based subprocess tests
- `apps/blakepetersen.io/package.json` — added `"migrate": "tsx scripts/migrate-content.ts"` script and `tsx: ^4.21.0` devDep
- `pnpm-lock.yaml` — workspace dependency graph update

## Decisions Made

- **ESM-native file URL resolution:** Replaced the plan's CJS-shim polyfill (`fileURL()` helper that probed `globalThis.import?.meta?.url`) with the standard ESM idiom `fileURLToPath(import.meta.url)`. tsx 4.x runs scripts as native ESM, so the polyfill was solving a problem that doesn't exist in this runtime. The plan's `<action>` block explicitly invited this swap ("If the `fileURL()` polyfill above looks awkward, the executor can swap it for the simpler `import.meta.url` path resolution").
- **tsx pinned at app level despite root presence:** tsx ^4.21.0 was already at workspace-root devDeps, but the plan's acceptance criteria explicitly grep `apps/blakepetersen.io/package.json` for `"tsx":`. Adding it at app level satisfies the contract and makes the dependency self-evident in the app's package surface.
- **Test commit type `test()`, not `feat()`:** Task 2 ships only the regression test for the already-implemented harness. Conventional-commit `test(27-06)` is the right scope; `feat()` would imply new behavior.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking-style cleanup] Replaced CJS-shim `__filename` polyfill with native ESM `fileURLToPath(import.meta.url)`**
- **Found during:** Task 1 (harness scaffold)
- **Issue:** The plan's `fileURL()` helper read `(globalThis as any).import?.meta?.url ?? \`file://${__filename}\``, which collapses both branches in tsx 4.x ESM runtime: `__filename` is undefined under ESM, and `globalThis.import` is never defined in any runtime. The polyfill would throw at module load.
- **Fix:** Used the standard pattern: `import { fileURLToPath } from 'node:url'; const __filename = fileURLToPath(import.meta.url)`. The plan explicitly invited this swap.
- **Files modified:** `apps/blakepetersen.io/scripts/migrate-content.ts`
- **Verification:** Harness runs cleanly (`pnpm --filter blakepetersen.io migrate --list` exits 0); typecheck green
- **Committed in:** `3e8d044` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking-style cleanup, plan-invited)
**Impact on plan:** Functionally equivalent — substance honored, mechanism adapted. No scope creep.

## Issues Encountered

- **Lint warnings (no-console) on the harness:** 14 `no-console: warn` warnings on `scripts/migrate-content.ts`. Repo-wide ESLint config sets `no-console: 'warn'` (not `error`), and the harness is a CLI script where `console.log` is the intended output mechanism. Not auto-fixed — pre-existing repo policy classifies these as advisories. lint-staged (which runs on staged files at commit time) did not block commits.
- **Stale `.velite-fixture/` artifacts trigger 5 lint errors in `test-fixtures/phase27/*/`:** Pre-existing, gitignored runtime outputs from prior phase 27 fixture test runs. Out of scope for this plan; will not appear in CI (gitignored). Not fixed.

## Threat Surface (per `<threat_model>`)

| Threat ID | Mitigation in this plan |
|-----------|-------------------------|
| T-27-06-01 (malicious migration file) | Regex filter `/^\d{3}-[a-z0-9-]+\.ts$/` blocks shell-y filenames; skeleton ships only `000-noop.ts`; future migrations land via PR review |
| T-27-06-02 (--dry-run bypassed) | Skeleton's `--dry-run` does NOT invoke `migration.run()` — it prints a synthetic `filesChanged: 0`. Contract-level note recorded in this SUMMARY for whoever lands migration #001: future migrations that respect `dryRun` must do so contractually (the harness can't enforce side-effect-freeness in arbitrary user code). |
| T-27-06-03 (spawnSync injection) | Test uses argv array (`['exec', 'tsx', 'scripts/migrate-content.ts', ...args]`) — no shell, all inputs are static literals, no injection surface |

## User Setup Required

None — no external service configuration required.

## Follow-up for Migration #001

When the first real migration lands (Phase 28+), the author MUST:
1. Define a contract for how `--dry-run` is honored at the migration level (e.g., `run(contentRoot, { dryRun: boolean })` or split methods).
2. Update `migrate-content.ts` so `--dry-run <name>` invokes `migration.run(contentRoot, { dryRun: true })` instead of the current synthetic-print short-circuit.
3. Update the harness file header to document the dry-run contract.
4. Add a regression test asserting that a deliberately mutating migration produces `filesChanged: 0` under `--dry-run`.

This is captured here (rather than as a TODO in the harness) because the contract shape depends on the first real migration's needs — premature abstraction risks codifying the wrong API.

## Next Phase Readiness

- SCHEMA-06 closed; Phase 27 has 1 plan remaining (27-07 perf-baseline).
- Codemod harness is operational and ready to absorb Phase 28+ schema migrations.
- No blockers for 27-07 (no shared files; perf-baseline lives in `scripts/perf-baseline.ts`).

## Self-Check: PASSED

- [x] `apps/blakepetersen.io/scripts/migrate-content.ts` exists
- [x] `apps/blakepetersen.io/scripts/migrations/000-noop.ts` exists
- [x] `apps/blakepetersen.io/tests/phase27-migrate-harness.test.ts` exists
- [x] `apps/blakepetersen.io/package.json` contains `"tsx":` and `"migrate":`
- [x] Commit `3e8d044` exists (feat Task 1)
- [x] Commit `7a1ff17` exists (test Task 2)
- [x] `pnpm --filter blakepetersen.io migrate --list` exits 0 with `000-noop`
- [x] `pnpm --filter blakepetersen.io migrate --dry-run 000-noop` exits 0 with `filesChanged: 0`
- [x] `pnpm --filter blakepetersen.io build` exits 0; build stdout has zero "migrate"/"Running 000-noop" mentions
- [x] `pnpm --filter blakepetersen.io typecheck` exits 0
- [x] `pnpm --filter blakepetersen.io test` exits 0 (35 suites / 240 tests)

---
*Phase: 27-schema-foundations*
*Completed: 2026-04-27*
