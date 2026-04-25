# Milestones

## v1.3 Artax Design System (Shipped: 2026-04-24)

**Phases:** 7 (21, 22, 23, 24, 24.1, 25, 26) | **Plans:** 27 | **Commits:** 123 (36 phase-tagged feat)
**Timeline:** 34 days (2026-03-16 → 2026-04-19, archive close 2026-04-24)
**LOC:** +24,875 / -10,848 (net +14,027) | **Files:** 332 changed

**Delivered:** A themed design system (`artax-ui`) with Atomic Design primitives and light/dark mode, a live reference site (`apps/artax`) with editable component previews, and Pencil-matched recompose of 5 key bp.io pages (Homepage, Skills Detail, About, Start Here, Collection Listing) verified end-to-end via Playwright-driven D-07 light/dark visual smoke.

**Key accomplishments:**
1. artax-ui restructured into Atomic Design (atoms/molecules/organisms) with light/dark token system; Storybook removed
2. Live `apps/artax` reference site — component catalog, props tables, design token reference, editable-preview playground (form + JSX editor)
3. Editable previews working under React 19 — react-live compat spike PASS, named-scope enumeration, gap-closure widened ComponentDef.preview signature
4. blakepetersen.io fully themed (light/dark + persisting toggle + FOUT-prevention blocking script)
5. 5 bp.io pages recomposed to Pencil — Homepage (CategoryCard grid), Skills Detail (PrevNextNav swap), About (Badge meta + interests grid + shell CTAs), Start Here (numbered walkthrough), Collection Listing (factory recompose covering 5 routes via single edit)
6. New artax-ui primitives shipped — Badge (extended), Modal (Dialog-backed with SSR-safe ID handling), PrevNextNav, AuthorNote, DecisionRationale; SSR mounted-flag pattern formalized for Radix-backed primitives above the fold

**Requirements:** 22/22 milestone requirements satisfied (FOUND-01–06, ARTAX-01–08, SITE-01–08)
**Tech debt:** 8 items documented in audit (editorial follow-ups in /about and /start-here, deferred Skills Detail header typography, AuthorNote/DecisionRationale primitives ready but not yet invoked in bp.io content, react-live R19 dev-only JSX-transform warning tolerated)

---

## v1.2 Blink CLI & DX Registry (Shipped: 2026-03-16)

**Phases:** 9 (12-20) | **Plans:** 23 | **Commits:** 86
**Timeline:** 4 days (2026-03-12 → 2026-03-15)
**LOC:** +12,659 / -1,209 | **Files:** 150 changed

**Delivered:** A CLI tool (`blink`) and static registry API for discovering, applying, updating, and managing DX configurations from blakepetersen.io — published as `@blink-dx/cli` on npm.

**Key accomplishments:**
1. Blink CLI published to npm (`@blink-dx/cli` v0.1.0) with apply, list, status, init, update, eject, diff, and doctor commands
2. Dual-content artifact system — Velite pipeline processes `.artifact.md` and `.artifact/` directories alongside MDX docs
3. Static registry API — `/r/index.json` and `/r/<type>/<slug>.json` endpoints with CalVer versioning
4. Section marker lifecycle — managed regions with inject/update/eject/doctor, atomic writes, and local modification detection
5. 7 starter content artifacts — ESLint, Prettier, TypeScript, Husky, CLAUDE.md (global + project), and custom skills template
6. Interactive documentation — TabbedCode, TerminalDemo, Steps, cross-reference components, and companion guides

**Requirements:** 46/46 milestone requirements satisfied (CORE-01–12, SCOPE-01–08, REG-01–05, ART-01–05, CONT-01–07, DOCS-01–04, PKG-01–05)
**Tech debt:** 9 items documented in audit (ESM workaround, CLI version injection, dead code, stale files, visual verifications pending)

---

## v1.1 GitHub Integration (Shipped: 2026-03-14)

**Phases:** 4 (8-11) | **Plans:** 9 | **Commits:** 37
**Timeline:** 3 days (2026-03-10 → 2026-03-12)
**LOC:** +4,621 / -367 | **Files:** 72 changed

**Delivered:** GitHub-native community backbone — CI pipeline, giscus comments, GitHub data pages, and Claude-powered PR review and issue triage.

**Key accomplishments:**
1. CI pipeline with build, typecheck, lint, and link checking on every PR
2. GitHub issue form templates for structured bug/feature/content reports
3. Giscus comment system with custom dark theme, reaction counts, and report-a-problem links
4. Changelog, contributors, and roadmap pages rendered from GitHub API data
5. Claude-powered PR review and issue triage with security guardrails and cost controls
6. Git-derived content freshness indicators (last modified date + change frequency)

**Requirements:** 19/19 milestone requirements satisfied (CI-01–05, COMM-01–05, DATA-01–04, AI-01–05)

---

## v1.0 DX Reference Platform (Shipped: 2026-03-10)

**Phases:** 8 (1-7.1) | **Plans:** 20 | **Tasks:** 43
**Timeline:** 3 days (2026-03-07 → 2026-03-09)
**LOC:** ~4,800 TypeScript/TSX | **Files:** 232 changed

**Delivered:** A fully static DX reference site with terminal aesthetic, MDX content pipeline, full-text search, SEO infrastructure, and author voice components.

**Key accomplishments:**
1. Terminal-aesthetic design system (artax-ui v2) — 20 components, Tailwind v4, server/client boundaries, Storybook
2. Velite MDX content engine — 5 typed collections with Zod schemas, build-time processing, dependency graph
3. Full-featured App Router site — static generation, sidebar navigation, breadcrumbs, TOC with scroll spy
4. SEO infrastructure — OG images, JSON-LD structured data, RSS feed, sitemap, Pagefind search with Cmd+K
5. Author voice — AuthorNote callouts, decision rationale sections, apply action bar, related content sidebar
6. DX workbench homepage — hero, stack snapshot, enriched content grid, About page, Start Here guide

**Requirements:** 31/31 milestone requirements satisfied (MONO-01–05, CONT-01–05, CONT-07, SITE-01–10, DSGN-01–10)

---

