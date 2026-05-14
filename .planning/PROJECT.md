# Petersen Group Monorepo

## What This Is

A Turborepo monorepo centered on blakepetersen.io — a public DX reference platform documenting AI-assisted development practices (skills, hooks, CLAUDE.md patterns, configs). Content is authored in MDX with a terminal-aesthetic design system, served as a fully static Next.js site, and distributed programmatically via the Blink CLI.

## Core Value

Developers (including Blake) can discover, reference, and apply opinionated AI-first DX practices from a single authoritative source — both on the web and programmatically via CLI.

## Requirements

### Validated

- ✓ Modernize monorepo tech stack (Next.js 16, React 19, TS 5.9, Tailwind v4) — v1.0
- ✓ Rebuild blakepetersen.io as DX reference site with App Router — v1.0
- ✓ Design system (artax-ui v2) with terminal aesthetic, server/client boundaries — v1.0
- ✓ MDX content pipeline via Velite with typed schemas and dependency graph — v1.0
- ✓ Full-text search via Pagefind with command palette — v1.0
- ✓ SEO infrastructure (OG images, JSON-LD, RSS, sitemap) — v1.0
- ✓ Navigation system (sidebar, breadcrumbs, prev/next, TOC, anchor links) — v1.0
- ✓ Design polish: proportional body text, author notes, decision rationale, apply action bar — v1.0
- ✓ Homepage redesigned as DX workbench with About page and Start Here guide — v1.0
- ✓ GitHub Actions CI pipeline (build, typecheck, lint, link checking) — v1.1
- ✓ GitHub issue form templates (bug, feature, content) — v1.1
- ✓ Git-derived content freshness indicators (last modified, change frequency) — v1.1
- ✓ Giscus comments on content pages with custom dark theme — v1.1
- ✓ Stable content ID mapping for giscus (survives URL changes) — v1.1
- ✓ "Report a problem" links pre-fill GitHub issue with page context — v1.1
- ✓ Discussion-backed content voting via giscus reactions — v1.1
- ✓ Changelog page auto-generated from GitHub Releases — v1.1
- ✓ Contributors page from GitHub API — v1.1
- ✓ Roadmap page linking to GitHub Projects board — v1.1
- ✓ Claude-powered PR review on every non-bot PR — v1.1
- ✓ Claude-powered issue triage with auto-labeling — v1.1
- ✓ AI workflow security (pull_request trigger, fork approval, cost controls) — v1.1
- ✓ Blink CLI with apply, list, status, init, update, eject, diff, and doctor commands — v1.2
- ✓ Dual-content model (MDX docs + companion artifact files for distribution) — v1.2
- ✓ Static registry API serving artifact data at `/r/` endpoints with CalVer versioning — v1.2
- ✓ Section marker system for managed updates with customization preservation — v1.2
- ✓ Starter content artifacts: ESLint, Prettier, TypeScript, Husky, CLAUDE.md templates — v1.2
- ✓ Interactive documentation components (TabbedCode, TerminalDemo, Steps, cross-references) — v1.2
- ✓ CLI published as `@blink-dx/cli` on npm with `blink` binary — v1.2
- ✓ Shared type contracts via `@blink-dx/registry` package — v1.2
- ✓ artax-ui restructured into Atomic Design hierarchy (atoms/molecules/organisms) with semantic tokens — v1.3
- ✓ ThemeProvider component + light/dark token system across all artax-ui components — v1.3
- ✓ Storybook removed from artax-ui (replaced by Artax reference site) — v1.3
- ✓ ESLint import/no-cycle enforced to prevent circular dependencies in Atomic Design layers — v1.3
- ✓ Artax reference site (`apps/artax`) with sidebar nav, live previews, code snippets, props tables, design token page — v1.3
- ✓ Editable component previews under React 19 — props form + JSX editor (react-live R19-compatible) — v1.3
- ✓ blakepetersen.io fully themed with light/dark mode, persisting toggle, FOUT-prevention blocking script — v1.3
- ✓ Homepage, Skills Detail, About, Start Here, Collection Listing pages match Pencil designs in light + dark — v1.3
- ✓ New artax-ui primitives — Badge (extended), Modal, PrevNextNav, AuthorNote, DecisionRationale with SSR-safe mounted-flag pattern — v1.3
- ✓ Schema foundations — dxFields shape locked, slug invariants, CalVer behavior, perf baseline captured — v1.4 (Phase 27)
- ✓ Authoring tooling — `blink scaffold`, `blink lint`, `blink port` subcommands; `<ArtifactBody>` MDX include component — v1.4 (Phase 28)
- ✓ Content density — 20 net-new entries shipped on Variant 3 pattern: 5 skills + 7 configs + 4 hooks + 4 guides; Playwright voice-primitive torture test; generalized `/install/[type]/[slug]` install-context route — v1.4 (Phase 29)

### Active

## Current Milestone: v1.4 Content Density

**Goal:** Populate the 4 active collections with real, distributable content backed by authoring scaffolds — and close the v1.3 editorial debt in the process.

**Target features:**
- Content density: ≥16 entries shipped — 5 skills, 5 configs, 3 hooks, 3 guides (mix of ports from existing notes/Obsidian and greenfield); `posts` deferred
- Authoring scaffolds — `blink scaffold` (or equivalent), MDX templates, and lint enforcement so new entries follow the right shape
- Companion `.artifact` files for every applicable skill/config/hook entry, growing the Blink registry alongside content
- AuthorNote/DecisionRationale required where they fit (lint-enforced) — voice primitives shipped in v1.3 put to work
- v1.3 editorial debt closed: real /about copy, real /start-here copy, AuthorNote/DecisionRationale invocations across existing relevant MDX, deferred Skills Detail typography polish

### Deferred

- [ ] Bidirectional Monodex (Obsidian) sync with last-write-wins

### Out of Scope

- Mobile app — web-first, responsive only
- Own auth system — GitHub OAuth for community features only
- Real-time features (chat, live collab) — not needed for docs/reference site
- Other properties redesign — focus on blakepetersen.io first, others consume design system later
- CMS migration for other sites — ashleypetersenphoto stays on Sanity, dalebridges stays static
- AI chatbot / "ask the docs" — unreliable hallucinations undermine trust
- Interactive code playground — content is config files and shell commands
- Newsletter / email subscription — RSS + GitHub notifications sufficient
- Template variable interpolation — complexity trap, configs should work as-is
- Plugin system — leads to dead ecosystems, one maintainer one registry
- Three-way merge — section markers are simpler and more predictable
- Auto-update (background) — disrespects user agency, explicit `blink update` only
- Private registries — no auth system, all content is public

## Context

**Current state:** Shipped v1.3. v1.3 alone: 332 files changed (+24,875/-10,848 net +14,027 LOC) across 123 commits over 34 days. Cumulative across v1.0-v1.3: 4 milestones, ~25 phases, ~79 plans.
**Tech stack:** Next.js 16, React 19, TypeScript 5.9, Tailwind v4, Velite (MDX), Radix UI, Shiki, Pagefind, schema-dts, octokit, giscus, citty, consola, tsup, Zod.
**Design:** Terminal aesthetic — dark #0A0A0A background, JetBrains Mono + Inter fonts, amber accent, zero border-radius, box-drawing characters.
**Content:** 5 MDX collections (skills, hooks, configs, guides, posts) with typed Zod schemas, dependency graph, build-time static generation, and companion artifact files.
**Community:** GitHub-native — giscus comments, reaction voting, issue templates, AI-powered PR review and issue triage.
**Distribution:** Blink CLI (`@blink-dx/cli`) on npm with static registry API, section markers for managed updates, 7 starter content artifacts.

**Known issues:**
- `packageManager` field in root package.json says pnpm@9.0.0 but .tool-versions pins pnpm 10.28.2
- Velite + Turbopack incompatibility requires `--webpack` flag for dev mode
- About page has placeholder TODOs for Blake's personal content
- @giscus/react skipped due to React 19 compatibility unknowns (using iframe embed)
- CLI version hardcoded as 0.0.0 (not injected during tsup build)
- ESM workaround: inline artifact validation in velite prepare hook instead of importing from @blink-dx/registry

## Constraints

- **Tech stack**: Next.js App Router, React 19, TypeScript, Tailwind CSS v4
- **Design**: Dark-first, terminal aesthetic, monospace chrome, proportional body
- **Hosting**: Vercel (existing)
- **Content**: MDX in-repo via Velite, no external CMS
- **Community**: GitHub API only — no separate user database
- **Compatibility**: artax-ui as npm package consumable by other monorepo apps
- **Distribution**: Static JSON registry, no dynamic API routes

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Replace Contentful with MDX | Content lives with code, no external CMS dependency | ✓ Good |
| Replace Stitches/styled-components with Tailwind v4 | Stitches unmaintained, Tailwind is industry standard | ✓ Good |
| Velite for MDX processing | Build-time, typed output, Zod schemas | ✓ Good |
| Server/client component split | 14 base (server-safe) + 6 interactive (client) in artax-ui | ✓ Good |
| Shiki for syntax highlighting | Build-time, zero client JS, custom terminal theme | ✓ Good |
| Pagefind for search | Static index, no server, lazy-loaded | ✓ Good |
| Terminal aesthetic with Inter body text | Readability for prose while keeping terminal chrome | ✓ Good |
| Design system as separate package | Other properties can adopt incrementally | ✓ Good |
| GitHub-native community (no own auth) | Minimal infrastructure, target audience has GitHub accounts | ✓ Good |
| Giscus iframe over @giscus/react | React 19 compatibility unknown for the npm package | ✓ Good |
| octokit as single GitHub dependency | One client for releases, contributors, and projects API | ✓ Good |
| pull_request trigger for AI workflows | Security: prevents fork PRs from accessing secrets | ✓ Good |
| child_process for git history | Avoids simple-git dependency for commit counting | ✓ Good |
| Blink CLI as @blink-dx/cli npm package | Clean namespace, free org for public packages | ✓ Good |
| Static JSON registry (no dynamic API) | Always fresh from site build, no server infrastructure | ✓ Good |
| Section markers for managed updates | Preserve user customizations while updating managed content | ✓ Good |
| Dual-content model (MDX + artifact) | Docs can simplify/annotate; artifacts are production-ready files | ✓ Good |
| Source exports for blink-registry (no build) | Follows artax-ui pattern, avoids extra build step | ✓ Good |
| Inline artifact validation in velite hook | ESM resolution issues prevent importing from blink-registry | ⚠️ Revisit |
| citty/consola for CLI framework | Lightweight, good DX, bundled by tsup into single binary | ✓ Good |
| CalVer versioning for artifacts | Derived from git commit date, deterministic and meaningful | ✓ Good |
| Bidirectional Monodex sync (last-write wins) | Author in both Obsidian and repo | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-05-14 — Phase 29 complete (20 net-new content entries on Variant 3 pattern); v1.4 milestone awaiting Phase 30 (Editorial Closure)_
