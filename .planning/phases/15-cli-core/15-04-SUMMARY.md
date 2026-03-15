---
phase: 15-cli-core
plan: 04
subsystem: blink-cli
tags: [cli, scope, gap-closure]
dependency_graph:
  requires: [15-03]
  provides: [SCOPE-02]
  affects: [packages/blink-cli]
tech_stack:
  added: []
  patterns: [flag-driven-scope]
key_files:
  created: []
  modified:
    - packages/blink-cli/src/commands/apply.ts
    - packages/blink-cli/tests/commands/apply.test.ts
decisions:
  - "--project flag defaults to true, preserving existing behavior"
  - "scope derived from args.project ternary instead of hardcoded string"
metrics:
  duration: 98s
  completed: 2026-03-15T03:20:54Z
---

# Phase 15 Plan 04: --project Flag Gap Closure Summary

Added explicit --project boolean flag to blink apply command, wiring ManifestEntry.scope to the flag value instead of a hardcoded 'project' string.

## What Was Done

### Task 1: Add --project flag to apply command (TDD)

**RED:** Added 3 tests for --project flag behavior: default scope is 'project', explicit --project sets 'project', --project=false sets 'global'. Third test failed as expected (scope was hardcoded).

**GREEN:** Added `project` boolean arg (default: true) to apply command args. Replaced hardcoded `scope: 'project'` with `scope: args.project ? 'project' : 'global'`. Updated test helper `runApply` to include `project: true` in default args (matching citty's default resolution).

**Commits:**
- `ea9c586` test(15-04): add failing tests for --project flag behavior
- `8130ba1` feat(15-04): add --project flag to apply command

## Verification Results

- All 78 blink-cli tests pass (9 suites)
- TypeScript type-checking passes with no errors
- No hardcoded `scope: 'project'` remains in apply.ts
- `project` arg definition confirmed in apply command args block

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Test helper default:** Added `project: true` to `runApply` default args to match citty's runtime behavior where boolean defaults are applied before the run function executes.

## Self-Check: PASSED
