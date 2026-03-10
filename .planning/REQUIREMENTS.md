# Requirements: Petersen Group Monorepo

**Defined:** 2026-03-07
**Core Value:** Developers can discover, reference, and apply opinionated AI-first DX practices from a single authoritative source

## v1.0 Requirements (Shipped)

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
- [x] **CONT-05**: Client-side full-text search across all content (Pagefind)
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

### Design Polish

- [x] **DSGN-01**: Body text uses proportional font (Inter), monospace reserved for chrome, headings, and code
- [x] **DSGN-02**: Color palette includes secondary accent (cyan) and annotation surface colors
- [x] **DSGN-03**: Content schema supports author_note, decisions, related, and updated_context frontmatter fields
- [x] **DSGN-04**: Author note and decision rationale components render on content pages from frontmatter
- [x] **DSGN-05**: Apply action bar with copy-to-clipboard CLI command on DX content pages
- [x] **DSGN-06**: Related content links in right sidebar resolved from frontmatter
- [x] **DSGN-07**: Homepage redesigned as DX workbench (hero, stack snapshot, enriched content grid, activity feed)
- [x] **DSGN-08**: Sidebar has category color indicators and stronger active page state
- [x] **DSGN-09**: About page with bio and project philosophy
- [x] **DSGN-10**: Start-here onboarding guide for newcomers

## v1.1 Requirements

Requirements for GitHub Integration milestone. Each maps to roadmap phases.

### CI & Foundation

- [x] **CI-01**: GitHub Actions CI pipeline runs build, typecheck, and lint on every PR
- [x] **CI-02**: Link checker validates all internal and external links on PR
- [x] **CI-03**: GitHub issue templates provide structured feedback forms (bug report, feature request, content issue)
- [ ] **CI-04**: Content pages display last modified date from git history
- [ ] **CI-05**: Content pages display change frequency indicator from git commit count

### Community Engagement

- [ ] **COMM-01**: Content pages display giscus comment widget powered by GitHub Discussions
- [ ] **COMM-02**: Giscus uses stable content ID mapping (not pathname) to survive URL changes
- [ ] **COMM-03**: Giscus theme matches terminal aesthetic (dark mode)
- [ ] **COMM-04**: "Report a problem" link on content pages pre-fills GitHub issue with page title, URL, and content metadata
- [ ] **COMM-05**: Content pages display reaction counts from giscus as content voting signal

### GitHub Data Pages

- [ ] **DATA-01**: `/changelog` page displays entries auto-generated from GitHub Releases
- [ ] **DATA-02**: `/contributors` page displays contributor avatars and stats from GitHub API
- [ ] **DATA-03**: `/roadmap` page links to public GitHub Projects board with styled presentation
- [ ] **DATA-04**: GitHub data pages use terminal aesthetic consistent with existing site design

### AI Automation

- [ ] **AI-01**: Claude-powered PR review runs on every non-bot PR via GitHub Actions
- [ ] **AI-02**: Claude-powered issue triage auto-labels and categorizes new issues
- [ ] **AI-03**: AI workflows use `pull_request` trigger (not `pull_request_target`) for security
- [ ] **AI-04**: AI workflows have spending limits and label gates to prevent cost spiral
- [ ] **AI-05**: AI workflows require approval for fork PRs before running

## v1.2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### CLI & Sync

- **CLI-01**: Claude Code skill that applies DX standards to any project
- **CLI-02**: Per-page "apply this" commands for individual configs/skills/hooks
- **SYNC-01**: Bidirectional Monodex (Obsidian) sync with last-write-wins

### Advanced GitHub

- **DATA-05**: Custom-rendered GitHub Projects roadmap page (GraphQL ProjectsV2 API)
- **DATA-06**: Voting analytics aggregated across pages

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
| Custom voting backend | giscus reactions provide voting for free |
| GitHub Wiki | Site itself is the documentation |
| GitHub Pages | Hosted on Vercel |

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
| DSGN-01 | Phase 7.1 | Complete |
| DSGN-02 | Phase 7.1 | Complete |
| DSGN-03 | Phase 7.1 | Complete |
| DSGN-04 | Phase 7.1 | Complete |
| DSGN-05 | Phase 7.1 | Complete |
| DSGN-06 | Phase 7.1 | Complete |
| DSGN-07 | Phase 7.1 | Complete |
| DSGN-08 | Phase 7.1 | Complete |
| DSGN-09 | Phase 7.1 | Complete |
| DSGN-10 | Phase 7.1 | Complete |
| CI-01 | Phase 8 | Complete |
| CI-02 | Phase 8 | Complete |
| CI-03 | Phase 8 | Complete |
| CI-04 | Phase 8 | Pending |
| CI-05 | Phase 8 | Pending |
| COMM-01 | Phase 9 | Pending |
| COMM-02 | Phase 9 | Pending |
| COMM-03 | Phase 9 | Pending |
| COMM-04 | Phase 9 | Pending |
| COMM-05 | Phase 9 | Pending |
| DATA-01 | Phase 10 | Pending |
| DATA-02 | Phase 10 | Pending |
| DATA-03 | Phase 10 | Pending |
| DATA-04 | Phase 10 | Pending |
| AI-01 | Phase 11 | Pending |
| AI-02 | Phase 11 | Pending |
| AI-03 | Phase 11 | Pending |
| AI-04 | Phase 11 | Pending |
| AI-05 | Phase 11 | Pending |

**Coverage:**
- v1.0 requirements: 31 total (all complete)
- v1.1 requirements: 19 total
- Mapped to phases: 19/19
- Unmapped: 0

---
*Requirements defined: 2026-03-07*
*Last updated: 2026-03-10 after v1.1 roadmap created*
