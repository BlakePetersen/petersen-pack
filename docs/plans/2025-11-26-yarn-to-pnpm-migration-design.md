# Yarn to pnpm Migration Design

**Date:** 2025-11-26
**Goal:** Migrate petersen-group monorepo from Yarn 1.22.19 to pnpm for faster installs and better disk usage

## Overview

This migration uses pnpm's strict mode (no hoisting) to gain full benefits: faster installs, isolated dependencies, and better disk usage. We fix all phantom dependencies before migrating to ensure builds succeed under strict isolation.

## Phase 1: Fix Phantom Dependencies

Yarn hoists all packages to the root `node_modules`, which hides missing dependencies. pnpm's strict mode creates isolated `node_modules` per workspace, so missing dependencies break builds.

**Known phantom dependencies:**

- `blakepetersen.io` imports `redux`, `redux-devtools-extension`, `redux-thunk` but doesn't declare them

**Process:**

1. Search all source files in each workspace for imports
2. Cross-reference imports against workspace `package.json` files
3. Add missing dependencies to the correct `package.json`
4. Verify with Yarn before migrating

**Success criteria:**

- All dependencies declared in workspace `package.json` files
- Clean Yarn install and build confirm no broken imports

## Phase 2: Configure pnpm

Create and modify files to configure pnpm's strict mode.

**Create `.npmrc`:**

```
auto-install-peers=true
strict-peer-dependencies=false
```

- `auto-install-peers=true` installs peer dependencies automatically
- `strict-peer-dependencies=false` reduces warnings during transition

**Update `package.json`:**

- Change `packageManager` from `"yarn@1.22.19"` to `"pnpm@9.x.x"`
- Verify `lint-staged` config (already references `pnpm`)

**Create `pnpm-workspace.yaml`:**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

This replaces Yarn's `workspaces` field.

**Success criteria:**

- `.npmrc` created with strict mode settings
- `pnpm-workspace.yaml` created with workspace patterns
- `packageManager` field updated in root `package.json`

## Phase 3: Execute Migration

**Handle uncommitted changes:**
Reset modified `package.json` files and untracked `yarn.lock` to start with clean git state.

**Clean artifacts:**

1. Remove `yarn.lock`
2. Remove all `node_modules` directories (root + all workspaces)
3. Remove `.turbo` cache directories

**Install and verify:**

1. Run `pnpm install` to generate `pnpm-lock.yaml`
2. Run `pnpm build` to verify all workspaces build
3. Run `pnpm lint` to verify linting works
4. Run `pnpm test` to verify tests pass

**Success criteria:**

- `pnpm-lock.yaml` generated
- All workspaces build successfully
- All tests pass
- Linting passes

## Phase 4: Finalize

**Update documentation:**

- Change `yarn` references to `pnpm` in README files
- Update installation and development instructions

**Update CI/CD:**

- Check CI/CD configs for `yarn` references
- Update to use `pnpm`

**Commit changes:**

```
chore: migrate from yarn to pnpm

- Add missing dependencies to fix phantom deps
- Configure pnpm strict mode (no hoisting)
- Generate pnpm-lock.yaml
- Update documentation and CI/CD
```

**Success criteria:**

- Documentation updated
- CI/CD configs updated (if applicable)
- All changes committed
- No phantom dependencies remain

## Benefits

- **Faster installs:** pnpm uses content-addressable storage
- **Better disk usage:** Hard links save space across projects
- **Strict dependencies:** Isolated node_modules catch missing dependencies
- **Better monorepo support:** Built-in workspace filtering and protocols
