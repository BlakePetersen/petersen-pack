---
phase: 28-authoring-scaffolds-lint-port
plan: 02
subsystem: blink-cli/lint
tags: [lint, ajv, frontmatter, content-validation, tdd]
dependency_graph:
  requires: [28-01]
  provides: [lint-rules, lint-runner, lint-reporter]
  affects: [28-05]
tech_stack:
  added: [ajv@8.20, ajv-formats@3.0.1, gray-matter@4.0.3]
  patterns: [Ajv schema validation, TDD RED/GREEN, recursive file discovery, ESLint-style reporting]
key_files:
  created:
    - packages/blink-cli/src/lint/types.ts
    - packages/blink-cli/src/lint/rules/frontmatter-schema.ts
    - packages/blink-cli/src/lint/rules/artifact-pair.ts
    - packages/blink-cli/src/lint/rules/voice-primitive.ts
    - packages/blink-cli/src/lint/reporter.ts
    - packages/blink-cli/src/lint/runner.ts
    - packages/blink-cli/tests/lint/rules/frontmatter-schema.test.ts
    - packages/blink-cli/tests/lint/rules/artifact-pair.test.ts
    - packages/blink-cli/tests/lint/rules/voice-primitive.test.ts
    - packages/blink-cli/tests/lint/reporter.test.ts
  modified:
    - packages/blink-cli/package.json
    - pnpm-lock.yaml
decisions:
  - "$schema field stripped from JSON Schema for Ajv 8 compatibility (draft-2020-12 meta-schema not needed for keyword validation)"
  - "useDefaults:true on check validator so Zod default() fields pass required check (JSON Schema lists them as required)"
  - "statSync used instead of readdirSync withFileTypes to avoid Node 24 Dirent<NonSharedBuffer> type incompatibility"
  - "checkOrphans is a separate method on artifactPairRule (not per-file check) because it scans directory-level"
metrics:
  duration: 8m
  completed: "2026-05-03T07:15:00Z"
  tasks: 3
  files_created: 10
  files_modified: 2
  test_count: 28
---

# Phase 28 Plan 02: Lint Rules, Reporter, and Runner Summary

Three lint rules (frontmatter-schema, artifact-pair, voice-primitive), ESLint-style reporter, and lint runner with recursive file discovery and --fix support via Ajv + gray-matter.

## Task Breakdown

| Task | Name | Commit(s) | Status |
|------|------|-----------|--------|
| 1 | Install deps + lint types + frontmatter-schema rule | 928f4d3, d3d6a66 | Done |
| 2 | Artifact-pair rule + voice-primitive rule | 8917ab1, fc83c80 | Done |
| 3 | Reporter + runner + integration test | 7839778, 650250b | Done |

## Key Implementation Details

### Frontmatter-schema rule (LINT-01)
- Validates against JSON Schema derived from `getDxJsonSchema()` (Zod 4 native `z.toJSONSchema()`)
- `$schema` field stripped before Ajv compile (Ajv 8 doesn't support draft-2020-12 meta-schema validation)
- Both check and fix validators use `useDefaults: true` so fields with Zod `.default()` pass validation
- Severity: error (blocks CI per D-06)

### Artifact-pair rule (LINT-02)
- Missing artifact when `requires_artifact: true`: error severity
- Orphan `.artifact.md` without sibling `.mdx`: warning severity
- Orphan with sibling that has `requires_artifact: false`: warning (advisory)
- Multi-file `.artifact/` directories count as valid artifacts
- Fix generates stub `.artifact.md` from frontmatter title/description

### Voice-primitive rule (LINT-03)
- All diagnostics are warnings (advisory per v1.4-PLAN-06 / LINT-07)
- Maps voice values to component patterns: `author-note` -> `<AuthorNote`, `decision-rationale` -> `<DecisionRationale`
- Advisory flag for rationale-shaped headings (`## Why`, `## Decision`, `## Trade-off`, etc)
- Fix adds `decision-rationale` to voice array when heading detected; never modifies body

### Reporter (D-05)
- Groups diagnostics by file path with bold headers
- Indented violations with position, colored severity, message, dimmed rule name
- Summary footer with error/warning counts

### Runner
- Recursive `.mdx` file discovery (skips `node_modules`, `.git`)
- Parses frontmatter via `gray-matter`, builds `LintContext` per file
- Orchestrates all three rules + orphan scan
- Supports `--files` mode (for lint-staged) and `--fix` mode

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Ajv 8 draft-2020-12 incompatibility**
- **Found during:** Task 1
- **Issue:** `z.toJSONSchema()` produces `$schema: "https://json-schema.org/draft/2020-12/schema"` which Ajv 8 core cannot meta-validate
- **Fix:** Strip `$schema` from schema object before `ajv.compile()`, set `validateSchema: false`
- **Files modified:** packages/blink-cli/src/lint/rules/frontmatter-schema.ts
- **Commit:** d3d6a66

**2. [Rule 3 - Blocking] JSON Schema required vs defaults mismatch**
- **Found during:** Task 1
- **Issue:** Zod marks fields with `.default()` as required in JSON Schema, so check validator without `useDefaults` reports them as missing
- **Fix:** Enabled `useDefaults: true` on check validator (operates on cloned data)
- **Files modified:** packages/blink-cli/src/lint/rules/frontmatter-schema.ts
- **Commit:** d3d6a66

**3. [Rule 3 - Blocking] Node 24 Dirent<NonSharedBuffer> type error**
- **Found during:** Task 3
- **Issue:** `readdirSync(dir, { withFileTypes: true })` returns `Dirent<NonSharedBuffer>[]` in Node 24 types, incompatible with string operations
- **Fix:** Use `readdirSync(dir)` (returns string[]) + `statSync` for entry classification
- **Files modified:** packages/blink-cli/src/lint/runner.ts, packages/blink-cli/src/lint/rules/artifact-pair.ts
- **Commit:** 650250b

**4. [Rule 3 - Blocking] blink-registry dist stale after Plan 01**
- **Found during:** Task 1
- **Issue:** `getDxJsonSchema` export missing from CJS dist (added in Plan 01 but not rebuilt)
- **Fix:** Rebuilt blink-registry with `pnpm build`
- **Files modified:** packages/blink-registry/dist/* (generated, gitignored)
- **Commit:** N/A (build artifact)

## TDD Gate Compliance

All three tasks followed RED/GREEN TDD cycle:
- Task 1: test(28-02) 928f4d3 -> feat(28-02) d3d6a66
- Task 2: test(28-02) 8917ab1 -> feat(28-02) fc83c80
- Task 3: test(28-02) 7839778 -> feat(28-02) 650250b

## Verification Results

- `pnpm --filter @blink/cli test -- --testPathPattern lint`: 28 tests, 4 suites, all passing
- `pnpm --filter @blink/cli typecheck`: clean (0 errors)
- `pnpm --filter @blink/cli build`: tsup bundles successfully (762.62 KB with gray-matter + ajv)

## Self-Check: PASSED
