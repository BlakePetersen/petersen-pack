---
phase: 28-authoring-scaffolds-lint-port
plan: 01
subsystem: blink-cli, blink-registry
tags: [scaffold, schema, cli, zod, mdx]
dependency_graph:
  requires: []
  provides: [DxFrontmatterSchema, getDxJsonSchema, DX_COLLECTIONS, generateScaffold, blink-scaffold-command]
  affects: [packages/blink-registry, packages/blink-cli]
tech_stack:
  added: []
  patterns: [z.toJSONSchema native derivation, collection-specific body templates, singular-to-plural mapping]
key_files:
  created:
    - packages/blink-registry/src/schemas/dx-frontmatter.ts
    - packages/blink-registry/tests/dx-frontmatter.test.ts
    - packages/blink-cli/src/scaffold/templates.ts
    - packages/blink-cli/src/scaffold/generator.ts
    - packages/blink-cli/src/commands/scaffold.ts
    - packages/blink-cli/tests/scaffold/generator.test.ts
  modified:
    - packages/blink-registry/src/index.ts
    - packages/blink-cli/src/cli.ts
decisions:
  - "z.toJSONSchema() native Zod 4 — no zod-to-json-schema dep needed"
  - "CrossRefSchema defined locally in dx-frontmatter.ts (cannot reuse Velite's different Zod instance)"
  - "Scaffold slug → title conversion via simple split-capitalize (slugToTitle helper)"
  - "content-root flag defaults to apps/blakepetersen.io/content from cwd"
metrics:
  duration: 262s
  completed: "2026-05-03T07:02:49Z"
  tasks: 3
  files_created: 6
  files_modified: 2
  tests_added: 18
---

# Phase 28 Plan 01: Scaffold CLI + DxFrontmatterSchema Summary

DxFrontmatterSchema as canonical Zod 4 mirror of Velite dxFields, plus `blink scaffold` command generating collection-specific MDX skeletons with companion artifacts via atomicWrite.

## Task Completion

| Task | Name | Commit(s) | Status |
|------|------|-----------|--------|
| 1 | DxFrontmatterSchema in blink-registry | 85d8d3b (RED), a97049a (GREEN) | Done |
| 2 | Scaffold templates + generator module | fb6c631 (RED), 04bd160 (GREEN) | Done |
| 3 | Scaffold command + cli.ts registration | 56ffba7 | Done |

## What Was Built

1. **DxFrontmatterSchema** — All 13 dxFields mirrored in Zod 4 with correct defaults, maxLength constraints, and enum restrictions. `getDxJsonSchema()` derives JSON Schema natively via `z.toJSONSchema()`. `DX_COLLECTIONS` exported as canonical collection list.

2. **Scaffold templates** — `getBodyTemplate()` returns collection-specific MDX body sections (skills: Overview/Usage/Configuration, configs: Installation/Options/Customization, hooks: When to Use/Setup/API, guides: Prerequisites/Steps/Troubleshooting). Voice stubs inject `import { AuthorNote } from 'artax-ui'` and `<AuthorNote>` blocks.

3. **Scaffold generator** — `generateScaffold()` validates collection + slug (SlugSchema), builds YAML frontmatter (title, description, applies_to, draft:true), composes body from template, generates companion `.artifact.md` for non-guide collections. Supports --dry-run (returns plans without writing) and --force (overwrites existing).

4. **CLI command** — `blink scaffold <collection> <slug>` wired via citty defineCommand with positional args + --dry-run, --force, --voice, --content-root flags. Registered as lazy import in cli.ts.

## TDD Gate Compliance

Task 1: test(28-01) commit 85d8d3b (RED) -> feat(28-01) commit a97049a (GREEN) -- compliant
Task 2: test(28-01) commit fb6c631 (RED) -> feat(28-01) commit 04bd160 (GREEN) -- compliant

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `pnpm --filter blink-registry test` — 96 tests pass (6 new dx-frontmatter tests)
- `pnpm --filter blink-registry typecheck` — clean
- `pnpm --filter @blink/cli test -- --testPathPattern scaffold` — 12 tests pass
- `pnpm --filter @blink/cli build` — dist/cli.mjs 761KB, success
- `pnpm --filter @blink/cli typecheck` — clean

## Self-Check: PASSED

All 6 created files exist. All 5 commits found in git log.
