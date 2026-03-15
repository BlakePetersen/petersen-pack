---
phase: 15-cli-core
plan: 01
subsystem: cli
tags: [fetch, zod, retry, manifest, picocolors, sha256]

requires:
  - phase: 12-registry-schemas
    provides: Zod schemas for registry, manifest, artifact, and primitives
provides:
  - Registry fetch client with retry and Zod validation
  - Manifest read/write/create operations
  - Package manager detection from lockfile
  - Output formatting helpers for CLI tables and labels
affects: [15-02, 15-03]

tech-stack:
  added: []
  patterns: [fetchWithRetry exponential backoff, immutable manifest updates, lockfile-based PM detection]

key-files:
  created:
    - packages/blink-cli/src/registry.ts
    - packages/blink-cli/src/manifest.ts
    - packages/blink-cli/src/pm.ts
    - packages/blink-cli/src/output.ts
    - packages/blink-cli/tests/registry.test.ts
    - packages/blink-cli/tests/manifest.test.ts
    - packages/blink-cli/tests/pm.test.ts
    - packages/blink-cli/tests/output.test.ts
  modified: []

key-decisions:
  - "Read BASE_URL from env at call time (not import time) so BLINK_REGISTRY_URL can be set dynamically"
  - "PM detection uses ordered config array for clean priority (pnpm > yarn > npm)"
  - "Output formatting returns strings rather than printing directly, enabling testability"

patterns-established:
  - "fetchWithRetry: exponential backoff with cap at 5s, AbortSignal.timeout for request timeout"
  - "Manifest immutability: addManifestEntry returns new object, never mutates"
  - "ABOUTME comments on all source files"

requirements-completed: [CORE-11, SCOPE-03]

duration: 4min
completed: 2026-03-15
---

# Phase 15 Plan 01: Shared Utility Modules Summary

**Four tested CLI utility modules: registry fetch with retry/validation, manifest CRUD, lockfile-based PM detection, and picocolors output formatting**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T02:43:14Z
- **Completed:** 2026-03-15T02:47:24Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Registry client fetches index and artifacts with 3-retry exponential backoff and Zod schema validation
- Manifest manager reads/writes .blink/manifest.json with schema validation, null-on-missing, and error-on-corrupt
- Package manager detection identifies pnpm/yarn/npm from lockfile presence with configurable priority
- Output helpers format grouped list tables, status tables with update indicators, and action labels

## Task Commits

Each task was committed atomically:

1. **Task 1: Registry client and package manager detection** - `8e4cf92` (feat)
2. **Task 2: Manifest manager and output formatting** - `f96cfd4` (feat)

## Files Created/Modified
- `packages/blink-cli/src/registry.ts` - Registry API client with fetch, retry, Zod validation
- `packages/blink-cli/src/pm.ts` - Package manager detection from lockfile presence
- `packages/blink-cli/src/manifest.ts` - Manifest read/write/create with schema validation
- `packages/blink-cli/src/output.ts` - CLI output formatting with picocolors
- `packages/blink-cli/tests/registry.test.ts` - 11 tests covering fetch, retry, env override, validation
- `packages/blink-cli/tests/pm.test.ts` - 8 tests using real tmp directories with lockfiles
- `packages/blink-cli/tests/manifest.test.ts` - 10 tests using real filesystem operations
- `packages/blink-cli/tests/output.test.ts` - 7 tests validating table formatting and labels

## Decisions Made
- Read BASE_URL from env at call time (not import time) so BLINK_REGISTRY_URL can be set dynamically per request
- PM detection uses ordered config array for clean priority (pnpm > yarn > npm)
- Output formatting returns strings rather than printing directly, enabling testability
- CalVer format is YYYY.MM.DD.N (four segments) per SlugSchema validation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CalVer format in test fixtures**
- **Found during:** Task 1 (Registry client tests)
- **Issue:** Test fixtures used '2026.03' CalVer format but schema requires 'YYYY.MM.DD.N' four-segment format
- **Fix:** Updated all test fixture version strings to '2026.03.14.1'
- **Files modified:** packages/blink-cli/tests/registry.test.ts
- **Verification:** All registry tests pass with valid CalVer versions
- **Committed in:** 8e4cf92 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor test data correction. No scope creep.

## Issues Encountered
- Jest 30 replaced `--testPathPattern` with `--testPathPatterns` (plural) -- adjusted commands accordingly

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All four utility modules ready for consumption by Plan 02 (list/status/init commands) and Plan 03 (add command)
- Exports match the interfaces specified in the plan: fetchIndex, fetchArtifact, readManifest, writeManifest, createEmptyManifest, addManifestEntry, checksum, detectPackageManager, installDevCommand, formatListTable, formatStatusTable, formatDryRunHeader, formatActionLabel

---
*Phase: 15-cli-core*
*Completed: 2026-03-15*
