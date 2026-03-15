---
phase: 16-section-markers-lifecycle
plan: 02
subsystem: cli
tags: [section-markers, update, diff, atomic-write, global-scope, dependency-resolution]

requires:
  - phase: 16-section-markers-lifecycle
    provides: Foundation modules (markers, writer, scope, deps, output)
  - phase: 15-cli-core
    provides: CLI architecture, apply command, manifest module, test patterns
provides:
  - Modified apply command with section markers, global scope, atomic writes, dep resolution
  - Update command with managed section replacement and diff preview
  - Diff command for read-only upstream comparison
affects: [16-section-markers-lifecycle]

tech-stack:
  added: []
  patterns: [section-merge marker injection, scope-aware manifest resolution]

key-files:
  created:
    - packages/blink-cli/src/commands/update.ts
    - packages/blink-cli/src/commands/diff.ts
    - packages/blink-cli/tests/commands/update.test.ts
    - packages/blink-cli/tests/commands/diff.test.ts
  modified:
    - packages/blink-cli/src/commands/apply.ts
    - packages/blink-cli/src/cli.ts
    - packages/blink-cli/tests/commands/apply.test.ts

key-decisions:
  - "Scope derived from --global flag (not inverted --project) for clarity"
  - "Global scope tests mock @/scope module to avoid writing to real $HOME"
  - "Update command uses manifestRoot from entry.scope for per-item resolution"

patterns-established:
  - "Section-merge files get markers injected before writing; checksums computed after injection"
  - "Update replaces managed sections only via replaceManagedContent preserving user content"
  - "Diff is read-only; shows colored unified diff via formatColoredDiff"

requirements-completed: [CORE-04, CORE-06, CORE-12, SCOPE-01, SCOPE-05, SCOPE-07]

duration: 8min
completed: 2026-03-15
---

# Phase 16 Plan 02: Lifecycle Commands Summary

**Apply with section markers and dependency resolution, update with managed section replacement, and read-only diff preview**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-15T03:58:05Z
- **Completed:** 2026-03-15T04:06:06Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Modified apply command to inject section markers for merge:section files, use atomicWrite, resolve global scope, and check artifact dependencies
- Implemented update command that replaces only managed sections between markers, detects local modifications, shows colored diff previews, and supports dry-run
- Implemented diff command for read-only upstream comparison with section-aware diffing
- Registered update and diff in cli.ts subCommands
- All 164 tests pass (20 new), build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Modify apply for markers, scope, atomic writes, deps** - `201742a` (test), `ad6f4c1` (feat)
2. **Task 2: Update and diff commands** - `f9c2c45` (test), `461ca17` (feat)

## Files Created/Modified
- `packages/blink-cli/src/commands/apply.ts` - Section markers, atomicWrite, --global flag, dependency resolution
- `packages/blink-cli/src/commands/update.ts` - Managed section replacement with diff preview and modification detection
- `packages/blink-cli/src/commands/diff.ts` - Read-only upstream comparison
- `packages/blink-cli/src/cli.ts` - Added update and diff subcommands
- `packages/blink-cli/tests/commands/apply.test.ts` - 8 new tests for markers, global scope, deps
- `packages/blink-cli/tests/commands/update.test.ts` - 8 tests for update behavior
- `packages/blink-cli/tests/commands/diff.test.ts` - 4 tests for diff behavior

## Decisions Made
- Scope derived from `--global` flag rather than inverted `--project` for semantic clarity
- Global scope tests mock `@/scope` module to avoid writing to real `$HOME` directory
- Update uses `entry.scope` from manifest for per-item scope resolution

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Test mocks for update/diff initially set up two fetch responses (index + artifact) but the commands only call `fetchArtifact` directly; fixed mock to return artifact response only

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full lifecycle available: apply, update, diff
- Ready for Phase 16-03 (eject/doctor/remaining lifecycle commands)
- Section markers survive across all operations

---
*Phase: 16-section-markers-lifecycle*
*Completed: 2026-03-15*
