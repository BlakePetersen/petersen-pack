---
phase: 15-cli-core
plan: 02
subsystem: cli
tags: [citty, consola, picocolors, subcommands, init, list, status]

requires:
  - phase: 15-cli-core
    provides: Registry fetch, manifest CRUD, PM detection, output formatting utilities
provides:
  - blink init command with .gitignore management and dry-run
  - blink list command with grouped table and JSON output
  - blink status command with update indicators and JSON output
  - Subcommand routing via citty lazy imports
affects: [15-03]

tech-stack:
  added: []
  patterns: [citty subcommand routing with lazy imports, consola named import pattern]

key-files:
  created:
    - packages/blink-cli/src/commands/init.ts
    - packages/blink-cli/src/commands/list.ts
    - packages/blink-cli/src/commands/status.ts
    - packages/blink-cli/tests/commands/init.test.ts
    - packages/blink-cli/tests/commands/list.test.ts
    - packages/blink-cli/tests/commands/status.test.ts
  modified:
    - packages/blink-cli/src/cli.ts
    - packages/blink-cli/tsup.config.ts
    - packages/blink-cli/tests/build.test.ts

key-decisions:
  - "Removed apply subcommand from cli.ts to pass typecheck (Plan 03 will add it when the module exists)"
  - "Added splitting: false to tsup config to maintain single-file ESM binary with lazy imports"
  - "Mock citty/consola/picocolors in command tests to avoid ESM transform issues in Jest"
  - "Use named consola import (not default) for TypeScript compatibility"

patterns-established:
  - "Command test pattern: mock citty defineCommand as passthrough, call command.run() directly"
  - "consola named import: use { consola } from 'consola' (not default import)"

requirements-completed: [CORE-02, CORE-03, CORE-07, CORE-09, CORE-10]

duration: 8min
completed: 2026-03-15
---

# Phase 15 Plan 02: Init, List, and Status Commands Summary

**Three CLI subcommands (init/list/status) with dry-run, JSON output, and citty subcommand routing**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-15T02:49:54Z
- **Completed:** 2026-03-15T02:57:33Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Init command creates .blink/manifest.json, manages .gitignore entries, detects package manager, supports --dry-run
- List command fetches registry and displays grouped table or raw JSON, handles network errors
- Status command reads manifest, shows installed items with update indicators from registry, supports --json
- CLI entry point routes to subcommands via citty lazy imports, shows help when no command given

## Task Commits

Each task was committed atomically:

1. **Task 1: Init command with .gitignore management and --dry-run** - `a9927fa` (feat)
2. **Task 2: List and status commands with --json support** - `09d8079` (feat)
3. **Task 3: Wire subcommand routing in cli.ts** - `c046879` (feat)
4. **Fix: Named consola import** - `2cd7a77` (fix)

## Files Created/Modified
- `packages/blink-cli/src/commands/init.ts` - Init command with manifest creation, .gitignore, dry-run
- `packages/blink-cli/src/commands/list.ts` - Registry listing with grouped table and JSON output
- `packages/blink-cli/src/commands/status.ts` - Installed items with update availability
- `packages/blink-cli/src/cli.ts` - Subcommand routing via citty lazy imports
- `packages/blink-cli/tsup.config.ts` - Added splitting: false for single-file output
- `packages/blink-cli/tests/commands/init.test.ts` - 12 tests for init command
- `packages/blink-cli/tests/commands/list.test.ts` - 4 tests for list command
- `packages/blink-cli/tests/commands/status.test.ts` - 6 tests for status command
- `packages/blink-cli/tests/build.test.ts` - Updated for subcommand help output

## Decisions Made
- Removed apply subcommand registration from cli.ts since the module doesn't exist yet (Plan 03 adds it)
- Added `splitting: false` to tsup config because dynamic imports caused code-splitting into chunks
- Used named consola import (`{ consola }`) instead of default import for TypeScript compatibility
- Mocked citty/consola/picocolors in tests to avoid ESM module transform issues with Jest

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added splitting: false to tsup config**
- **Found during:** Task 3 (Wire subcommand routing)
- **Issue:** Dynamic imports in subCommands caused tsup/esbuild to code-split into multiple chunks, breaking the single-file binary constraint validated by build tests
- **Fix:** Added `splitting: false` to tsup.config.ts
- **Files modified:** packages/blink-cli/tsup.config.ts
- **Verification:** Build produces single dist/cli.mjs, all build tests pass
- **Committed in:** c046879 (Task 3 commit)

**2. [Rule 1 - Bug] Fixed consola default import**
- **Found during:** Task 3 (typecheck verification)
- **Issue:** consola v3 requires named import `{ consola }`, not default import
- **Fix:** Changed all command files from `import consola from 'consola'` to `import { consola } from 'consola'`, updated test mocks
- **Files modified:** packages/blink-cli/src/commands/init.ts, list.ts, status.ts and test files
- **Verification:** `pnpm typecheck` passes
- **Committed in:** 2cd7a77

**3. [Rule 1 - Bug] Updated build test for subcommand help output**
- **Found during:** Task 3 (verification)
- **Issue:** citty with subCommands shows help and exits with code 1 (not the old custom message), breaking existing build test
- **Fix:** Updated build test to expect subcommand names in help output, handle non-zero exit
- **Files modified:** packages/blink-cli/tests/build.test.ts
- **Verification:** All build tests pass
- **Committed in:** c046879 (Task 3 commit)

**4. [Rule 3 - Blocking] Removed apply from subCommands**
- **Found during:** Task 3 (typecheck)
- **Issue:** Plan specified including `apply` subcommand, but `./commands/apply` doesn't exist yet, causing TS2307
- **Fix:** Removed apply from subCommands (Plan 03 will add it)
- **Files modified:** packages/blink-cli/src/cli.ts
- **Committed in:** c046879 (Task 3 commit)

---

**Total deviations:** 4 auto-fixed (2 bugs, 2 blocking)
**Impact on plan:** All fixes necessary for correctness and build integrity. No scope creep.

## Issues Encountered
- ESM-only packages (citty, consola, picocolors) cannot be directly imported in Jest without transformation. Solved by mocking these packages in command tests.
- Jest 30 uses `--testPathPatterns` (plural) instead of `--testPathPattern`

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All three commands operational and tested (22 new tests, 60 total)
- CLI entry point ready for apply command addition in Plan 03
- Subcommand pattern established for Plan 03 to follow

---
*Phase: 15-cli-core*
*Completed: 2026-03-15*
