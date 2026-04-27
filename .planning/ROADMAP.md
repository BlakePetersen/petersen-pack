# Roadmap: Petersen Group Monorepo

## Overview

Transform the existing Turborepo monorepo from a collection of independent Next.js sites into a DX reference platform with GitHub-native community features, automation, and CI.

## Milestones

- ✅ **v1.0 DX Reference Platform** — Phases 1-7.1 (shipped 2026-03-10)
- ✅ **v1.1 GitHub Integration** — Phases 8-11 (shipped 2026-03-14)
- ✅ **v1.2 Blink CLI & DX Registry** — Phases 12-20 (shipped 2026-03-16)
- ✅ **v1.3 Artax Design System** — Phases 21-26 (shipped 2026-04-24)
- 🚧 **v1.4 Content Density** — Phases 27-30 (in progress, started 2026-04-24)

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

<details>
<summary>✅ v1.2 Blink CLI & DX Registry (Phases 12-20) — SHIPPED 2026-03-16</summary>

- [x] Phase 12: Shared Types & Package Scaffold (2/2 plans) — completed 2026-03-14
- [x] Phase 13: Artifact Pipeline (2/2 plans) — completed 2026-03-15
- [x] Phase 14: Registry API (2/2 plans) — completed 2026-03-15
- [x] Phase 15: CLI Core (4/4 plans) — completed 2026-03-15
- [x] Phase 16: Section Markers & Lifecycle (3/3 plans) — completed 2026-03-15
- [x] Phase 17: Starter Content (3/3 plans) — completed 2026-03-15
- [x] Phase 18: Documentation (4/4 plans) — completed 2026-03-15
- [x] Phase 19: Publishing (2/2 plans) — completed 2026-03-16
- [x] Phase 20: Fix Integration Gaps (1/1 plan) — completed 2026-03-16

See: `.planning/milestones/v1.2-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v1.3 Artax Design System (Phases 21-26) — SHIPPED 2026-04-24</summary>

- [x] Phase 21: artax-ui Restructure & Theming (3/3 plans) — completed 2026-03-16
- [x] Phase 22: Artax Reference Site Scaffold (2/2 plans) — completed 2026-03-28
- [x] Phase 23: Component Catalog & Documentation (3/3 plans) — completed 2026-04-17
- [x] Phase 24: Editable Previews (7/7 plans) — completed 2026-04-19
- [x] Phase 24.1: Editable Previews Polish *(INSERTED)* (3/3 plans) — completed 2026-04-19
- [x] Phase 25: blakepetersen.io Theming (1/1 plan) — completed 2026-04-19
- [x] Phase 26: blakepetersen.io Page Updates (7/7 plans) — completed 2026-04-24

See: `.planning/milestones/v1.3-ROADMAP.md` for full details.

</details>

### v1.4 Content Density (Phases 27-30) — IN PROGRESS

- [ ] **Phase 27: Schema Foundations** — Lock `dxFields` shape, slug uniqueness, cross-ref integrity, perf baseline, CalVer + ESM debt resolution before any content authoring
- [ ] **Phase 28: Authoring Scaffolds + Lint + Port** — `blink scaffold`, `blink lint` (advisory voice rules), `blink port` two-step pipeline, `<ArtifactBody>` include component
- [ ] **Phase 29: Content Authoring (Greenfield + Ports)** — 16 entries shipped (5 skills, 5 configs, 3 hooks, 3 guides) plus first-invocation voice-primitive torture test
- [ ] **Phase 30: Editorial Closure** — Real `/about` and `/start-here` copy, voice-primitive backfill across pre-existing MDX, Skills Detail typography polish, voice-lint promotion review, milestone audit

## Phase Details

### Phase 27: Schema Foundations

**Goal**: Lock the `dxFields` schema shape, slug invariants, and CalVer behavior before any content authoring begins — schema changes at sixteen entries require codemods; at zero entries they're free.

**Depends on**: Nothing (entry phase for v1.4)

**Requirements**: SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04, SCHEMA-05, SCHEMA-06, SCHEMA-07, SCHEMA-08

**Success Criteria** (what must be TRUE):
  1. An author can add `voice: ['author-note']` and `requires_artifact: true` to an MDX entry's frontmatter and `pnpm --filter blakepetersen.io build` passes; existing entries (which omit both fields) also still pass because the defaults are `[]` and `false`
  2. Two MDX files in the same collection with the same `slug` cause `pnpm build` to fail with a duplicate-slug error pointing at both file paths
  3. An MDX entry referencing a nonexistent slug in `dependencies:` or `related:` causes `pnpm build` to fail with a broken-cross-reference error naming the dangling slug
  4. Editing only prose in a `*.artifact.md` sibling MDX (no artifact body change) does not bump the artifact's CalVer in `public/r/<type>/<slug>.json` (verified via synthetic before/after build)
  5. Velite imports artifact validation directly from `@blink-dx/registry` (the v1.2 ESM workaround is gone) and `pnpm --filter blakepetersen.io build` succeeds without the inline duplicate

**Spike callouts**:
  - `deriveCalVer` audit (~30min read of `apps/blakepetersen.io/src/lib/calver.ts` + 1h regression test). If pure-date logic is confirmed, add content-hash gate before Phase 29 begins. SCHEMA-08 is the deliverable.

**Plans**: 8 plans

Plans:
- [x] 27-00-test-fixtures-PLAN.md — Wave 0 fixtures + velite-runner helper
- [x] 27-01-voice-and-requires-artifact-PLAN.md — SCHEMA-01 + SCHEMA-02 dxFields additions
- [x] 27-02-blink-registry-import-PLAN.md — SCHEMA-05 direct import (replace inline patterns)
- [x] 27-03-slug-uniqueness-PLAN.md — SCHEMA-03 per-collection slug dedup (smallest-delta path)
- [ ] 27-04-cross-ref-validator-PLAN.md — SCHEMA-04 dependencies/related integrity check
- [ ] 27-05-calver-hash-gate-PLAN.md — SCHEMA-08 content-hash CalVer gate + manifest
- [ ] 27-06-codemod-harness-PLAN.md — SCHEMA-06 migrate-content harness skeleton
- [ ] 27-07-perf-baseline-PLAN.md — SCHEMA-07 build-perf baseline (runs LAST)

### Phase 28: Authoring Scaffolds + Lint + Port

**Goal**: Ship the `blink scaffold`, `blink lint`, and `blink port` subcommands plus the `<ArtifactBody>` include component so bulk content authoring in Phase 29 is sustainable, sync-enforced, and pipeline-friendly.

**Depends on**: Phase 27 (templates derive from locked schema; lint reads `voice` and `requires_artifact` fields; round-trip CI test relies on Velite passing the schema-validated output)

**Requirements**: SCAFFOLD-01, SCAFFOLD-02, SCAFFOLD-03, SCAFFOLD-04, SCAFFOLD-05, SCAFFOLD-06, LINT-01, LINT-02, LINT-03, LINT-04, LINT-05, LINT-06, LINT-07, PORT-01, PORT-02, PORT-03, PORT-04, CONTENT-05

**Success Criteria** (what must be TRUE):
  1. An author runs `blink scaffold skill writing-skill-tests` and a schema-valid `<slug>.mdx` plus `<slug>.artifact.md` materialize at the right `content/skills/` path with frontmatter pre-populated from a single source of truth
  2. An author who declares `requires_artifact: true` and forgets the sibling `.artifact.md` sees `blink lint` fail with the offending file path; an author who keeps an orphan `.artifact.md` sees a warning surfaced (not error)
  3. An author commits a one-MDX-file change and the pre-commit hook (Prettier + commitlint + `blink lint --files` on staged content) returns in under two seconds; `pnpm lint:content` runs the full-tree pass in CI and exits non-zero on any error
  4. An author runs `blink port stage <input-dir>` against a Blake-selected Obsidian skill, reviews the diff in `.obsidian-port-staging/`, runs `blink port commit <slug>`, and the entry lands at `content/skills/<slug>.mdx` (plus companion `.artifact.md` if applicable) and passes both Velite and `blink lint` — proving the pipeline round-trips end-to-end
  5. An MDX entry can render its sibling artifact's body via `<ArtifactBody slug="<slug>" />` instead of copy-pasting — verified by replacing one existing copy-pasted artifact-body block with the component and seeing identical rendered output

**Spike callouts**:
  - `remark-lint-frontmatter-schema@3.15.4` × unified 11 compat (~2h, Day 1 of phase). Plan B: custom plugin around Ajv 8.20 (~80 LOC; Ajv already in deps tree).
  - `zod-to-json-schema@3.25.2` × Zod 4.3.6 coverage (~1h, Day 1 of phase). Plan B: hand-author JSON Schemas for 4 collections (~40 field defs).

**Plans**: TBD

### Phase 29: Content Authoring (Greenfield + Ports)

**Goal**: Ship sixteen production-quality entries (5 skills, 5 configs, 3 hooks, 3 guides) using scaffold + lint + port tooling, with first-invocation voice-primitive torture test catching layout regressions before bulk authoring continues.

**Depends on**: Phase 28 (scaffolds gate template-driven creation; lint advisory rules surface issues during authoring; port pipeline must be round-trip proven; `<ArtifactBody>` component eliminates copy-paste drift)

**Requirements**: CONTENT-01, CONTENT-02, CONTENT-03, CONTENT-04, CONTENT-06

**Success Criteria** (what must be TRUE):
  1. A reader visiting any `/skills/`, `/configs/`, `/hooks/`, or `/guides/` listing route can browse and click into at least the v1.4 floor count of entries (5/5/3/3) and read a body that uses voice primitives where they fit
  2. A reader visiting any of the eleven new skill/config/hook entries can copy the companion `.artifact.md` content (or fetch via `blink apply`) and the artifact body matches what the doc describes
  3. The first MDX entry to invoke `<AuthorNote>` and `<DecisionRationale>` together has been visually captured in light, dark, and mobile viewports; any layout regression in either primitive is fixed in `artax-ui` before the second entry lands
  4. `pnpm lint:content` runs across the full tree at phase end with zero new errors and a documented count of voice-primitive advisory warnings (data input for Phase 30 lint promotion review)
  5. `blink list` (or equivalent CLI inspection) returns at least sixteen entries spanning the four collections — verifiable from a fresh `npm install -g @blink-dx/cli` against the production registry after deploy

**Plans**: TBD

### Phase 30: Editorial Closure

**Goal**: Replace the v1.3 `/about` and `/start-here` placeholders with real Blake-voiced copy, backfill voice primitives across pre-existing MDX, polish Skills Detail typography, decide voice-lint promotion based on Phase 29 evidence, and archive the v1.4 milestone.

**Depends on**: Phase 29 (voice-primitive copy needs canonical examples from new entries; lint promotion needs eight-entry organic-pass evidence; typography polish needs torture-test feedback from CONTENT-06)

**Requirements**: DEBT-01, DEBT-02, DEBT-03, DEBT-04, DEBT-05, DEBT-06

**Success Criteria** (what must be TRUE):
  1. A first-time visitor lands on `/about` and reads first-person specifics (named projects, decisions, dates) that no other person could plausibly have written; Blake re-reads twenty-four hours after writing and signs off only if the voice is recognizably his
  2. A first-time visitor lands on `/start-here` and sees the canonical `<AuthorNote>` and `<DecisionRationale>` invocations both at least once — the page serves as the on-site reference for how to write entries
  3. Pre-existing relevant MDX entries (those with rationale-shaped or aside-shaped content surfaced by the v1.3 audit) now invoke `<AuthorNote>` or `<DecisionRationale>` where they fit — visible by running `rg "<AuthorNote|DecisionRationale" content/` and counting non-zero invocations across collections
  4. A reader on any Skills Detail page sees the polished header typography (H1 size, max-width, prose tightening) deferred from v1.3 Phase 26-03
  5. Each voice-lint rule is logged in PROJECT.md Key Decisions as `error`, `warn`, or `off` based on Phase 29 evidence (eight-entry heuristic gate); `pnpm lint:content` reflects the promotion outcome
  6. The v1.4 milestone audit lives at `.planning/milestones/v1.4-MILESTONE-AUDIT.md` (alongside `v1.4-REQUIREMENTS.md` and `v1.4-ROADMAP.md`) following the v1.0–v1.3 archive pattern

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
v1.4 phases execute in numeric order: 27 → 28 → 29 → 30. Phase 28 has three internal tracks (scaffold, lint, port) that may proceed in parallel within the phase but all must be complete before Phase 29 begins.

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
| 12. Shared Types & Package Scaffold | v1.2 | 2/2 | Complete | 2026-03-14 |
| 13. Artifact Pipeline | v1.2 | 2/2 | Complete | 2026-03-15 |
| 14. Registry API | v1.2 | 2/2 | Complete | 2026-03-15 |
| 15. CLI Core | v1.2 | 4/4 | Complete | 2026-03-15 |
| 16. Section Markers & Lifecycle | v1.2 | 3/3 | Complete | 2026-03-15 |
| 17. Starter Content | v1.2 | 3/3 | Complete | 2026-03-15 |
| 18. Documentation | v1.2 | 4/4 | Complete | 2026-03-15 |
| 19. Publishing | v1.2 | 2/2 | Complete | 2026-03-16 |
| 20. Fix Integration Gaps | v1.2 | 1/1 | Complete | 2026-03-16 |
| 21. artax-ui Restructure & Theming | v1.3 | 3/3 | Complete | 2026-03-16 |
| 22. Artax Reference Site Scaffold | v1.3 | 2/2 | Complete | 2026-03-28 |
| 23. Component Catalog & Documentation | v1.3 | 3/3 | Complete | 2026-04-17 |
| 24. Editable Previews | v1.3 | 7/7 | Complete | 2026-04-19 |
| 24.1 Editable Previews Polish | v1.3 | 3/3 | Complete | 2026-04-19 |
| 25. blakepetersen.io Theming | v1.3 | 1/1 | Complete | 2026-04-19 |
| 26. blakepetersen.io Page Updates | v1.3 | 7/7 | Complete | 2026-04-24 |
| 27. Schema Foundations | v1.4 | 4/8 | In progress | — |
| 28. Authoring Scaffolds + Lint + Port | v1.4 | 0/? | Not started | — |
| 29. Content Authoring | v1.4 | 0/? | Not started | — |
| 30. Editorial Closure | v1.4 | 0/? | Not started | — |
