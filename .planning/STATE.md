---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Blink CLI & DX Registry
status: completed
stopped_at: Phase 19 context gathered
last_updated: "2026-03-16T00:56:42.203Z"
last_activity: 2026-03-15 — Completed 18-04 cross-references and validation
progress:
  total_phases: 8
  completed_phases: 7
  total_plans: 20
  completed_plans: 21
  percent: 95
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-14)

**Core value:** Developers can discover, reference, and apply opinionated AI-first DX practices from a single authoritative source
**Current focus:** Phase 19 — Publishing

## Current Position

Phase: 19 of 19 (Publishing)
Plan: 01 of 02 complete
Status: In Progress
Last activity: 2026-03-16 — Completed 19-01 package rename and publishing config

Progress: [██████████] 95% (21/22 plans)

## Performance Metrics

**Velocity (v1.0 + v1.1):**
- v1.0: 20 plans in ~3.3 hours
- v1.1: 9 plans in ~3 days
- Combined: 29 plans across 2 milestones

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Blink CLI as @blink/cli npm package — clean namespace for future tools
- API-first distribution with static JSON — always fresh from site, no dynamic routes
- Section markers for managed updates — preserve user customizations
- Dual-content model (MDX + artifact) — docs annotate, artifacts are production-ready
- [Phase 12]: Source exports only for blink-registry (no build step), following artax-ui pattern
- [Phase 12]: Domain-split schemas with shared primitives to avoid circular dependencies
- [Phase 12]: tsup outExtension for .mjs output with type:module packages
- [Phase 12]: citty/consola/picocolors as devDeps since tsup bundles via noExternal
- [Phase 13]: Pure calverFromDate helper wraps date logic for testability; deriveCalVer handles git integration
- [Phase 13]: Inline artifact validation in velite prepare hook (avoids blink-registry ESM resolution issues)
- [Phase 13]: Artifact slugs use filename-only (no directory prefix) to match SlugSchema
- [Phase 14]: Consistent artifact lookup across all page types including guides
- [Phase 14]: CalVer max version as generatedAt for deterministic registry output
- [Phase 14]: No blink-registry import in velite.config.ts (ESM resolution, per Phase 13)
- [Phase 14]: CalVer max version as generatedAt for deterministic registry output
- [Phase 15]: Read BASE_URL from env at call time for dynamic BLINK_REGISTRY_URL override
- [Phase 15]: PM detection uses ordered config array for priority (pnpm > yarn > npm)
- [Phase 15]: Output formatters return strings (not print) for testability
- [Phase 15]: splitting: false in tsup config to maintain single-file binary with lazy imports
- [Phase 15]: Named consola import ({ consola }) required for TypeScript compatibility
- [Phase 15]: Mock citty/consola/picocolors in command tests to avoid Jest ESM issues
- [Phase 15]: --project flag defaults true, scope derived from args.project ternary
- [Phase 16]: diff v8 has built-in TypeScript types; @types/diff deprecated and unnecessary
- [Phase 16]: Line-based marker parsing (not single regex) for debuggability
- [Phase 16]: Trailing newline normalization in extracted content for consistent checksumming
- [Phase 16]: Scope derived from --global flag (not inverted --project) for clarity
- [Phase 16]: Global scope tests mock @/scope to avoid writing to real $HOME
- [Phase 16]: Update uses entry.scope from manifest for per-item resolution
- [Phase 17]: Skill files nested at .claude/skills/ inside artifact dir to match manifest destination paths
- [Phase 17]: lint-staged patterns: JS/TS get eslint+prettier, JSON/MD/YAML/CSS get prettier only
- [Phase 17]: CLAUDE.md templates use blink markers for section-based managed updates
- [Phase 17]: Prettier .prettierignore uses merge: section while .prettierrc.json uses merge: replace per JSON limitation
- [Phase 17]: TypeScript artifact uses JSONC comments for rationale on non-obvious strict options
- [Phase 18]: useSyncExternalStore for localStorage tab persistence (avoids setState-in-effect lint violation)
- [Phase 18]: Callout component registered in MDX map from artax-ui (was exported but not mapped)
- [Phase 18]: Bidirectional cross-references use full slug format matching resolveRelatedSlugs
- [Phase 19]: blink-registry moved to CLI devDependencies since tsup bundles it (no runtime dep)
- [Phase 19]: Jest moduleNameMapper needed for @blink-dx/registry resolution in test configs

### Pending Todos

None.

### Blockers/Concerns

- @blink npm org scope must be registered before Phase 19 (publishing)
- Velite prepare hook extension validated (Phase 13-02 complete)
- Section marker survival across formatters needs validation (Phase 16)

## Session Continuity

Last session: 2026-03-16T01:15:01Z
Stopped at: Completed 19-01-PLAN.md
Resume file: .planning/phases/19-publishing/19-02-PLAN.md
