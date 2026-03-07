# Petersen Group Monorepo

## What This Is

A Turborepo monorepo containing blakepetersen.io and family websites, being modernized into a public DX reference platform. The flagship site (blakepetersen.io) will document AI-assisted development practices — skills, hooks, CLAUDE.md patterns, MCP configurations — and make them consumable via a Claude Code skill so any project can bootstrap to Blake's current DX standard with a single command.

## Core Value

Developers (including Blake) can discover, reference, and apply opinionated AI-first DX practices from a single authoritative source — both on the web and programmatically via CLI.

## Requirements

### Validated

- ✓ Turborepo monorepo with pnpm workspaces — existing
- ✓ Next.js apps for blakepetersen.io, ashleypetersenphoto.com, dalebridges.com — existing
- ✓ Shared TypeScript and ESLint configurations — existing
- ✓ Shared UI component library (artax-ui) — existing (needs rebuild)
- ✓ Git hooks with commitlint, lint-staged, prettier — existing
- ✓ Vercel deployment pipeline — existing
- ✓ Dark/light theming via next-themes — existing

### Active

- [ ] Modernize monorepo tech stack (latest deps, remove dead weight)
- [ ] Rebuild blakepetersen.io as DX reference site with App Router
- [ ] Design system package replacing artax-ui (grayscale, ASCII-art aesthetic, dark-first)
- [ ] MDX content system with bidirectional Monodex sync (last-write wins)
- [ ] Claude Code skill that applies DX standards to any project (CLAUDE.md, skills, hooks, linting, CI)
- [ ] GitHub-native community features (comments via GH Discussions API, issue creation from site)
- [ ] Auto-triage for issues (bot labels/categorizes), AI-assisted PR review, human merges
- [ ] Three alternate design concepts via Pencil (dark, minimal, grayscale + ASCII-art)

### Out of Scope

- Mobile app — web-first, responsive only
- Own auth system — GitHub OAuth for community features only
- Real-time features (chat, live collab) — not needed for docs/reference site
- Other properties redesign — focus on blakepetersen.io first, others consume design system later
- CMS migration for other sites — ashleypetersenphoto stays on Sanity, dalebridges stays static

## Context

**Existing state:** Three Next.js sites in a Turborepo monorepo. blakepetersen.io uses Pages Router with Contentful CMS, styled-components, Radix UI Themes, and Web3 wallet features. The shared UI library (artax-ui) is pinned to Next 14 and uses Stitches (unmaintained). Multiple styling approaches coexist (Stitches, styled-components, SCSS, Radix). The commit-msg hook still referenced yarn (now fixed to pnpm).

**What's changing:** blakepetersen.io gets rebuilt from scratch as a DX documentation site. Contentful and Web3 features are removed. New design system replaces artax-ui. Content authored in MDX with Monodex sync. A Claude Code skill exposes the site's DX content programmatically.

**Monodex integration:** ~/Monodex is an Obsidian vault used for local persistence and historical context. Content flows bidirectionally — author in either MDX (repo) or Obsidian (Monodex), last write wins. Sync mechanism TBD during implementation.

**Target audience:** Developers using AI-assisted workflows, particularly Claude Code users. The site is "Blake's way" — public and opinionated, not a generic framework.

## Constraints

- **Tech stack**: Next.js App Router, React 19, TypeScript, Tailwind CSS (replacing Stitches/styled-components)
- **Design**: Dark-first, grayscale + ASCII-art aesthetic, no purples, minimal
- **Hosting**: Vercel (existing)
- **Content**: MDX in-repo, no external CMS for blakepetersen.io
- **Community**: GitHub API only — no separate user database
- **Compatibility**: Design system as npm package consumable by other monorepo apps

## Key Decisions

| Decision                                         | Rationale                                                                      | Outcome   |
| ------------------------------------------------ | ------------------------------------------------------------------------------ | --------- |
| Replace Contentful with MDX                      | Content lives with code, no external CMS dependency, better for DX docs        | — Pending |
| Replace Stitches/styled-components with Tailwind | Stitches unmaintained, Tailwind is industry standard, better for design system | — Pending |
| Bidirectional Monodex sync (last-write wins)     | Blake authors in both Obsidian and repo, neither should be bottleneck          | — Pending |
| GitHub-native community (no own auth)            | Minimal infrastructure, target audience already has GitHub accounts            | — Pending |
| Public opinionated DX skill                      | Others can use it but it's clearly Blake's conventions, not a framework        | — Pending |
| Design system as separate package                | Other properties can adopt incrementally without coupling to blakepetersen.io  | — Pending |

---

_Last updated: 2026-03-07 after initialization_
