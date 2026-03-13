# Roadmap: Petersen Group Monorepo

## Overview

Transform the existing Turborepo monorepo from a collection of independent Next.js sites into a DX reference platform with GitHub-native community features, automation, and CI.

## Milestones

- ✅ **v1.0 DX Reference Platform** — Phases 1-7.1 (shipped 2026-03-10)
- 🚧 **v1.1 GitHub Integration** — Phases 8-11 (in progress)

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

### 🚧 v1.1 GitHub Integration (In Progress)

**Milestone Goal:** Make GitHub the community backbone — discussions, issues, automation, project visibility, and CI — so readers can engage, contribute, and track progress without leaving the GitHub ecosystem.

- [x] **Phase 8: CI & Foundation** - GitHub Actions pipeline, issue templates, and git-based version indicators — completed 2026-03-10
- [x] **Phase 9: Community Engagement** - Giscus comments, content voting, and report-a-problem links — completed 2026-03-11
- [x] **Phase 10: GitHub Data Pages** - Changelog, contributors, and roadmap pages from GitHub API (completed 2026-03-12)
- [x] **Phase 11: AI Automation** - Claude-powered PR review and issue triage with security guardrails (completed 2026-03-13)

## Phase Details

### Phase 8: CI & Foundation
**Goal**: Every PR is automatically validated, contributors get structured feedback channels, and readers see how fresh each page is
**Depends on**: Phase 7.1 (v1.0 complete)
**Requirements**: CI-01, CI-02, CI-03, CI-04, CI-05
**Success Criteria** (what must be TRUE):
  1. Opening a PR triggers automated build, typecheck, lint, and link checking -- broken PRs are caught before review
  2. The "New Issue" page on GitHub shows structured templates for bug reports, feature requests, and content issues
  3. Every content page displays when it was last modified (derived from git history, not manual dates)
  4. Every content page displays a change frequency indicator showing how actively maintained it is
**Plans:** 3 plans

Plans:
- [x] 08-01-PLAN.md — CI pipeline with typecheck, link checking, and status badge
- [x] 08-02-PLAN.md — GitHub issue form templates (bug, feature, content)
- [x] 08-03-PLAN.md — Git-derived content freshness indicators and sitemap dates

### Phase 9: Community Engagement
**Goal**: Readers can discuss content, signal what they find valuable, and report problems without leaving the page
**Depends on**: Phase 8 (CI pipeline catches issues in community feature PRs)
**Requirements**: COMM-01, COMM-02, COMM-03, COMM-04, COMM-05
**Success Criteria** (what must be TRUE):
  1. Every content page has a comment section powered by GitHub Discussions where readers can ask questions and share context
  2. Comments survive URL restructuring because they use stable content IDs, not pathnames
  3. The comment widget matches the terminal dark aesthetic (not a jarring light iframe)
  4. Every content page has a "Report a problem" link that opens a pre-filled GitHub issue with the page title, URL, and content metadata
  5. Every content page displays reaction counts from its GitHub Discussion as a voting/quality signal
**Plans:** 2 plans

Plans:
- [x] 09-01-PLAN.md — Giscus comment widget, custom dark theme, and report-a-problem link components
- [x] 09-02-PLAN.md — Layout integration with reaction counts and discussion sections on all content pages

### Phase 10: GitHub Data Pages
**Goal**: Readers can see project history, who contributes, and where the project is headed -- all from GitHub data rendered in the site's terminal aesthetic
**Depends on**: Phase 8 (octokit patterns established for GitHub API access)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. `/changelog` page displays release notes auto-generated from GitHub Releases (not manually maintained)
  2. `/contributors` page displays contributor avatars and contribution stats from GitHub API
  3. `/roadmap` page links to the public GitHub Projects board with styled presentation matching the site
  4. All three pages use the terminal aesthetic consistent with the rest of the site (dark background, monospace chrome, amber accents)
**Plans:** 2/2 plans complete

Plans:
- [x] 10-01-PLAN.md — GitHub API client, navigation extension, and changelog page with vertical timeline
- [x] 10-02-PLAN.md — Contributors page with avatar grid and roadmap page with milestone summary

### Phase 11: AI Automation
**Goal**: Incoming PRs get automated code review and new issues get auto-triaged, with security guardrails preventing abuse and cost spirals
**Depends on**: Phase 8 (CI pipeline stable, issue templates producing structured input)
**Requirements**: AI-01, AI-02, AI-03, AI-04, AI-05
**Success Criteria** (what must be TRUE):
  1. Every non-bot PR receives an automated Claude code review comment before human review
  2. New issues are automatically labeled and categorized by a Claude-powered triage bot
  3. AI workflows use `pull_request` trigger (not `pull_request_target`) and require approval before running on fork PRs
  4. AI workflows have spending limits and label gates configured to prevent unbounded Anthropic API costs
**Plans:** 2/2 plans complete

Plans:
- [x] 11-01-PLAN.md — Shared library, PR review script, and ai-review workflow
- [x] 11-02-PLAN.md — Issue triage script, ai-triage workflow, and human review checkpoint

## Progress

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
