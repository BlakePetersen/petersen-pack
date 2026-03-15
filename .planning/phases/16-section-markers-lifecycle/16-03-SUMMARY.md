---
phase: 16-section-markers-lifecycle
plan: 03
subsystem: cli
tags: [eject, doctor, integrity-checks, section-markers, lifecycle]

requires:
  - phase: 16-section-markers-lifecycle
    provides: Foundation modules (markers, writer, scope, manifest) and lifecycle commands (apply, update, diff)
provides:
  - Eject command (strips markers, removes from manifest)
  - Doctor command (integrity checks for markers, manifest, filesystem)
  - Complete CLI command registration (apply, diff, doctor, eject, init, list, status, update)
affects: []

tech-stack:
  added: []
  patterns: [recursive temp file scanning, severity-based issue reporting]

key-files:
  created:
    - packages/blink-cli/src/commands/eject.ts
    - packages/blink-cli/src/commands/doctor.ts
    - packages/blink-cli/tests/commands/eject.test.ts
    - packages/blink-cli/tests/commands/doctor.test.ts
  modified:
    - packages/blink-cli/src/cli.ts

key-decisions: []

patterns-established:
  - "Eject strips markers via stripMarkers then removes manifest entry, preserving file content"
  - "Doctor collects DoctorIssue[] with severity levels, reports summary at end"

requirements-completed: [CORE-05, CORE-08, SCOPE-06]

duration: 4min
completed: 2026-03-15
---

# Phase 16 Plan 03: Eject & Doctor Commands Summary

**Eject command for transferring file ownership by stripping markers, and doctor command for integrity validation of managed files**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T04:08:57Z
- **Completed:** 2026-03-15T04:12:53Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Implemented eject command that strips section markers from managed files and removes entries from manifest
- Implemented doctor command that detects broken markers, orphaned entries, orphaned temp files, and local modifications
- Registered eject and doctor subcommands in cli.ts (completing the full command set)
- All 181 tests pass (17 new across 2 test files), build succeeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Eject command** - `b87ef4e` (test), `cd11dec` (feat)
2. **Task 2: Doctor command and CLI registration** - `b5e8e98` (test), `08da95e` (feat)

## Files Created/Modified
- `packages/blink-cli/src/commands/eject.ts` - Strips markers from managed files, removes manifest entry
- `packages/blink-cli/src/commands/doctor.ts` - Integrity checks for markers, manifest entries, temp files, checksums
- `packages/blink-cli/src/cli.ts` - Added doctor and eject to subCommands
- `packages/blink-cli/tests/commands/eject.test.ts` - 9 tests for eject behavior
- `packages/blink-cli/tests/commands/doctor.test.ts` - 8 tests for doctor behavior

## Decisions Made
None - followed plan as specified.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 16 complete: all section marker lifecycle commands implemented (apply, update, diff, eject, doctor)
- Full CLI command set: apply, diff, doctor, eject, init, list, status, update
- Ready for Phase 17 (formatter survival testing) or Phase 19 (publishing)

---
*Phase: 16-section-markers-lifecycle*
*Completed: 2026-03-15*
