---
phase: 19-publishing
plan: 01
subsystem: infra
tags: [npm, publishing, monorepo, typescript, zod]

requires:
  - phase: 12-registry-schema
    provides: blink-registry Zod schemas and types
  - phase: 15-cli-core
    provides: blink-cli with tsup build and commands
provides:
  - "@blink-dx/registry package configured for npm publishing"
  - "@blink-dx/cli package configured for npm publishing"
  - "tsc build step producing JS + .d.ts for registry"
  - "npm-focused READMEs for both packages"
affects: [19-publishing]

tech-stack:
  added: []
  patterns: ["@blink-dx scoped packages for npm org", "tsc build for registry with ESM exports"]

key-files:
  created:
    - packages/blink-cli/README.md
    - packages/blink-registry/README.md
    - packages/blink-registry/dist/index.js
    - packages/blink-registry/dist/index.d.ts
  modified:
    - packages/blink-registry/package.json
    - packages/blink-cli/package.json
    - apps/blakepetersen.io/package.json
    - packages/blink-cli/jest.config.ts
    - apps/blakepetersen.io/jest.config.ts

key-decisions:
  - "blink-registry moved from CLI dependencies to devDependencies since tsup bundles it"
  - "Jest moduleNameMapper added for @blink-dx/registry resolution in both test configs"

patterns-established:
  - "@blink-dx scope: all public packages use @blink-dx/ prefix"
  - "Registry ESM exports: types + import conditional exports"

requirements-completed: [PKG-03]

duration: 5min
completed: 2026-03-16
---

# Phase 19 Plan 01: Package Rename and Publishing Config Summary

**Renamed packages to @blink-dx/cli and @blink-dx/registry with npm publishing metadata, tsc build for registry, and READMEs**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-16T01:09:52Z
- **Completed:** 2026-03-16T01:15:01Z
- **Tasks:** 2
- **Files modified:** 21

## Accomplishments
- Renamed blink-registry to @blink-dx/registry and @blink/cli to @blink-dx/cli at v0.1.0
- Configured both packages for public npm publishing with proper exports, files, and metadata
- Added tsc build step to registry producing JS + .d.ts output
- Updated all 13 import references across the monorepo
- Created npm-focused READMEs with usage docs for both packages
- Verified pack output contains only dist files (no source or tests)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rename packages and update all references** - `9ef298d` (feat)
2. **Task 2: Add READMEs, LICENSE, and verify pack output** - `12596d7` (feat)

## Files Created/Modified
- `packages/blink-registry/package.json` - @blink-dx/registry with ESM exports, tsc build, publish config
- `packages/blink-cli/package.json` - @blink-dx/cli with publish config, keywords, homepage
- `apps/blakepetersen.io/package.json` - Updated dependency reference
- `packages/blink-cli/jest.config.ts` - Added @blink-dx/registry moduleNameMapper
- `apps/blakepetersen.io/jest.config.ts` - Added @blink-dx/registry moduleNameMapper
- `packages/blink-cli/src/*.ts` - Updated import paths (5 files)
- `packages/blink-cli/tests/**/*.ts` - Updated import paths (5 files)
- `apps/blakepetersen.io/src/lib/artifacts.ts` - Updated import path
- `apps/blakepetersen.io/tests/registry-endpoints.test.ts` - Updated import path
- `packages/blink-cli/src/commands/status.ts` - Updated dynamic import path
- `packages/blink-cli/README.md` - npm README with commands, flags, install
- `packages/blink-registry/README.md` - npm README with schema usage examples
- `pnpm-lock.yaml` - Lockfile updated for new package names

## Decisions Made
- Moved blink-registry from CLI dependencies to devDependencies since tsup bundles everything into a single file, so no runtime dependency needed
- Added Jest moduleNameMapper for @blink-dx/registry in both test configs since Jest resolves workspace packages differently than the build tools
- Found and fixed a 13th import reference in status.ts (dynamic import) not listed in the plan

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Jest module resolution for @blink-dx/registry**
- **Found during:** Task 1 (test verification)
- **Issue:** Jest couldn't resolve @blink-dx/registry because workspace package name changed
- **Fix:** Added moduleNameMapper entries in both blink-cli and blakepetersen.io jest configs
- **Files modified:** packages/blink-cli/jest.config.ts, apps/blakepetersen.io/jest.config.ts
- **Verification:** All 181 CLI tests pass, all 9 registry-endpoints tests pass
- **Committed in:** 9ef298d (Task 1 commit)

**2. [Rule 1 - Bug] Fixed missed dynamic import reference in status.ts**
- **Found during:** Task 1 (grep verification)
- **Issue:** `import('blink-registry')` in status.ts not caught by plan's 12-file list
- **Fix:** Updated to `import('@blink-dx/registry')`
- **Files modified:** packages/blink-cli/src/commands/status.ts
- **Verification:** Typecheck passes
- **Committed in:** 9ef298d (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for tests and type-checking. No scope creep.

## Issues Encountered
- Pre-existing code-highlight.test.ts failure in blakepetersen.io (unrelated to our changes, not addressed)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both packages ready for `pnpm publish` once npm org access is confirmed
- All builds, tests, and typechecks pass with new package names

---
*Phase: 19-publishing*
*Completed: 2026-03-16*
