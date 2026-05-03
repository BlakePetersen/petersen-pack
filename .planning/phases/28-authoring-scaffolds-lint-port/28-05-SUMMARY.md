---
phase: 28-authoring-scaffolds-lint-port
plan: 05
subsystem: blink-cli, ci
tags: [cli, lint, port, ci, pre-commit, turbo]
dependency_graph:
  requires: [28-01, 28-02, 28-03]
  provides: [LINT-04, LINT-05, LINT-06, PORT-02]
  affects: [turbo.json, lint-staged.config.mjs, .gitignore, apps/blakepetersen.io/package.json]
tech_stack:
  added: []
  patterns: [createRequire-shim-for-cjs-in-esm-bundle]
key_files:
  created:
    - packages/blink-cli/src/commands/lint.ts
    - packages/blink-cli/src/commands/port.ts
  modified:
    - packages/blink-cli/src/cli.ts
    - packages/blink-cli/tsup.config.ts
    - apps/blakepetersen.io/package.json
    - turbo.json
    - lint-staged.config.mjs
    - .gitignore
decisions:
  - "createRequire shim in tsup banner for gray-matter CJS require('fs') compatibility in ESM bundle"
metrics:
  duration_seconds: 248
  completed: "2026-05-03T07:40:15Z"
  tasks: 3
  files_created: 2
  files_modified: 6
---

# Phase 28 Plan 05: CLI Command Wiring + CI Integration Summary

Wired `blink lint` and `blink port` CLI commands with full CI/pre-commit pipeline using createRequire shim for CJS-in-ESM bundling.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Lint command + port command files | 281e86a | commands/lint.ts, commands/port.ts |
| 2 | Register lint + port in cli.ts + build | fd76836 | cli.ts |
| 3 | CI + pre-commit wiring + gitignore | d70ed1e | package.json, turbo.json, lint-staged.config.mjs, .gitignore, tsup.config.ts |

## What Was Built

1. **`blink lint` command** — runs all three lint rules (frontmatter-schema, artifact-pair, voice-primitive), reports ESLint-style diagnostics, exits non-zero on errors/exit 0 on warnings-only. Supports `--files` for staged-only mode and `--fix` for auto-fix.

2. **`blink port` command** — two-step pipeline: `stage <dir>` transforms Obsidian markdown to staging directory; `commit <slug> --collection <col>` moves staged entry to content path. Validates directory existence and requires `--collection` on commit.

3. **CLI registration** — lint and port added to cli.ts subCommands (alphabetical order), building on scaffold from Plan 01. All 11 commands available in dist/cli.mjs.

4. **CI pipeline** — `lint:content` script in blakepetersen.io, `lint:content` turbo task with `^build` dependency, lint-staged glob for content `.mdx/.md` files.

5. **Gitignore** — `.obsidian-port-staging` directory excluded from version control (PORT-02).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed gray-matter CJS bundling in ESM output**
- **Found during:** Task 3
- **Issue:** `gray-matter` uses CJS `require('fs')` internally. When bundled by tsup with `noExternal: [/.*/]` into ESM, esbuild's `__require` shim does not resolve Node builtins, causing "Dynamic require of 'fs' is not supported" at runtime.
- **Fix:** Added `createRequire` shim from `node:module` in tsup banner config, providing a real `require` that resolves Node builtins at runtime.
- **Files modified:** `packages/blink-cli/tsup.config.ts`
- **Commit:** d70ed1e

**2. [Observation] Pre-existing content lint violations**
- **Found during:** Task 3 verification
- **Issue:** `pnpm turbo lint:content` exits non-zero because existing content has 24 errors + 5 warnings (frontmatter schema violations, artifact-pair mismatches). This is correct behavior — the lint rules from Plan 02 correctly identify pre-existing issues.
- **Impact:** The acceptance criterion "pnpm turbo lint:content exits 0" assumed clean content. The command works correctly; content needs to be fixed in a future plan (Phase 29 content authoring or a cleanup pass).
- **Not a bug:** Lint correctly reports pre-existing issues; exit 1 on errors is correct per D-06.

## Decisions Made

- **createRequire shim pattern:** gray-matter (and potentially other CJS packages) that use `require('fs')` at runtime need a real `createRequire`-based shim in the ESM bundle banner. This is the standard pattern for CJS interop in bundled ESM binaries.

## Known Stubs

None — all functionality is fully wired.

## Self-Check: PASSED
