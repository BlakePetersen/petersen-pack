# Roadmap: Petersen Group Monorepo

## Overview

Transform the existing Turborepo monorepo from a collection of independent Next.js sites into a DX reference platform. The work flows from infrastructure cleanup through a design system and content engine, into the site shell with navigation and discovery features, then community integration, CLI skill, and finally the high-risk Monodex sync. Each phase delivers a coherent, verifiable capability that subsequent phases build on.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Monorepo Cleanup** - Update deps, remove dead packages, fix tooling (completed 2026-03-07)
- [x] **Phase 2: Design System** - Build artax-ui v2 with Tailwind v4, Radix primitives, dark-first theming (completed 2026-03-08)
- [x] **Phase 3: Content Engine** - Velite pipeline with typed schemas, directory structure, frontmatter validation (completed 2026-03-08)
- [ ] **Phase 4: Content Rendering** - Syntax-highlighted code blocks and content dependency graph
- [ ] **Phase 5: Site Shell** - Rebuild blakepetersen.io on App Router with static generation
- [ ] **Phase 6: Site Navigation** - Sidebar, breadcrumbs, prev/next, anchor links
- [ ] **Phase 7: Site Discovery** - SEO metadata, RSS feed, full-text search
- [ ] **Phase 8: Community** - giscus comments and report-a-problem issue links
- [ ] **Phase 9: GitHub Automation** - Auto-triage bot and AI-assisted PR review
- [ ] **Phase 10: CLI Skill** - Claude Code skill that applies DX standards to any project
- [ ] **Phase 11: Monodex Sync** - Bidirectional MDX sync with Obsidian vault

## Phase Details

### Phase 1: Monorepo Cleanup
**Goal**: The monorepo builds cleanly on a modern, minimal dependency set with no dead weight
**Depends on**: Nothing (first phase)
**Requirements**: MONO-01, MONO-02, MONO-03
**Success Criteria** (what must be TRUE):
  1. All packages install and build without warnings on latest stable versions (Next.js 16, React 19, TypeScript 5.9, Tailwind v4)
  2. No removed packages (Stitches, styled-components, Contentful, Web3, moment, SWR) appear in any package.json or import statement
  3. Husky hooks run correctly with pnpm, commitlint validates commit messages, and .tool-versions pins a specific Node version
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Scrape blog posts, archive dead apps, delete config package, gut artax-ui
- [ ] 01-02-PLAN.md — Gut blakepetersen.io to App Router shell, purge dead deps, fix tooling, add CI

### Phase 2: Design System
**Goal**: Other monorepo apps can consume a dark-first, grayscale design system with explicit server/client boundaries
**Depends on**: Phase 1
**Requirements**: MONO-04, MONO-05, SITE-02
**Success Criteria** (what must be TRUE):
  1. artax-ui v2 package exports primitive components (Button, Input, Card, etc.) styled with Tailwind v4 + Radix primitives in a dark-first grayscale aesthetic
  2. Components are split into server-safe and client-safe exports with explicit 'use client' boundaries
  3. A Tailwind preset and MDX component map are exported for consuming apps
  4. The design system builds and can be imported by blakepetersen.io without breaking other monorepo apps
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Package infrastructure, Tailwind v4 theme, test scaffold, 5 core components (Button, Input, Card, Badge, Separator)
- [ ] 02-02-PLAN.md — Remaining components (Table, Callout, Code Block) and interactive client wrappers with Radix primitives
- [ ] 02-03-PLAN.md — MDX component map, Storybook setup, blakepetersen.io integration, visual verification

### Phase 3: Content Engine
**Goal**: MDX content authored in a structured directory compiles to typed JSON with validated frontmatter at build time
**Depends on**: Phase 2
**Requirements**: CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. Velite processes MDX files from a content/ directory into typed JSON with Zod-validated frontmatter schemas
  2. Content directory structure (e.g., content/skills/, content/guides/) maps directly to site navigation hierarchy
  3. Frontmatter includes category, applies-to, dependencies, and machine-readable metadata fields enforced by schema validation
  4. Adding a new MDX file to the correct directory automatically includes it in build output without config changes
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Velite infrastructure: install, 5 collection schemas, Next.js integration, TypeScript path alias, turbo cache config
- [ ] 03-02-PLAN.md — Seed content for all DX types, Jest test infrastructure, integration tests proving pipeline end-to-end

### Phase 4: Content Rendering
**Goal**: Code blocks render with rich syntax highlighting and content relationships are visible as a dependency graph
**Depends on**: Phase 3
**Requirements**: CONT-04, CONT-07
**Success Criteria** (what must be TRUE):
  1. Code blocks render with Shiki syntax highlighting, a copy button, filename labels, and language tags
  2. Content dependency graph is rendered from frontmatter `requires` fields showing prerequisite relationships between content pages
**Plans**: 2 plans

Plans:
- [ ] 04-01-PLAN.md — Shiki syntax highlighting, code block chrome, copy button, Velite pipeline integration
- [ ] 04-02-PLAN.md — Dependency graph computation, SVG rendering, dagre layout, Velite prepare hook

### Phase 5: Site Shell
**Goal**: blakepetersen.io loads as a fast, responsive App Router site with static generation
**Depends on**: Phase 2, Phase 3
**Requirements**: SITE-01, SITE-09, SITE-10
**Success Criteria** (what must be TRUE):
  1. blakepetersen.io runs on Next.js App Router with static generation (no Pages Router remnants)
  2. Page navigations complete in sub-second time due to static generation
  3. Layout is responsive and readable on mobile devices
  4. Old Contentful/Web3 routes no longer exist
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md — Page chrome (header, footer), MDX rendering component, responsive root layout
- [ ] 05-02-PLAN.md — Homepage with category grid, all content routes (listing + detail pages for 5 types)

### Phase 6: Site Navigation
**Goal**: Users can orient themselves and move through content via sidebar, breadcrumbs, and page sequencing
**Depends on**: Phase 5
**Requirements**: SITE-03, SITE-04, SITE-07, SITE-08
**Success Criteria** (what must be TRUE):
  1. Hierarchical sidebar navigation reflects the MDX file structure with collapsible sections
  2. Previous/Next links at the bottom of each page follow sidebar order
  3. Breadcrumb trail shows the content path from root to current page
  4. All headings have anchor links for deep-linking and sharing specific sections
**Plans**: 2 plans

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Site Discovery
**Goal**: Content is discoverable via search engines, feed readers, and on-site search
**Depends on**: Phase 5
**Requirements**: SITE-05, SITE-06, CONT-05
**Success Criteria** (what must be TRUE):
  1. Every page has Open Graph metadata, structured data, and SEO-optimized title/description
  2. An RSS/Atom feed is generated at build time from MDX frontmatter
  3. Client-side full-text search returns relevant results across all content pages
**Plans**: 2 plans

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD
- [ ] 07-03: TBD

### Phase 8: Community
**Goal**: Visitors can discuss content and report problems without leaving the site workflow
**Depends on**: Phase 5
**Requirements**: COMM-01, COMM-02
**Success Criteria** (what must be TRUE):
  1. giscus comment widget appears on content pages, backed by GitHub Discussions
  2. "Report a problem" links on each page pre-fill a GitHub issue with page URL, section, and content context
**Plans**: 2 plans

Plans:
- [ ] 08-01: TBD
- [ ] 08-02: TBD

### Phase 9: GitHub Automation
**Goal**: Incoming issues and PRs are triaged and reviewed automatically with human oversight
**Depends on**: Phase 8
**Requirements**: COMM-03, COMM-04
**Success Criteria** (what must be TRUE):
  1. A bot automatically labels and categorizes incoming GitHub issues based on content
  2. PRs receive AI-assisted code review comments with human merge approval still required
**Plans**: 2 plans

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD

### Phase 10: CLI Skill
**Goal**: Any developer can apply Blake's DX standards to their project via a Claude Code skill command
**Depends on**: Phase 3, Phase 4
**Requirements**: SKIL-01, SKIL-02, SKIL-03, SKIL-04
**Success Criteria** (what must be TRUE):
  1. A Claude Code skill applies the full DX standard (CLAUDE.md, skills, hooks, linting, CI configs) to any project with a single command
  2. Individual content pages show "apply this" commands for applying specific configs, skills, or hooks
  3. Content dependency graph shows prerequisites between skills, hooks, and configs so users know what to apply first
  4. Pages display version/change indicators derived from git commit history
**Plans**: 2 plans

Plans:
- [ ] 10-01: TBD
- [ ] 10-02: TBD
- [ ] 10-03: TBD

### Phase 11: Monodex Sync
**Goal**: Blake can author content in either MDX (repo) or Obsidian (Monodex) with automatic bidirectional sync
**Depends on**: Phase 3
**Requirements**: CONT-06
**Success Criteria** (what must be TRUE):
  1. Content changes in the repo content/ directory sync to the Monodex Obsidian vault
  2. Content changes in the Monodex vault sync to the repo content/ directory
  3. Last-write-wins conflict resolution handles simultaneous edits without silent data loss
**Plans**: 2 plans

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11
Note: Phases 6, 7, 8 can execute in parallel (all depend on Phase 5 only). Phase 10 can start after Phase 4.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Monorepo Cleanup | 2/2 | Complete   | 2026-03-07 |
| 2. Design System | 3/3 | Complete   | 2026-03-08 |
| 3. Content Engine | 2/2 | Complete   | 2026-03-08 |
| 4. Content Rendering | 0/2 | Not started | - |
| 5. Site Shell | 1/2 | In Progress|  |
| 6. Site Navigation | 0/2 | Not started | - |
| 7. Site Discovery | 0/3 | Not started | - |
| 8. Community | 0/2 | Not started | - |
| 9. GitHub Automation | 0/2 | Not started | - |
| 10. CLI Skill | 0/3 | Not started | - |
| 11. Monodex Sync | 0/2 | Not started | - |
