# Requirements: Petersen Group Monorepo

**Defined:** 2026-03-07
**Core Value:** Developers can discover, reference, and apply opinionated AI-first DX practices from a single authoritative source

## v1 Requirements

### Monorepo Modernization

- [x] **MONO-01**: All dependencies updated to latest stable versions (Next.js 16, React 19, TypeScript 5.9, Turborepo latest, Tailwind v4)
- [x] **MONO-02**: Dead dependencies removed (Stitches, styled-components, Contentful SDK, Web3/RainbowKit, ethers, moment.js, SWR)
- [x] **MONO-03**: Tooling issues resolved (.tool-versions pinned to specific node version, husky hooks use pnpm, commitlint works)
- [x] **MONO-04**: artax-ui rewritten as v2 with Tailwind CSS v4 + Radix primitives (same package name, new internals)
- [x] **MONO-05**: artax-ui exports server-safe and client-safe components with explicit boundaries

### Content System

- [x] **CONT-01**: MDX content pipeline via Velite with typed frontmatter schemas and build-time processing to JSON
- [x] **CONT-02**: Content directory structure maps to site navigation hierarchy
- [x] **CONT-03**: Frontmatter schema includes category, applies-to, dependencies, and machine-readable metadata
- [x] **CONT-04**: Syntax-highlighted code blocks via Shiki with copy button, filename labels, and language tags
- [x] **CONT-05**: Client-side full-text search across all content (Flexsearch or Pagefind)
- [ ] **CONT-06**: Bidirectional Monodex (Obsidian) sync with last-write-wins conflict resolution
- [x] **CONT-07**: Content dependency graph rendered from frontmatter `requires` fields

### Site

- [x] **SITE-01**: blakepetersen.io rebuilt on Next.js App Router with static generation
- [x] **SITE-02**: Dark-first theme with grayscale + ASCII-art aesthetic (no purples, monospace typography, box-drawing characters)
- [x] **SITE-03**: Hierarchical sidebar navigation derived from MDX file structure with collapsible sections
- [x] **SITE-04**: Previous/Next page navigation derived from sidebar order
- [x] **SITE-05**: Open Graph metadata, structured data, and SEO-optimized pages
- [x] **SITE-06**: RSS/Atom feed generated from MDX frontmatter at build time
- [x] **SITE-07**: Breadcrumb navigation derived from content path
- [x] **SITE-08**: Anchor links on headings for deep-linking
- [x] **SITE-09**: Sub-second page navigations via static generation
- [x] **SITE-10**: Responsive layout for mobile reading

### Community

- [ ] **COMM-01**: giscus comments on content pages powered by GitHub Discussions
- [ ] **COMM-02**: "Report a problem" links pre-fill GitHub issue with page URL, section, and content context
- [ ] **COMM-03**: Auto-triage bot labels and categorizes incoming GitHub issues
- [ ] **COMM-04**: AI-assisted PR review on contributions with human merge approval

### CLI Skill

- [ ] **SKIL-01**: Claude Code skill that applies full DX standard to any project (CLAUDE.md, skills, hooks, linting, CI configs)
- [ ] **SKIL-02**: Per-page "apply this" commands showing how to apply individual configs, skills, or hooks
- [ ] **SKIL-03**: Content dependency graph showing prerequisites between skills, hooks, and configs
- [ ] **SKIL-04**: Version/change indicators per page from git commit history

## v2 Requirements

### Design System Adoption

- **DS-01**: ashleypetersenphoto.com migrated to artax-ui v2
- **DS-02**: dalebridges.com migrated to artax-ui v2

### Content Enhancements

- **CONT-08**: Configurable DX bootstrap (users pick which standards to apply)
- **CONT-09**: Content analytics (which pages are most referenced via skill)

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / own auth | GitHub OAuth via giscus only — no user profiles or dashboards |
| AI chatbot / "ask the docs" | Unreliable hallucinations undermine trust in a DX reference site |
| Versioned documentation | Single opinionated version — git history for archaeology |
| Interactive code playground | Content is config files and shell commands, not live components |
| Newsletter / email subscription | RSS + GitHub notifications sufficient for target audience |
| Multi-language / i18n | English-only for opinionated personal docs |
| Custom CMS / admin panel | MDX in repo IS the CMS; Obsidian is the rich editor |
| Real-time features | Zero value for a static documentation site |
| Mobile app | Responsive web only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MONO-01 | Phase 1 | Complete |
| MONO-02 | Phase 1 | Complete |
| MONO-03 | Phase 1 | Complete |
| MONO-04 | Phase 2 | Complete |
| MONO-05 | Phase 2 | Complete |
| CONT-01 | Phase 3 | Complete |
| CONT-02 | Phase 3 | Complete |
| CONT-03 | Phase 3 | Complete |
| CONT-04 | Phase 4 | Complete |
| CONT-05 | Phase 7 | Complete |
| CONT-06 | Phase 11 | Pending |
| CONT-07 | Phase 4 | Complete |
| SITE-01 | Phase 5 | Complete |
| SITE-02 | Phase 2 | Complete |
| SITE-03 | Phase 6 | Complete |
| SITE-04 | Phase 6 | Complete |
| SITE-05 | Phase 7 | Complete |
| SITE-06 | Phase 7 | Complete |
| SITE-07 | Phase 6 | Complete |
| SITE-08 | Phase 6 | Complete |
| SITE-09 | Phase 5 | Complete |
| SITE-10 | Phase 5 | Complete |
| COMM-01 | Phase 8 | Pending |
| COMM-02 | Phase 8 | Pending |
| COMM-03 | Phase 9 | Pending |
| COMM-04 | Phase 9 | Pending |
| SKIL-01 | Phase 10 | Pending |
| SKIL-02 | Phase 10 | Pending |
| SKIL-03 | Phase 10 | Pending |
| SKIL-04 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-07 after roadmap creation*
