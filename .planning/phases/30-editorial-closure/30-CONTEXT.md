# Phase 30: Editorial Closure — Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace v1.3 `/about` and `/start-here` placeholders with real Blake-voiced copy, backfill voice primitives across pre-existing MDX, polish Skills Detail typography, decide voice-lint promotion based on Phase 29 evidence, and archive the v1.4 milestone.

**Requirements in scope:** DEBT-01, DEBT-02, DEBT-03, DEBT-04, DEBT-05, DEBT-06
**Plus** (folded from Phase 29 carry-forward triage):
- Phase 30 cleanup plan (3 mechanical chores: scaffold dead-imports, stale PLAN.md key_links, pre-fix commit audit)
- Phase 30 robustness plan (5 REVIEW.md items: WR-02/03/04 + IN-03 + `.artifact.md` Prettier handling)

**Out of scope** (deferred elsewhere):
- ThemeProvider/next-themes script-tag warning — logged here, no action this phase
- Phase 31+ / v1.5 robustness phase territory

</domain>

<decisions>
## Implementation Decisions

### Area A — `/about` page voice + content shape (DEBT-01)

- **D-A1: Voice — industry veteran.** Reflective, framework-y, pattern-focused first-person. Patterns over anecdotes. Tone like "After fifteen years shipping software, the cost of inconsistent DX compounds." NOT scrappy-builder, NOT candid-engineer-dry, NOT corporate-bio.
- **D-A2: Content categories — career arc + recurring design biases.** Named companies / roles / eras as anchors; "patterns I keep coming back to" as the philosophical spine. Explicitly NOT including: signature project name-drops, current-commitments now-page.
- **D-A3: Structure — 3 sections.** `// about` (career arc) → `// philosophy` (biases) → `// contact`. Drop the existing `// this_project` section and `// interests` badge chips entirely; they don't serve the veteran/biases content angle.
- **D-A4: Voice primitives — NONE on `/about`.** The canonical demo lives on `/start-here` (DEBT-02). `/about` stays prose-only.

### Area B — `/start-here` function (DEBT-02)

- **D-B1: Audience — hybrid reader+practitioner AND contributor.** Two audiences served by one page. Reader/practitioner wants the curated path; contributor wants to learn how to write for the site. Voice primitives bridge between the two.
- **D-B2: Curated steps — 6, foundation + Phase 29 highlights.** Order: `eslint-flat-config` → `lint-staged-setup` → `monorepo-setup` → `typescript-strict` → `pre-push-validation` → `writing-custom-skills`. Reads as foundation → quality gates → AI-augmented arc. Each step links to both the entry page (context) and the install route (action) per the hybrid audience.
- **D-B3: Voice primitive placement — after the 6 steps, bridging into contributor section.** One `<AuthorNote>` framing the page itself ("the order I'd give a friend"); one `<DecisionRationale>` on the curation choice ("why these six and not the others"). Both render as the canonical demo, then transition into a dedicated contributor section.
- **D-B4: Contributor section — dedicated block at page end.** Points at `blink scaffold` tooling, the `obsidian-to-mdx-porting` guide, and the `content-authoring` guide. Light primer; the real material lives in those entries.

### Area C — Legacy MDX voice-primitive backfill (DEBT-03)

- **D-C1: Scope — all 11 legacy entries.** No selectivity.
  - 6 configs: `claude-code-plugins`, `tmux-poweruser`, `eslint-flat-config`, `artax-design-system`, `claude-code-settings`, `claude-code-mcp-servers`
  - 3 guides: `claude-code-stack-setup`, `monorepo-setup`, `content-authoring`
  - 1 skill: `claude-code/writing-custom-skills`
  - 1 hook: `pre-commit/lint-staged-setup`
- **D-C2: Depth — Variant 3 spirit rewrite, not light touch.** Apply Phase 29's architectural-framing pattern: opener that orients newer devs, snippets with new-tab links, voice primitives placed naturally. Consistency across the whole site post-phase is the goal.
- **D-C3: Sequencing — Claude's discretion during plan-phase** based on cross-ref dependency and risk. Plan-phase will likely batch into 3-4 plans of 3-4 entries each (mirroring Phase 29 Plans 03-06 cadence).

### Area D — Skills Detail typography polish (DEBT-04)

- **D-D1: Scope — cross-collection.** Apply polish to `apps/blakepetersen.io/src/components/dx-content-layout.tsx` for ALL 4 content types (skills + configs + hooks + guides). Honors the architectural reality flagged by the v1.3 audit; DEBT-04's "Skills Detail" naming is interpreted as "the shared content-detail layout." NOT a skills-only carve-out.
- **D-D2: Design source — v1.3 Phase 26-03 deferred punch list.** Specific tokens: `H1 text-3xl`, `max-w-[72ch]` reading column, `meta text-xs`. Apply these tokens first; verify they look right on all 4 content types. Targeted Pencil pass only if a content type clearly needs different treatment.

### Area E — Voice-lint promotion (DEBT-05)

- **D-E1: Policy — promote LINT-03 to error globally.** 20/20 organic-pass evidence from Phase 29 is sufficient. The LINT-F01 8-entry-per-collection heuristic is interpreted as a soft floor, not a hard gate. Site-wide promotion.
- **D-E2: Timing — ship the config change inside Phase 30.** DEBT-05 closes with a concrete change to the lint config, not just a logged opinion. Critically: this promotion MUST sequence AFTER the D-C1 backfill plans complete, or the 11 newly-voiced entries would fail lint mid-phase.

### Area F — v1.4 milestone audit (DEBT-06)

- **D-F1: Variant 3 architectural pivot — promote to "Milestone-level Decision" entry** in `.planning/milestones/v1.4-MILESTONE-AUDIT.md`. The pattern shapes how v1.5+ planning starts; worth elevating beyond a plan-SUMMARY footnote.
- **D-F2: Audit structure follows v1.0-v1.3 pattern.** Three sibling files in `.planning/milestones/`: `v1.4-MILESTONE-AUDIT.md`, `v1.4-REQUIREMENTS.md` (snapshot), `v1.4-ROADMAP.md` (snapshot). Mechanical from prior milestones — no new ceremony.

### Area G — Phase 29 carry-forward triage

- **D-G1: Cleanup plan in Phase 30.** Single plan bundles 3 mechanical chores:
  - Strip scaffold-template dead `artax-ui` imports in `packages/blink-cli/src/scaffold/templates/`
  - Update Plans 03/04/05 `key_links` frontmatter to reflect Variant 3 pattern (currently references stale `<ArtifactBody>` invariants)
  - Audit the three pre-fix commits (`1401246` blink-cli relative imports, `f12c0c1` lint-staged infra, `715a959` matcher narrow) and confirm they were appropriate; record outcome
- **D-G2: Robustness plan in Phase 30.** Single plan bundles 5 fixes from `29-REVIEW.md`:
  - WR-02 — Playwright snapshots gated on `pnpm build && pnpm start` (production), not `pnpm dev`. CI quality.
  - WR-03 — `CopyButton` clipboard `await` wrapped in try/catch with user-visible failure feedback.
  - WR-04 — Playwright `waitForLoadState('networkidle')` replaced with `waitForFunction` on `documentElement.getAttribute('data-theme')`. Hydration race fix.
  - IN-03 — Install route matches artifact on `slug + type`, not slug alone. Slug-collision correctness fix.
  - `.artifact.md` Prettier handling — either exclude `.artifact.md` from Prettier matcher, or have lint-staged inspect frontmatter `type:`. Plan 05 showed Prettier mangles bare asterisks in shell prose.
- **D-G3: ThemeProvider `<script>` warning — logged only, no action.** `next-themes@0.4.6` is on latest; React 19 + Next 16 (webpack) noise upstream; theme functionality unaffected. Document in `30-CONTEXT.md` and `v1.4-MILESTONE-AUDIT.md` as an upstream-watch item.

### Claude's Discretion
- Order of legacy MDX backfill within DEBT-03 (D-C3) — Claude picks during plan-phase based on cross-ref / risk.
- Specific copy choices for `/about` and `/start-here` — Claude drafts, Blake reviews per D-12 (Phase 29's "Blake-review-before-merge" pattern applies to prose entries).
- Plan numbering / count within Phase 30 — Claude proposes during plan-phase. Rough sketch: 8 plans (1 per DEBT-01..06 + 1 cleanup + 1 robustness).
- LINT-03 promotion plan sequencing — must run after C backfill; Claude chooses exact wave placement.

</decisions>

<specifics>
## Specific Ideas

- **Voice-primitive bridge pattern on `/start-here`** (D-B3): one of each primitive immediately following the 6-step list, where the primitive itself models the "voice you'd write into your own entries" — primitive *content* should ladder into the contributor-section ask. Don't drop them in the intro; make them the hand-off.
- **v1.3 Phase 26-03 punch list as floor, not ceiling** (D-D2): apply the specific tokens first; if reviewing the rendered four collections surfaces a content type that visibly needs different treatment, do a targeted Pencil pass on THAT type. Default to "shared tokens are enough."
- **LINT-03 promotion sequencing** (D-E2): the editorial-closure ordering is non-negotiable — backfill plans (C) finish, lint promotion plan (E) lands last as the final editorial commit. If a backfill plan fails late, the promotion plan defers; this is a hard sequence dependency that plan-phase MUST honor.
- **Variant 3 ADR mention** (D-F1): the milestone-level decision entry should call out: (a) inline-`<ArtifactBody>` removed, (b) install route generalized to `/install/[type]/[slug]`, (c) lint-staged content matcher narrowed via `715a959`. These are the three load-bearing changes that v1.5 planning needs to know about.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 29 outputs (input to Phase 30)
- `.planning/phases/29-content-authoring-greenfield-ports/29-02-SUMMARY.md` — Variant 3 pattern definition (architectural framing + quoted snippets + `/install/[type]/[slug]` links + voice primitives + no inline `<ArtifactBody>`)
- `.planning/phases/29-content-authoring-greenfield-ports/29-03-SUMMARY.md` — Worked example of the pattern applied across 4 skills; tone guidance
- `.planning/phases/29-content-authoring-greenfield-ports/29-07-SUMMARY.md` — Phase rollup with 11 carry-forward items, 5 of which fold into Phase 30 (Areas A-F absorb 2, Area G plans absorb 8)
- `.planning/phases/29-content-authoring-greenfield-ports/29-REVIEW.md` — 4 WR + 5 IN items; WR-02/03/04 + IN-03 fold into D-G2 robustness plan
- `.planning/phases/29-content-authoring-greenfield-ports/29-VERIFICATION.md` — UAT-passed evidence and human-verify carry-forward
- `.planning/phases/29-content-authoring-greenfield-ports/lint-warning-delta.md` — 8-entry-threshold evidence input for D-E1

### v1.3 deferred items (input to DEBT-04)
- `.planning/milestones/v1.3-MILESTONE-AUDIT.md` §21, §145 — Skills Detail typography deferral with cross-collection rationale
- `.planning/milestones/v1.3-phases/26-blakepetersen-io-page-updates/26-03-SUMMARY.md` §36 — Specific tokens that didn't ship (`H1 text-3xl`, `max-w-[72ch]`, `meta text-xs`)

### Requirements + roadmap
- `.planning/REQUIREMENTS.md` — DEBT-01..06 definitions (lines 91-96), LINT-01..07 + LINT-F01 references (lines 50-65), traceability table
- `.planning/ROADMAP.md` — Phase 30 success criteria (6 items), depends_on Phase 29

### Layout + components
- `apps/blakepetersen.io/src/app/about/page.tsx` — Current placeholder (98 lines, 4 sections); DEBT-01 target. Restructure per D-A3.
- `apps/blakepetersen.io/src/app/start-here/page.tsx` — Current 4-step scaffolding (110 lines); DEBT-02 target. Expand to 6 steps + contributor section per D-B2/D-B4.
- `apps/blakepetersen.io/src/components/dx-content-layout.tsx` — Shared layout for skills/configs/hooks/guides; DEBT-04 target. Token tweaks per D-D2.
- `packages/artax-ui/src/components/molecules/author-note/author-note.tsx` — Component contract for `<AuthorNote>`; canonical-demo invocations on `/start-here` must use this stable interface
- `packages/artax-ui/src/components/molecules/decision-rationale/decision-rationale.tsx` — `<DecisionRationale>` contract

### Lint
- `packages/blink-cli/src/lint/rules/voice-primitive.ts` — LINT-03 rule definition; DEBT-05 promotion target
- `packages/blink-cli/src/lint/rules/artifact-pair.ts` — LINT-02 (artifact-pair sync)
- `packages/blink-cli/src/lint/rules/frontmatter-schema.ts` — LINT-01 (frontmatter schema)

### Scaffold templates (DEBT cleanup D-G1)
- `packages/blink-cli/src/scaffold/templates/` (directory) — Target for dead-import cleanup
- `packages/blink-cli/src/scaffold/generator.ts` — Composes templates

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Variant 3 install route** (`apps/blakepetersen.io/src/app/install/[type]/[slug]/page.tsx`): no changes needed for Phase 30 except the D-G2 IN-03 fix (slug + type lookup). Backfilled legacy entries inherit this route automatically.
- **`<AuthorNote>` + `<DecisionRationale>`** (`packages/artax-ui/src/components/molecules/`): stable contracts proved out by Phase 29 torture test. `/start-here` canonical demos invoke these directly as JSX in the static page (NOT MDX) — components are server-safe.
- **`dx-content-layout.tsx`**: single layout for all 4 content types; DEBT-04 typography polish ripples to skills/configs/hooks/guides simultaneously. No per-collection branching.
- **`apply-action-bar.tsx`**: sticky `blink apply <type>/<slug>` UI on detail pages — Phase 30 backfill entries inherit this automatically once `requires_artifact: true` is set in frontmatter.

### Established Patterns
- **Variant 3 authoring pattern** (Phase 29 canonical): architectural-framing opener → H2/H3 sections mirroring artifact structure → 5-15 line quoted snippets with `<a target="_blank" rel="noopener" href="/install/<type>/<slug>">View full <filename> →</a>` → at least one voice primitive → no inline `<ArtifactBody>`. **All 11 DEBT-03 backfill entries follow this exactly.**
- **Option B / manual voice-primitive injection**: pre-existing entries have no Obsidian-style callouts, so the `blink port` auto-injection path doesn't apply. Voice primitives authored manually based on where the existing prose naturally calls for author-perspective or decision-callout. Same approach Phase 29 used for the convex-patterns torture test and the 4 batch ports.
- **Sequencing: backfill before lint promotion**: D-C1 plans complete before D-E1 plan ships. Phase 29 Plan 02 → Plans 03-06 → Plan 07 cadence is the model.
- **Plan SUMMARY → next-plan input**: each plan's SUMMARY downstream-consumer notes feed the next plan; Phase 29 proved this works for content-authoring waves.

### Integration Points
- **PROJECT.md Key Decisions section** (DEBT-05 logging requirement, line 165 of PROJECT.md): the LINT-03 promotion decision rationale lands here permanently
- **`pnpm lint:content`** runs against `apps/blakepetersen.io/content/` — must remain green after Phase 30 backfill + promotion. Pre-existing 24 errors / 5 warnings baseline expected to drop substantially (warnings clear once backfilled entries have `voice:` frontmatter)
- **`.planning/milestones/`** (DEBT-06 archive target) — sibling layout already established by v1.0/v1.1/v1.2/v1.3 entries

</code_context>

<deferred>
## Deferred Ideas

- **`next-themes` upstream watch (D-G3)** — log script-tag warning, monitor for upstream fix; revisit if v1.5 still has the issue. Possibly evaluate alternatives (hand-rolled FOUC script or theme-library swap) if upstream stalls.
- **Phase 31 / v1.5 robustness phase** — anything from REVIEW.md beyond the 5 fixes folded into D-G2 (currently nothing concrete; D-G2 absorbs all 4 WRs + IN-03).
- **`<ArtifactDataProvider>` scaling beyond ~50 entries** — Phase 29 fixed WR-01 (single-element array), but if v1.5+ adds many more entries the RSC payload story will need a re-look. Not a Phase 30 concern.
- **Full visual regression on every MDX entry** — REQUIREMENTS.md confirms this is a v2+ investment; DEBT-04 + Phase 29 torture test sufficient for v1.4.
- **Backfill `voice:` on the 12 `content/posts/*` entries** — out of scope; v1.4 explicitly defers posts collection. Phase 30's voice-lint promotion (D-E1) applies site-wide and may force this earlier than expected; flag during plan-phase if so.

</deferred>

---

*Phase: 30-editorial-closure*
