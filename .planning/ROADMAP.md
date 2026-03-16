# Roadmap: Petersen Group Monorepo

## Overview

Transform the existing Turborepo monorepo from a collection of independent Next.js sites into a DX reference platform with GitHub-native community features, automation, and CI.

## Milestones

- ✅ **v1.0 DX Reference Platform** — Phases 1-7.1 (shipped 2026-03-10)
- ✅ **v1.1 GitHub Integration** — Phases 8-11 (shipped 2026-03-14)
- 🚧 **v1.2 Blink CLI & DX Registry** — Phases 12-20 (in progress)

## Phases

<details>
<summary>✅ v1.0 DX Reference Platform (Phases 1-7.1) — SHIPPED 2026-03-10</summary>

- [x] Phase 1: Monorepo Cleanup (2/2 plans) — completed 2026-03-07
- [x] Phase 2: Design System (3/3 plans) — completed 2026-03-08
- [x] Phase 3: Content Engine (2/2 plans) — completed 2026-03-08
- [x] Phase 4: Content Rendering (2/2 plans) — completed 2026-03-08
- [x] Phase 5: Site Shell (2/2 plans) — completed 2026-03-08
- [x] Phase 6: Site Navigation (2/2 plans) — completed 2026-03-08
- [x] Phase 7: Site Discovery (4/4 plans) — completed 2026-03-08
- [x] Phase 7.1: Design Polish (3/3 plans) — completed 2026-03-09

See: `.planning/milestones/v1.0-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v1.1 GitHub Integration (Phases 8-11) — SHIPPED 2026-03-14</summary>

- [x] Phase 8: CI & Foundation (3/3 plans) — completed 2026-03-10
- [x] Phase 9: Community Engagement (2/2 plans) — completed 2026-03-11
- [x] Phase 10: GitHub Data Pages (2/2 plans) — completed 2026-03-12
- [x] Phase 11: AI Automation (2/2 plans) — completed 2026-03-13

See: `.planning/milestones/v1.1-ROADMAP.md` for full details.

</details>

### 🚧 v1.2 Blink CLI & DX Registry (In Progress)

**Milestone Goal:** Ship a CLI tool (`blink`) and registry API that lets anyone apply, update, and customize DX configurations from blakepetersen.io.

- [x] **Phase 12: Shared Types & Package Scaffold** - Workspace packages with shared schemas and build pipeline
- [x] **Phase 13: Artifact Pipeline** - Velite integration for dual-content model (MDX docs + distributable artifacts) (completed 2026-03-15)
- [x] **Phase 14: Registry API** - Static JSON endpoints serving artifact data from the site (completed 2026-03-15)
- [x] **Phase 15: CLI Core** - Apply, list, status, and init commands with whole-file mode (completed 2026-03-15)
- [x] **Phase 16: Section Markers & Lifecycle** - Managed regions, update, eject, diff, and doctor commands (completed 2026-03-15)
- [x] **Phase 17: Starter Content** - Config artifacts (ESLint, Prettier, TypeScript, Husky, CLAUDE.md templates) (completed 2026-03-15)
- [x] **Phase 18: Documentation** - Guides for CLAUDE.md hierarchy, Blink architecture, and companion docs (completed 2026-03-15)
- [x] **Phase 19: Publishing** - npm package publishing as @blink-dx/cli with blink binary (completed 2026-03-16)
- [ ] **Phase 20: Fix Integration Gaps** - Gap closure for audit-identified issues (ApplyActionBar slug, turbo cache, registry connectivity)

## Phase Details

### Phase 12: Shared Types & Package Scaffold
**Goal**: Both workspace packages exist with shared type contracts that CLI and web app consume
**Depends on**: Phase 11 (v1.1 complete)
**Requirements**: PKG-01, PKG-02, PKG-04
**Success Criteria** (what must be TRUE):
  1. `packages/blink-registry` exports Zod schemas for artifact metadata, manifest state, and registry responses
  2. `packages/blink-cli` builds via tsup into a single-file ESM binary with shebang
  3. `turbo build` and `turbo typecheck` succeed with both new packages in the dependency graph
**Plans**: 2 plans
Plans:
- [x] 12-01-PLAN.md — blink-registry package with Zod schemas and tests
- [x] 12-02-PLAN.md — blink-cli package scaffold with tsup build and turbo pipeline verification

### Phase 13: Artifact Pipeline
**Goal**: Content authors can define distributable artifacts alongside MDX docs and Velite processes them at build time
**Depends on**: Phase 12
**Requirements**: ART-01, ART-02, ART-03, ART-04, ART-05, REG-01
**Success Criteria** (what must be TRUE):
  1. An `.artifact.md` or `.artifact/` directory alongside an MDX doc is processed by Velite into structured artifact data
  2. Multi-file artifacts with a manifest.json produce correct file listings, destinations, and merge strategies
  3. Single-file artifacts declare their destination in frontmatter
  4. Artifacts can declare npm devDependencies in their metadata
  5. `pnpm build` produces `.velite/artifacts.json` (or equivalent) containing all artifact data
**Plans**: 2 plans
Plans:
- [x] 13-01-PLAN.md — Schema updates, CalVer utility, and workspace dependency wiring
- [x] 13-02-PLAN.md — Velite artifact collections, prepare hook merge, query helpers, and test content

### Phase 14: Registry API
**Goal**: The CLI (and any HTTP client) can discover and fetch artifact data from static JSON endpoints on blakepetersen.io
**Depends on**: Phase 13
**Requirements**: REG-02, REG-03, REG-04, REG-05, PKG-05
**Success Criteria** (what must be TRUE):
  1. `/r/index.json` returns a list of all available artifacts with metadata (name, type, version, description)
  2. `/r/<type>/<slug>.json` returns full artifact data including file contents and dependencies
  3. Each artifact has a CalVer version derived from its git commit date
  4. The ApplyActionBar component on content pages shows `blink apply <slug>` as the copy command
**Plans**: 2 plans
Plans:
- [x] 14-01-PLAN.md — Registry schema url field and Velite prepare hook endpoint generation
- [x] 14-02-PLAN.md — ApplyActionBar command update and artifact-conditional rendering

### Phase 15: CLI Core
**Goal**: Users can install blink and apply, browse, inspect, and initialize config management in their projects
**Depends on**: Phase 14
**Requirements**: CORE-01, CORE-02, CORE-03, CORE-07, CORE-09, CORE-10, CORE-11, SCOPE-02, SCOPE-03
**Success Criteria** (what must be TRUE):
  1. `blink apply <slug>` fetches an artifact from the registry, writes files to the project, and installs declared npm dependencies using the detected package manager
  2. `blink list` displays all available artifacts from the registry with type, name, and description
  3. `blink status` shows installed items from `.blink/manifest.json` with version and update availability
  4. `blink init` creates the `.blink/` directory and manifest in the current project
  5. `--dry-run` on any state-changing command previews operations without writing files, and `--yes` / non-TTY skips interactive prompts
**Plans**: 4 plans
Plans:
- [x] 15-01-PLAN.md — Utility modules: registry client, manifest manager, PM detection, output formatting
- [x] 15-02-PLAN.md — Init, list, and status commands with subcommand routing
- [x] 15-03-PLAN.md — Apply command with dry-run, conflict detection, and dependency installation
- [x] 15-04-PLAN.md — Gap closure: add --project flag to apply command (SCOPE-02)

### Phase 16: Section Markers & Lifecycle
**Goal**: Users can update managed configs without losing their customizations, eject from management, and diagnose issues
**Depends on**: Phase 15
**Requirements**: CORE-04, CORE-05, CORE-06, CORE-08, CORE-12, SCOPE-01, SCOPE-04, SCOPE-05, SCOPE-06, SCOPE-07, SCOPE-08
**Success Criteria** (what must be TRUE):
  1. `blink update [slug]` shows a diff preview of upstream changes and replaces only managed sections (between markers), preserving user content outside markers
  2. `blink eject <slug>` strips section markers from files and removes the item from the manifest without deleting files
  3. `blink diff <slug>` displays upstream changes without applying them
  4. `blink doctor` detects broken markers, orphaned manifest entries, and other integrity issues
  5. `blink apply --global` targets `~/.claude/` and global config locations; local modifications to managed sections prompt before overwriting; file writes are atomic (temp + rename)
**Plans**: 3 plans
Plans:
- [x] 16-01-PLAN.md — Foundation modules: markers engine, atomic writer, scope resolver, dependency resolver, manifest helpers
- [x] 16-02-PLAN.md — Apply modifications (markers, global, atomic, deps) + update and diff commands
- [ ] 16-03-PLAN.md — Eject and doctor commands

### Phase 17: Starter Content
**Goal**: The registry has a complete starter kit of production-ready config artifacts that users can apply
**Depends on**: Phase 16
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, CONT-07
**Success Criteria** (what must be TRUE):
  1. `blink apply eslint` installs an ESLint flat config with section markers and TypeScript strict rules
  2. `blink apply prettier` and `blink apply typescript` install opinionated Prettier and TypeScript configs
  3. `blink apply husky` installs Husky + lint-staged with pre-commit hook setup
  4. `blink apply claude-global` and `blink apply claude-project` install CLAUDE.md templates to the correct scope
  5. A "writing custom skills" artifact exists as a companion to the existing MDX guide
**Plans**: 3 plans
Plans:
- [ ] 17-01-PLAN.md — ESLint, Prettier, and TypeScript config artifacts
- [ ] 17-02-PLAN.md — Husky + lint-staged hook and CLAUDE.md template artifacts
- [ ] 17-03-PLAN.md — Writing custom skills artifact and build validation

### Phase 18: Documentation
**Goal**: Users understand the CLAUDE.md hierarchy, how Blink works, and can find related content through cross-references
**Depends on**: Phase 17
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04
**Success Criteria** (what must be TRUE):
  1. A published guide explains CLAUDE.md hierarchy: global vs project scope, what goes where, and precedence rules
  2. A published guide explains the Blink system: architecture, files it manages, benefits and risks
  3. Every starter content artifact has a companion MDX page documenting complementary tools, competitors, and best practices
  4. Content pages use `dependencies` and `related` frontmatter fields to cross-reference related artifacts and guides
**Plans**: 4 plans
Plans:
- [ ] 18-01-PLAN.md — Interactive MDX components and cross-reference UI
- [ ] 18-02-PLAN.md — CLAUDE.md hierarchy and Blink overview guides
- [ ] 18-03-PLAN.md — Companion documentation for starter content artifacts
- [ ] 18-04-PLAN.md — Cross-reference wiring and visual verification

### Phase 19: Publishing
**Goal**: Users can install blink from npm and the package is verified to work from a clean install
**Depends on**: Phase 18
**Requirements**: PKG-03
**Success Criteria** (what must be TRUE):
  1. `npm install -g @blink-dx/cli` installs successfully and `blink --help` shows available commands
  2. `blink apply eslint` works end-to-end from the published npm package against the live registry
**Plans**: 2 plans
Plans:
- [ ] 19-01-PLAN.md — Package rename, build config, READMEs, and publish preparation
- [ ] 19-02-PLAN.md — Publish to npm and end-to-end verification

### Phase 20: Fix Integration Gaps
**Goal**: All E2E flows from web to CLI work correctly against the live deployment
**Depends on**: Phase 19
**Requirements**: PKG-05, CORE-01, CORE-02
**Gap Closure:** Closes gaps from v1.2 audit
**Success Criteria** (what must be TRUE):
  1. ApplyActionBar renders `blink apply <slug>` (bare slug, no type prefix) — user copies command and it works in CLI
  2. `turbo.json` build outputs include `public/r/**` so turbo cache correctly invalidates registry files
  3. `blink list` succeeds against live `https://blakepetersen.io/r/index.json` endpoint
**Plans**: 1 plan
Plans:
- [ ] 20-01-PLAN.md — ApplyActionBar slug fix, turbo.json outputs, registry connectivity

## Progress

**Execution Order:**
Phases execute in numeric order: 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Monorepo Cleanup | v1.0 | 2/2 | Complete | 2026-03-07 |
| 2. Design System | v1.0 | 3/3 | Complete | 2026-03-08 |
| 3. Content Engine | v1.0 | 2/2 | Complete | 2026-03-08 |
| 4. Content Rendering | v1.0 | 2/2 | Complete | 2026-03-08 |
| 5. Site Shell | v1.0 | 2/2 | Complete | 2026-03-08 |
| 6. Site Navigation | v1.0 | 2/2 | Complete | 2026-03-08 |
| 7. Site Discovery | v1.0 | 4/4 | Complete | 2026-03-08 |
| 7.1 Design Polish | v1.0 | 3/3 | Complete | 2026-03-09 |
| 8. CI & Foundation | v1.1 | 3/3 | Complete | 2026-03-10 |
| 9. Community Engagement | v1.1 | 2/2 | Complete | 2026-03-11 |
| 10. GitHub Data Pages | v1.1 | 2/2 | Complete | 2026-03-12 |
| 11. AI Automation | v1.1 | 2/2 | Complete | 2026-03-13 |
| 12. Shared Types & Package Scaffold | v1.2 | Complete    | 2026-03-14 | 2026-03-14 |
| 13. Artifact Pipeline | 2/2 | Complete    | 2026-03-15 | - |
| 14. Registry API | 2/2 | Complete    | 2026-03-15 | - |
| 15. CLI Core | 4/4 | Complete    | 2026-03-15 | - |
| 16. Section Markers & Lifecycle | 3/3 | Complete    | 2026-03-15 | - |
| 17. Starter Content | 3/3 | Complete    | 2026-03-15 | - |
| 18. Documentation | 4/4 | Complete    | 2026-03-15 | - |
| 19. Publishing | 2/2 | Complete    | 2026-03-16 | - |
| 20. Fix Integration Gaps | 0/1 | Pending | - | - |
