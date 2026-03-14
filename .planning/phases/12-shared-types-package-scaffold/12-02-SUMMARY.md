---
phase: 12-shared-types-package-scaffold
plan: 02
subsystem: cli
tags: [tsup, citty, esm, cli, workspace-package]

requires:
  - phase: 12-01
    provides: blink-registry schemas consumed via workspace dependency
provides:
  - blink-cli workspace package with tsup build producing single-file ESM binary
  - Verified turbo pipeline (build + typecheck) with both new packages
affects: [blink-cli-commands, registry-api, content-pipeline]

tech-stack:
  added: [tsup ^8.5.1, citty ^0.2.1, consola ^3.4.2, picocolors ^1.1.1]
  patterns: [single-file ESM binary with shebang via tsup noExternal, citty command definition]

key-files:
  created:
    - packages/blink-cli/package.json
    - packages/blink-cli/tsconfig.json
    - packages/blink-cli/tsconfig.test.json
    - packages/blink-cli/jest.config.ts
    - packages/blink-cli/tsup.config.ts
    - packages/blink-cli/src/cli.ts
    - packages/blink-cli/tests/build.test.ts
    - packages/blink-cli/.gitignore
  modified: []

key-decisions:
  - "Used outExtension in tsup config to force .mjs output with type:module package"
  - "citty/consola/picocolors as devDeps since tsup bundles everything via noExternal"

patterns-established:
  - "Single-file ESM binary pattern: tsup noExternal + shebang banner + .mjs output"
  - "Build validation test pattern: verify dist output structure and executability"

requirements-completed: [PKG-02, PKG-04]

duration: 7min
completed: 2026-03-14
---

# Phase 12 Plan 02: CLI Package Scaffold Summary

**blink-cli package with citty entry point, tsup single-file ESM binary build, and 4 build validation tests**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-14T22:49:48Z
- **Completed:** 2026-03-14T22:57:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created @blink/cli workspace package with ESM tsup build producing single-file binary with shebang
- Minimal citty CLI entry point that imports from blink-registry (proving workspace dependency)
- 4 build validation tests verifying dist output correctness
- turbo build and turbo typecheck succeed with both new packages in the dependency graph

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold blink-cli package with citty entry point and tsup build** - `8ebf7a9` (feat)
2. **Task 2 RED: Write failing build validation tests** - `59e6405` (test)
3. **Task 2 GREEN: Build validation tests pass and turbo pipeline verified** - `0ae3d42` (feat)

## Files Created/Modified
- `packages/blink-cli/package.json` - CLI package config with bin entry pointing to dist/cli.mjs
- `packages/blink-cli/tsconfig.json` - TypeScript config extending shared base
- `packages/blink-cli/tsconfig.test.json` - Test-specific TypeScript config
- `packages/blink-cli/jest.config.ts` - Jest config with ts-jest and node environment
- `packages/blink-cli/tsup.config.ts` - Build config for single-file ESM binary with shebang
- `packages/blink-cli/src/cli.ts` - Minimal citty entry point with blink-registry type import
- `packages/blink-cli/tests/build.test.ts` - Build output validation tests
- `packages/blink-cli/.gitignore` - Excludes dist/ from version control

## Decisions Made
- Used `outExtension` in tsup config to force `.mjs` output since `"type": "module"` causes tsup to default to `.js`
- citty/consola/picocolors placed in devDependencies since tsup bundles everything via `noExternal: [/.*/]`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed esbuild version mismatch preventing tsup build**
- **Found during:** Task 1 (initial build attempt)
- **Issue:** esbuild host version 0.27.3 did not match binary version 0.25.12 - platform-specific binary was missing
- **Fix:** Ran `pnpm install --force` to reinstall platform-specific esbuild binary
- **Files modified:** None (node_modules only)
- **Verification:** `pnpm --filter @blink/cli build` succeeds
- **Committed in:** 8ebf7a9 (Task 1 commit)

**2. [Rule 3 - Blocking] Added outExtension to tsup config for .mjs output**
- **Found during:** Task 1 (build produced .js instead of planned .mjs)
- **Issue:** With `"type": "module"` in package.json, tsup outputs `.js` for ESM format, but plan specifies `.mjs`
- **Fix:** Added `outExtension: () => ({ js: '.mjs' })` to tsup config
- **Files modified:** packages/blink-cli/tsup.config.ts
- **Verification:** Build produces dist/cli.mjs as expected
- **Committed in:** 8ebf7a9 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary to achieve planned output. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- blink-cli is ready for command implementation in subsequent phases
- Build pipeline established: tsup produces executable single-file ESM binary
- Both blink-registry and blink-cli are in the turbo dependency graph
- Test infrastructure ready for future command tests

---
*Phase: 12-shared-types-package-scaffold*
*Completed: 2026-03-14*
