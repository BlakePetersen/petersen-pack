---
phase: 27
plan: 02
subsystem: schema-foundations
tags: [schema, velite, blink-registry, esm, workspace-imports]
requires:
  - apps/blakepetersen.io/velite.config.ts (existing inline validation block)
  - packages/blink-registry/src/index.ts (existing schema barrel)
provides:
  - Direct workspace import of artifact validation schemas in Velite config
  - Grep-based regression test that prevents reintroduction of inline patterns
  - Six-case Zod sanity test for the four imported schemas
affects:
  - apps/blakepetersen.io/velite.config.ts
  - apps/blakepetersen.io/tests/phase27-registry-import.test.ts
  - packages/blink-registry/src/{index,types}.ts
  - packages/blink-registry/src/schemas/{artifact,manifest,registry}.ts
  - packages/tsconfig/base.json
tech-stack:
  added: []
  patterns:
    - "Velite config imports workspace-package Zod schemas directly (no inline duplication)"
    - "Intra-package re-exports use explicit .ts extensions to satisfy Node ESM strict resolution"
    - "Shared base tsconfig opts into allowImportingTsExtensions + noEmit (workspace emits via tsup/Next, never tsc)"
key-files:
  created:
    - apps/blakepetersen.io/tests/phase27-registry-import.test.ts
  modified:
    - apps/blakepetersen.io/velite.config.ts
    - packages/blink-registry/src/index.ts
    - packages/blink-registry/src/types.ts
    - packages/blink-registry/src/schemas/artifact.ts
    - packages/blink-registry/src/schemas/manifest.ts
    - packages/blink-registry/src/schemas/registry.ts
    - packages/tsconfig/base.json
decisions:
  - "Option A (Blake-approved): fix blink-registry barrel re-exports instead of working around per-consumer — the v1.2 ESM workaround was masking a barrel-file ESM compliance gap, not a Velite-specific bug"
  - "allowImportingTsExtensions + noEmit landed in the shared base tsconfig (packages/tsconfig/base.json), since every workspace package emits via tsup or Next and never via tsc — base now matches reality"
metrics:
  duration: "~12 minutes execution"
  completed: 2026-04-27
  tasks_completed: 2
  files_modified: 7
  files_created: 1
  commits: 3
  tests_added: 6
---

# Phase 27 Plan 02: blink-registry Direct Import Summary

Velite now imports artifact validation schemas (`SlugSchema`, `CalVerSchema`, `ArtifactTypeSchema`, `MergeStrategySchema`) directly from `blink-registry`; the four inline regex/array constants that duplicated those schemas are gone. The v1.2 ESM workaround is fully unwound.

## What Shipped

### `apps/blakepetersen.io/velite.config.ts`

- Added a 5-line import block pulling `SlugSchema`, `CalVerSchema`, `ArtifactTypeSchema`, `MergeStrategySchema` from `blink-registry`.
- Deleted four inline constants: `slugPattern`, `calverPattern`, `validTypes`, `validMerges`.
- Rewrote the validation loop to use `Schema.safeParse(value).success` while preserving the original error message strings byte-for-byte.

### `apps/blakepetersen.io/tests/phase27-registry-import.test.ts` (new, 6 it blocks)

- **Grep regression** (2 it blocks): asserts the inline declarations are gone and the `from 'blink-registry'` import is present with the four schema names.
- **Zod-shape sanity** (4 it blocks): each imported schema accepts representative happy values and rejects representative invalid values.

### `packages/blink-registry/src/{index,types}.ts` + `src/schemas/{artifact,manifest,registry}.ts` (deviation — see below)

- 14 intra-package import/re-export specifiers updated from extensionless (`from './schemas/X'`) to `.ts` extensions (`from './schemas/X.ts'`).
- Mechanical only: no schemas, exports, or types changed.

### `packages/tsconfig/base.json` (deviation — see below)

- Added `allowImportingTsExtensions: true` (companion to existing `moduleResolution: "bundler"`) and `noEmit: true`.
- Reflects monorepo reality: every workspace package emits via tsup or Next, never via `tsc`.

## Verification

| Check | Result |
| --- | --- |
| `grep -E "(slugPattern\|calverPattern\|validTypes\|validMerges)\s*=" velite.config.ts` | 0 matches |
| `grep "from 'blink-registry'" velite.config.ts` | 1 match (line 25) |
| `pnpm --filter blakepetersen.io velite` | green (3.7s) |
| `pnpm --filter blakepetersen.io build` (Next webpack + Pagefind postbuild) | green |
| `pnpm --filter blakepetersen.io typecheck` | green |
| `pnpm --filter blakepetersen.io test` | 30 suites / 230 tests pass (224 prior + 6 new) |
| `pnpm --filter blink-registry test` | 5 suites / 90 tests pass |
| `pnpm --filter blink-registry typecheck` | green |
| `pnpm --filter @blink/cli build` (tsup) | green |
| `pnpm --filter @blink/cli typecheck` | green |
| `pnpm --filter @blink/cli test` | 18 suites / 183 tests pass |
| `pnpm typecheck` (workspace turbo run) | 4 packages, all green |

## Deviations from Plan

### Auto-resolved with explicit Blake approval

**1. [Rule 4 → Rule 3 escalation, Blake-approved Option A] Fix blink-registry barrel re-exports for Node ESM strict resolution**

- **Found during:** Task 1 verification — `pnpm --filter blakepetersen.io velite` failed with `Cannot find module '/.../packages/blink-registry/src/schemas/primitives' imported from /.../packages/blink-registry/src/index.ts`.
- **Issue:** Plan RESEARCH.md Q2 asserted "esbuild already resolves workspace TS for `@blink/cli` via tsup", concluding workspace TS imports would resolve in Velite. That conclusion conflated two code paths:
  - **tsup-bundled consumer** (`@blink/cli`): esbuild traverses the entire dependency tree at build time, resolving extensionless TS imports happily.
  - **Velite evaluator**: esbuild compiles `velite.config.ts` only; workspace dependencies are external and loaded by **Node ESM** at runtime. Node ESM's strict resolver rejects the extensionless `from './schemas/X'` re-exports inside `blink-registry/src/index.ts`.
  Existing consumers (blink-cli, ts-jest test suites) all dodge this via bundling or transpilation; Velite was the first true Node-ESM consumer of blink-registry's barrel.
- **Plan contingency was insufficient:** the documented fallback (add a `paths` alias in `apps/blakepetersen.io/tsconfig.json`) only redirects the entry point; the same internal extensionless re-exports remain on the resolution path.
- **Why this escalated to Rule 4:** the fix touches a shared workspace package (`blink-registry`) consumed by `@blink/cli` and multiple test suites; that surface is outside the plan's `files_modified` field. I returned a checkpoint with four options; Blake approved **Option A** (mechanical extension fix at the source).
- **Fix applied (mechanical only):**
  - 14 intra-package re-exports across `packages/blink-registry/src/{index,types}.ts` and `src/schemas/{artifact,manifest,registry}.ts` updated from `from './foo'` to `from './foo.ts'`.
  - `packages/tsconfig/base.json` gained `allowImportingTsExtensions: true` and `noEmit: true` so every consumer's `tsc --noEmit` typecheck accepts the explicit extensions. (Both flags are no-ops for tsup/Next builds, which never use tsc emit anyway.)
- **Verified safe:** all blink-registry tests pass (90/90), blink-cli build (tsup) green, blink-cli typecheck green, blink-cli tests green (183/183), workspace-wide `pnpm typecheck` green.
- **Commits:**
  - `a808a2e` — `chore(27-02): add .ts extensions to blink-registry re-exports`
  - `2d94313` — `feat(27-02): import artifact validation schemas from blink-registry` (Plan 27-02 Task 1)
  - `0682b70` — `test(27-02): add SCHEMA-05 registry-import regression + sanity test` (Plan 27-02 Task 2)

### Side observations (out of scope, deferred)

- **`MODULE_TYPELESS_PACKAGE_JSON` warning** during `velite build`: Node now reparses `blink-registry/src/index.ts` as ESM after CJS parse fails. Suggested fix is `"type": "module"` on `packages/blink-registry/package.json`. Out of scope for this plan — touching the package's module type could affect ts-jest's CJS test runner setup. No correctness impact today; logged for a future deferred-items pass.

## Authentication Gates

None.

## Plan Acceptance Criteria

- ✅ All tasks in 27-02-PLAN.md executed
- ✅ Each task committed individually
- ✅ velite.config.ts:284-287 imports from blink-registry instead of inline definitions
- ✅ No regression in slug/calver/type/merge validation behavior across existing `content/**`
- ✅ `phase27-registry-import.test.ts` passes (6/6 it blocks)
- ✅ `pnpm --filter blakepetersen.io build` exits 0 (Velite + Next webpack build green)
- ✅ `pnpm --filter blakepetersen.io typecheck` exits 0
- ✅ SUMMARY.md created
- ✅ STATE.md + ROADMAP.md updated (this commit)
- ✅ Pre-commit hooks pass (Husky/commitlint + lint-staged ran on all 3 commits)

## TDD Gate Compliance

Plan-level TDD: `chore` → `feat` → `test` rather than the textbook `test` → `feat`. The grep-regression nature of the test depends on Task 1's diff existing in the file; running the test before Task 1 would have failed with the now-trivial assertions only. The Zod-sanity portion would have passed against either side. Net: gates exercised, but not in canonical order — a reasonable concession for a regression-style test that documents a contract (`SCHEMA-05`) rather than driving feature implementation.

## Self-Check: PASSED

- ✅ `apps/blakepetersen.io/tests/phase27-registry-import.test.ts` exists (FOUND)
- ✅ `apps/blakepetersen.io/velite.config.ts` modified (FOUND, contains `from 'blink-registry'`)
- ✅ commit `a808a2e` exists in `git log --oneline --all` (FOUND)
- ✅ commit `2d94313` exists in `git log --oneline --all` (FOUND)
- ✅ commit `0682b70` exists in `git log --oneline --all` (FOUND)
