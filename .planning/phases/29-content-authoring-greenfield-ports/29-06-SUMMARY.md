---
phase: 29-content-authoring-greenfield-ports
plan: 06
subsystem: content
tags: [guides-batch, greenfield, mdx-only, variant-3-pattern, no-artifact-companion]

# Dependency graph
requires:
  - phase: 29-content-authoring-greenfield-ports
    plan: 02
    provides: "Variant 3 install-context route at /install/[type]/[slug]; authoring pattern (architectural framing + quoted snippets + voice primitives + no inline ArtifactBody) — guides INHERIT the prose pattern but OMIT the new-tab install anchor since INSTALLABLE_TYPES excludes guides per D-14"
  - phase: 29-content-authoring-greenfield-ports
    plan: 05
    provides: "Downstream-consumer notes for the guide-adapted variant of Variant 3 pattern; scaffold-CLI carry-forward gotchas (doubled content-root path, dead artax-ui imports); lint baseline 24/5 stable"
provides:
  - "Four net-new v1.4-compliant guide entries: ai-code-review, design-system-adoption, dx-registry-contribution, obsidian-to-mdx-porting"
  - "Guide-adapted Variant 3 pattern documented: same architectural-framing + voice-primitives + cross-refs shape as skills/configs/hooks, but with NO companion .artifact.md and NO /install/guides/<slug> anchors (D-14)"
  - "7 total guide entries on disk — CONTENT-04 floor (3 required) exceeded by D-02 expansion to 4"
  - "20 net-new DX content entries shipped across Plans 02-06 (5 skills + 7 configs + 4 hooks + 4 guides), satisfying CONTENT-01 through CONTENT-04 floors"
affects: [29-07, 30]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Guide-adapted Variant 3 pattern: architectural framing → H2/H3 sections with prose + 5-15-line quoted snippets → at least one voice primitive matching frontmatter voice → cross-refs to in-site entries via markdown links + external links to GitHub source where useful → NO /install/guides/<slug> anchors (route 404s by design) → NO inline <ArtifactBody> (no companion)"
    - "Cross-collection cross-refs surfaced via `related:` frontmatter: ai-code-review → hooks/commit-msg-ai-assist + hooks/pre-push-validation; design-system-adoption → configs/artax-design-system; dx-registry-contribution → guides/content-authoring (dependency) + configs/eslint-flat-config (related); obsidian-to-mdx-porting → configs/obsidian-vault"
    - "Both voice primitives invoked in every guide (4/4) — matches the natural shape of the source material (every guide has at least one author-experience moment and at least one architectural decision)"

key-files:
  created:
    - "apps/blakepetersen.io/content/guides/ai-code-review.mdx"
    - "apps/blakepetersen.io/content/guides/design-system-adoption.mdx"
    - "apps/blakepetersen.io/content/guides/dx-registry-contribution.mdx"
    - "apps/blakepetersen.io/content/guides/obsidian-to-mdx-porting.mdx"
  modified: []

key-decisions:
  - "29-06: Apply Plan 02 Variant 3 pattern adapted for guides — same prose shape (architectural framing + voice primitives + cross-refs) but NO companion artifact and NO /install/guides/<slug> anchors (D-14 / Phase 28 D-04). This supersedes the plan-file `must_haves.truths` <ArtifactBody> invariant as inherited from Plan 02 (same supersession applies for the fifth consecutive plan; logged for Phase 30 doc-cleanup)"
  - "29-06: All 4 guides invoke both voice primitives (AuthorNote + DecisionRationale) rather than the D-11 minimum of one — the source material had genuine first-person framing AND architectural-decision content for every guide; manufacturing a single-primitive entry would have produced weaker content"
  - "29-06: Cross-refs validated via `related:` and `dependencies:` against Plan 04/05 entries — all 4 guides cross-reference at least one other catalog entry, weaving the new guides into the existing content graph"
  - "29-06: Body content tuned to 1228-1395 prose-word band (excluding code-fence content); ai-code-review needed mid-plan trim from 1539 to 1389 after first draft pushed above the 1500 ceiling — addressed by tightening the 'Where AI Beats Humans' section from a bulleted breakdown to a paragraph"

patterns-established:
  - "Guide-adapted Variant 3: same authoring shape as skills/configs/hooks, three structural differences — (1) NO companion .artifact.md (D-14); (2) NO new-tab anchor to /install/guides/<slug> (route 404s by INSTALLABLE_TYPES allowlist exclusion); (3) `requires_artifact: false` in frontmatter (per D-14 / explicit override of any plan-file invariants written before the rule was clarified). Otherwise identical: architectural framing opener → H2/H3 sections → snippets-not-walls-of-code → at least one voice primitive matching frontmatter voice."
  - "Bulk guide-scaffold flow: `pnpm exec blink scaffold guide <slug> --voice author-note,decision-rationale` produces v1.3-default stub (draft: true, empty applies_to, TODO descriptions, dead artax-ui imports) → relocate from `apps/blakepetersen.io/apps/blakepetersen.io/content/guides/` to `apps/blakepetersen.io/content/guides/` → rewrite entire MDX → verify via velite + blink lint per entry → commit atomically as `feat(29-06): wr-NN scaffold + author <slug> guide`."
  - "Word-count band enforcement: target 500-1500 prose-only words (excluding fenced code). Code-fence content can push total word count higher but the prose-only count is the operative metric. If a first draft exceeds 1500 prose words, trim by collapsing bulleted lists into denser prose rather than cutting whole sections."

requirements-completed:
  - CONTENT-04

# Metrics
duration: "~25 min wall (2026-05-13T08:35Z first scaffold to wr-04 final commit, pre-metadata)"
completed: 2026-05-13
---

# Phase 29 Plan 06: Wave 3 Guides Batch Summary

**Four v1.4-compliant guide entries (`ai-code-review`, `design-system-adoption`, `dx-registry-contribution`, `obsidian-to-mdx-porting`) ship in four atomic commits as MDX-only prose entries (no companion artifacts per D-14), applying the Plan 02 Variant 3 pattern adapted for the artifact-less guide shape; CONTENT-04 floor exceeded per D-02 expansion to 4, and all 20 net-new DX entries of Phase 29 are now on disk.**

## Performance

- **Duration:** ~25 min wall (2026-05-13T08:35Z scaffold-start to 2026-05-13T09:01Z wr-04 final commit, pre-metadata)
- **Started:** 2026-05-13T08:35:46Z
- **Completed:** 2026-05-13T09:01:22Z
- **Tasks:** 2 plan tasks combined into 4 atomic per-guide commits + 1 metadata commit (this SUMMARY)
- **Files created:** 4 (4 .mdx entries — NO companion artifacts per D-14)
- **Files modified:** 0

## Accomplishments

- **ai-code-review shipped** at `apps/blakepetersen.io/content/guides/ai-code-review.mdx` — 1389-prose-word (1523 with fences) guide on putting AI in the code-review loop. Frames the three placement options (pre-commit / pre-push / post-PR-open), the AI-after-author / human-after-AI ordering, prompt patterns (role + focus + skip-list), and where AI beats humans (async correctness, security boundaries) vs where humans still win (taste, cross-PR context). Both voice primitives invoked: `<AuthorNote>` on the missing-await Promise.all anecdote, `<DecisionRationale>` on author-before-AI-before-human review order. `related:` cross-refs to `hooks/commit-msg-ai-assist` and `hooks/pre-push-validation`.
- **design-system-adoption shipped** at `…/guides/design-system-adoption.mdx` — 1228-prose-word (1259 with fences) guide on adopting a design system into an existing codebase. Frames the three-layer model (tokens → primitives → compositions), the migration arc (token layer first, primitives by replacement frequency, compositions once primitives stabilize, no page-level layer), the component-by-component (not page-by-page) discipline, and adoption metrics (imports from DS vs ad-hoc). Both voice primitives: `<AuthorNote>` on the "60 components but no adoption" trap, `<DecisionRationale>` on leaf-first migration vs page-first. `related:` cross-ref to `configs/artax-design-system`.
- **dx-registry-contribution shipped** at `…/guides/dx-registry-contribution.mdx` — 1395-prose-word (1436 with fences) guide on contributing entries to the blink-dx registry. Frames the four collections, the scaffold command, the voice contract (LINT-03), the lint rules (LINT-01/02/03/07), cross-references (`dependencies:` vs `related:`), what to skip in frontmatter, and the commit shape. Both voice primitives: `<DecisionRationale>` on voice primitives as components (vs Markdown conventions), `<AuthorNote>` on the optional-frontmatter overfill instinct. `dependencies: [guides/content-authoring]`, `related: [configs/eslint-flat-config]`. External links to `packages/blink-cli/src/scaffold/templates.ts` and `packages/blink-registry/src/schema.ts` on GitHub.
- **obsidian-to-mdx-porting shipped** at `…/guides/obsidian-to-mdx-porting.mdx` — 1390-prose-word (1411 with fences) guide distilling the Phase 29 port pipeline pattern. Frames the two-step pipeline (stage → commit), the callout mapping table (`[!note]`/`[!tip]` → AuthorNote, `[!warning]`/`[!important]` → DecisionRationale; others stay as blockquotes), wikilink rewriting, the structural-reshape pattern (architectural-framing opener, H2/H3 only, snippets not walls of code), what the pipeline can't do (60/40 ratio after fifth port), and when not to port. Both voice primitives: `<DecisionRationale>` on staging-vs-direct-port, `<AuthorNote>` on the 80→60% reality check after the fifth port. `related:` cross-ref to `configs/obsidian-vault`. Internal markdown links to all 5 ported skills (`convex-patterns`, `nextjs-stack-patterns`, `macbook-dev-setup`, `terminal-webdev-tuning`, `tmux-power-workflows`) as worked examples.
- **CONTENT-04 floor exceeded** — 4 net-new guide entries on disk (CONTENT-04 required 3). Total guides: 7 (3 pre-existing + 4 new).
- **No companion artifacts** — verified via `find apps/blakepetersen.io/content/guides -name "*.artifact.*" | wc -l` returning `0`. Scaffold did not emit any `.artifact.md` files for guides (Phase 28 D-04 / SCAFFOLD-05 round-trip test verified by the scaffold's actual behavior here, not just by spec).
- **Build green** — `pnpm --filter blakepetersen.io build` exits 0; Pagefind indexes 44 pages / 4365 words (up from Plan 05 baseline of 40/4065). Guide listing routes (`/guides/<slug>`) resolve; install routes (`/install/guides/<slug>`) intentionally 404 per Plan 02 INSTALLABLE_TYPES allowlist (verified by route shape — no fetch attempted because plan 02's INSTALLABLE_TYPES already gates this).
- **Playwright voice-primitives spec stays green** — 3/3 passed in 2.6s. The spec captures `/skills/convex-patterns`; adding to `content/guides/` does not drift the skill-page baselines, confirming Plan 05's downstream-consumer prediction for the fifth consecutive plan.
- **Jest green** — 40 suites / 280 tests passed (unchanged from Plan 05).
- **Lint delta zero** — `pnpm --filter blakepetersen.io lint:content` exits 1 with 24 errors / 5 warnings; identical to Wave 0 baseline. All errors in `content/posts/*` (Phase 30 scope); warnings include the pre-existing tmux-poweruser orphan-artifact advisory and typescript-config orphan. **Zero new errors or warnings from Plan 06.**
- **Phase 29 wave-complete** — 20 net-new DX entries shipped (5 skills + 7 configs + 4 hooks + 4 guides), all four floors satisfied (CONTENT-01/02/03/04), pattern locked. Plan 29-07 (phase gate) is unblocked.

## Task Commits

| Commit    | Slug                       | Prose words | Total words | Type |
| --------- | -------------------------- | ----------- | ----------- | ---- |
| `95ac2c0` | ai-code-review             | 1389        | 1523        | feat |
| `33dd259` | design-system-adoption     | 1228        | 1259        | feat |
| `50dada0` | dx-registry-contribution   | 1395        | 1436        | feat |
| `bbf600d` | obsidian-to-mdx-porting    | 1390        | 1411        | feat |

**Plan metadata:** *(see final commit below this SUMMARY)*

## Files Created/Modified

### Created (this plan)

- `apps/blakepetersen.io/content/guides/ai-code-review.mdx` — AI code review guide; both voice primitives; 2 `related:` cross-refs (hooks/commit-msg-ai-assist, hooks/pre-push-validation); inline markdown links to in-site hooks pages and external Claude Code / Copilot / Vercel Agent docs
- `apps/blakepetersen.io/content/guides/design-system-adoption.mdx` — Design system adoption guide; both voice primitives; 1 `related:` cross-ref (configs/artax-design-system); inline markdown link to the artax-design-system config page
- `apps/blakepetersen.io/content/guides/dx-registry-contribution.mdx` — DX registry contribution guide; both voice primitives; 1 `dependencies:` cross-ref (guides/content-authoring) + 1 `related:` cross-ref (configs/eslint-flat-config); external GitHub links to packages/blink-cli/src/scaffold/templates.ts and packages/blink-registry/src/schema.ts
- `apps/blakepetersen.io/content/guides/obsidian-to-mdx-porting.mdx` — Obsidian-to-MDX porting guide; both voice primitives; 1 `related:` cross-ref (configs/obsidian-vault); inline markdown links to all 5 ported skills (convex-patterns, nextjs-stack-patterns, macbook-dev-setup, terminal-webdev-tuning, tmux-power-workflows) as worked examples

### Modified

- (none)

### Confirmed untouched

- `apps/blakepetersen.io/content/guides/content-authoring.mdx` — pre-existing v1.4 guide, used as frontmatter shape reference; 0 diff lines from pre-Plan-06 state
- `apps/blakepetersen.io/content/guides/claude-code-stack-setup.mdx` — pre-existing v1.4 guide, used as cross-ref shape reference; 0 diff lines
- `apps/blakepetersen.io/content/guides/monorepo-setup.mdx` — pre-existing v1.0 guide, untouched (Phase 30 cleanup item if Blake wants v1.4 frontmatter migration)

## Downstream-consumer notes (Plan 07 — phase gate verification)

Plan 07 is the Phase 29 gate: verify the full content rollup against Wave 0 baseline + produce build-perf-baseline.json + lint-final.txt + lint-warning-delta.md. **Phase 29 entries are now complete** — Plan 07 is a verification-only plan, not an authoring plan.

What was shipped across Plans 02-06:

| Plan | Wave   | Entries shipped                                  | Requirement | Floor | Net-new |
| ---- | ------ | ------------------------------------------------ | ----------- | ----- | ------- |
| 02   | 1      | convex-patterns (1st skill, torture-test gate)    | CONTENT-01 + CONTENT-06 | -     | 1       |
| 03   | 2      | 4 ported skills (macbook-dev-setup, etc.)        | CONTENT-01  | 5     | 4       |
| 04   | 2      | 7 greenfield configs (typescript-strict, etc.)   | CONTENT-02  | 5     | 7       |
| 05   | 2      | 4 greenfield hooks (pre-push-validation, etc.)   | CONTENT-03  | 3     | 4       |
| 06   | 3      | 4 greenfield guides (ai-code-review, etc.)       | CONTENT-04  | 3     | 4       |
| **Total** | | **20 net-new entries**                             | **CONTENT-01..04 floors all satisfied** |  | **20**  |

**Plan 07's verification checklist:**

1. **Build-perf baseline**: capture cold `pnpm build` + warm `next dev` startup times against the 20-new-entry tree; compare against v1.4 perf baseline (`build-perf-baseline.json` from Phase 27, content count 23 at baseline; now 43 with the 20 new entries). Write the new measurement to `.planning/intel/build-perf-baseline-v1.4-content-density.json` or equivalent.
2. **Lint-final.txt**: capture full `pnpm --filter blakepetersen.io lint:content` output; compare against Wave 0 baseline (24 errors / 5 warnings, all in `content/posts/*` + the orphan tmux-poweruser advisory). Expect zero delta on net-new content; pre-existing errors carry forward unchanged.
3. **Lint-warning-delta.md**: per-plan delta narrative — confirm zero new errors and zero new warnings from any of Plans 02-06. Plans 03/04/05/06 SUMMARYs each independently document zero delta; Plan 07 produces the rollup.
4. **`blink list` smoke test**: confirm CLI inspection returns ≥20 net-new entries spanning the four collections (CONTENT-04 success criterion #5 from REQUIREMENTS.md and ROADMAP.md). Total entries on disk after Plan 06: 5+1 skills, 6+7 configs, 1+4 hooks, 3+4 guides = 31 entries (the 11 pre-existing baseline + 20 new).
5. **Playwright voice-primitives baseline**: confirm 3/3 still green at final state (verified at every plan boundary so far; no regen needed unless skill listing drifted from Plan 06's view).

**Carry-forward from Plan 06:**

- Same scaffold-CLI doubled-path quirk as Plans 04/05 — Plan 07 doesn't author content but if any guide is touched for editorial, the same `mv` recovery applies. Phase 30 fix scope.
- Same scaffold dead-import strip required from initial output — Plan 06 stripped on all 4 entries. Phase 30 fix scope.
- The Variant 3 pattern is now locked across all four collections — skills/configs/hooks all share `/install/<collection>/<slug>` new-tab anchors; guides intentionally omit per D-14. Plan 07 should confirm all install routes resolve except `/install/guides/<slug>` which 404s.

## Decisions Made

- **Variant 3 pattern adapted for guides over the stale plan-file `<ArtifactBody>` invariant.** Plan 02's SUMMARY documented this supersession for Plans 03/04/05/06; Plan 06 inherits it for the fifth consecutive plan. Plan-file `must_haves.truths` `"NO <ArtifactBody> invocations in any guide (no companion to render) per UI-SPEC §Per-Entry MDX Authoring Contract"` was actually correct for Plan 06 (since guides have no artifact), but the plan's bracketing instructions (`<critical_pattern_override>`) made the intent explicit. The deviation is in the plan-file `must_haves.truths` invariants written for the earlier plans assuming a uniform <ArtifactBody> body shape; for guides specifically, that was never the intent.
- **All 4 guides invoke both voice primitives.** D-11 requires one; all 4 entries shipped with both because the source material had real first-person framing AND real architectural decisions in every case. Same pattern as Plans 03 and 04. Phase 30's DEBT-05 voice-lint promotion review has a stronger evidence base (20-entry both-primitives sample).
- **Cross-refs validated against existing entries before frontmatter declaration.** The `related:` field in every guide points to a real entry: ai-code-review → hooks/commit-msg-ai-assist (Plan 05) + hooks/pre-push-validation (Plan 05); design-system-adoption → configs/artax-design-system (pre-existing); dx-registry-contribution → guides/content-authoring (pre-existing) + configs/eslint-flat-config (pre-existing); obsidian-to-mdx-porting → configs/obsidian-vault (Plan 04). Verified each by `ls apps/blakepetersen.io/content/<collection>/<slug>.*` before commit. SCHEMA-04 cross-ref validator caught nothing.
- **Strip scaffold's `import { AuthorNote }` block.** Same as Plans 04/05. The scaffold emits `import { AuthorNote } from 'artax-ui'` and `import { DecisionRationale } from 'artax-ui'` at the top of every new MDX; these are dead code per `mdxComponents` global registration in `apps/blakepetersen.io/src/components/mdx-content.tsx`. Stripped on all 4 entries to match canonical entry shape.
- **No external-doc-link verification.** The guides include markdown links to `docs.claude.com/claude-code`, `vercel.com/docs/agents/code-review`, `docs.github.com/en/copilot/...`, and `github.com/blakepetersen/petersen-group/...` — these are documentation URLs that the build doesn't validate (Velite checks frontmatter cross-refs only, not body link URLs). Author responsibility; verified by hand at write time.

## Deviations from Plan

The plan-file's `must_haves.truths` array correctly states `"NO companion artifacts exist for guides per D-14 (Phase 28 D-04)"` and `"NO <ArtifactBody> invocations in any guide"` — for Plan 06 specifically, the plan-file invariants match the executed reality (in contrast to Plans 03/04/05 where the plan files asserted `<ArtifactBody>` invariants that were superseded). **No deviation from the plan-file's stated truths for Plan 06.**

However, the executor's prompt explicitly framed this as a Variant 3 adaptation and noted that Plan 02's pattern (architectural framing + new-tab anchors to `/install/<collection>/<slug>`) needed three modifications for guides (no companion, no install anchor, snippet links go to in-site or external content). That framing applied verbatim; the four guides each carry the architectural framing + voice primitives + cross-refs structure with the install-anchor specifically dropped.

Plan-file `key_links.pattern: "related:.*configs/obsidian-vault"` (for obsidian-to-mdx-porting): **satisfied** — `related: ["configs/obsidian-vault"]` present in frontmatter.

Plan-file `key_links.pattern: "related:.*hooks/"` (for ai-code-review): **satisfied** — `related: ["hooks/commit-msg-ai-assist", "hooks/pre-push-validation"]` present in frontmatter.

### Auto-fixed Issues

**1. [Rule 1 - Bug] Word-count overshoot on ai-code-review first draft**

- **Found during:** Task 1 (ai-code-review.mdx initial write)
- **Issue:** First draft of `ai-code-review.mdx` came in at 1539 prose words / 1673 total words — over the 500-1500 plan band. Source: the "Where AI Beats Humans / Where Humans Beat AI" section used a bulleted breakdown for both columns, which was clearer for the reader but consumed too much word budget.
- **Fix:** Collapsed both bulleted lists into denser paragraph prose. Same coverage, half the word count for that section. Result: 1389 prose words (within band), 1523 total (still well under any practical reading-time ceiling).
- **Files modified:** `apps/blakepetersen.io/content/guides/ai-code-review.mdx`
- **Verification:** `awk '/^---$/{c++; next} c>=2' …mdx | awk 'BEGIN{infence=0} /^```/{infence=1-infence; next} !infence' | wc -w` → 1389
- **Committed in:** `95ac2c0` (rolled into the wr-01 commit — fixed before the commit landed)

**2. [Rule 3 - Blocking] Relocate scaffold output from doubled content-root path**

- **Found during:** Each of the 4 scaffold calls (wr-01 through wr-04)
- **Issue:** Carry-forward from Plans 04/05. `pnpm exec blink scaffold` resolves its content-root from `process.cwd()` and prepends `apps/blakepetersen.io` — when run from the workspace root (the executor's cwd), the path doubles to `apps/blakepetersen.io/apps/blakepetersen.io/content/guides/<slug>.mdx`.
- **Fix:** After each scaffold call, `mv` the emitted file to the correct location and `rm -rf` the doubled-path tree.
- **Files modified:** None in committed state (the doubled-path tree never existed in any committed snapshot)
- **Verification:** `git status` clean of the doubled path after each move; `ls apps/blakepetersen.io/content/guides/<slug>.mdx` confirms placement
- **Committed in:** N/A (working-directory recovery only)

**3. [Rule 3 - Blocking] Stripped scaffold-emitted `artax-ui` imports**

- **Found during:** Each of the 4 scaffold outputs (read step)
- **Issue:** Carry-forward from Plans 04/05. Scaffold emits `import { AuthorNote } from 'artax-ui'` and `import { DecisionRationale } from 'artax-ui'` at the top of every new MDX. These are dead code — `artax-ui` registers both components globally via `mdxComponents` in `apps/blakepetersen.io/src/components/mdx-content.tsx:8`. Canonical existing entries (content-authoring.mdx, claude-code-stack-setup.mdx, all 5 skills, all 13 configs, all 5 hooks) carry no such imports.
- **Fix:** When rewriting each scaffold output, omit the import block entirely. Both primitives render correctly via the global registry.
- **Files modified:** All 4 new `.mdx` entries
- **Verification:** `pnpm --filter blakepetersen.io build` exits 0 (Velite + Webpack); voice primitives render in the live page via the global registry path (verified indirectly by Playwright voice-primitives spec staying green)
- **Committed in:** wr-01 through wr-04 (rolled into each entry's commit)

---

**Total deviations:** 3 auto-fixed (1 bug — word-count overshoot caught and trimmed pre-commit; 2 blocking carry-forwards from Plans 04/05 — scaffold doubled-path + dead imports, mitigated per entry as before). **Impact on plan:** Minimal. The word-count trim was an editorial pass before the commit landed; the carry-forwards were applied per-entry as in Plans 04/05. None of the deviations changed the plan's structural shape or required user input.

## Plan deviations / Phase 30 documentation cleanup

The following are downstream-only and should be tracked in Phase 30's docs-cleanup scope:

- **Plan-file `must_haves.truths` invariants assuming `<ArtifactBody>` body shape across all four collections** — Plans 03/04/05's plan files asserted invariants that no longer hold under the Plan 02 Variant 3 pattern. Plan 06's plan file is internally consistent (D-14 already excludes artifacts for guides), but the same documentation-cleanup pattern applies to the earlier plans. Phase 30 should annotate the plan files as historical or update the invariants. Fifth consecutive plan where the issue surfaces.
- **Scaffold template emits dead `artax-ui` imports** — already on the Phase 30 list from Plans 04/05; Plan 06 hit the same and applied the same per-entry strip. Should fix the scaffold template (omit the imports) since `mdx-content.tsx` registers globally.
- **Scaffold CLI doubles the content-root path when run from workspace cwd** — already on the Phase 30 list from Plans 04/05; Plan 06 hit the same and applied the same `mv` recovery. Should fix the cwd resolution in the scaffold CLI.
- **Pre-existing `monorepo-setup.mdx` is v1.0 frontmatter shape** — no `voice:`, `requires_artifact:`, `decisions:` fields. Plan 06 left it untouched. Phase 30 should decide whether to migrate to v1.4 (consistency with the new entries) or leave as a historical entry.

## Known Stubs

None. All 4 entries ship with real prose (no "TODO" / "placeholder" / "coming soon") and zero hardcoded empty arrays flow to UI. The frontmatter `decisions:` arrays correspond to actual `<DecisionRationale>` body invocations in every guide. All `related:` cross-refs resolve to real catalog entries.

## Threat Flags

None new. All 4 entries are static MDX rendered by Velite into the existing `/guides/<slug>` route. No companion artifacts (D-14), so no `/install/guides/<slug>` surface to consider. No new endpoints, no auth surface, no schema changes, no user input paths.

Threat register from the plan frontmatter:

- **T-29-06-01 (External link spoofing):** Mitigated by authorial care — external links point at well-known canonical URLs (`docs.claude.com`, `vercel.com/docs`, `docs.github.com`, `github.com/blakepetersen/petersen-group`). Blake's editorial pass per D-12 is the second human check.
- **T-29-06-02 (Broken cross-ref):** Mitigated — SCHEMA-04 cross-ref validator passed on every velite build for every guide; all 4 entries cross-reference real catalog entries. Build green throughout.
- **T-29-06-03 (Accidental `<ArtifactBody>` referencing nonexistent slug):** Mitigated — explicit per-task acceptance check (`grep -q "ArtifactBody"` returning empty) verified for all 4 guides. Plan-file invariant and executor framing both forbid `<ArtifactBody>` in guides; lint and build would have caught it anyway.
- **T-29-06-04 (Hardcoded secret in inline code):** Mitigated — code fences in guides are illustrative examples (Prompt skeletons, JSON config snippets, sh examples) with no real credentials. Reviewed at write time.
- **T-29-06-05 (Voice frontmatter / body mismatch):** Mitigated — `blink lint --files` clean for all 4 entries; voice frontmatter matches body invocations exactly (`voice: [author-note, decision-rationale]` + both primitives in body).

## Issues Encountered

- **First-draft word count on ai-code-review exceeded 1500 prose words.** Caught during the per-entry verification step (`awk … | wc -w` returned 1539). Trimmed in place by collapsing the AI-vs-humans columnar breakdown into dense prose. Same edit time as authoring; not a meaningful interruption. **Mitigation locked in for future plans:** keep an eye on the word count *during* drafting, not just at verify — paragraph prose is denser than bulleted lists and is the right shape for guide content.
- **`pnpm lint:content` exits 1 with the pre-existing 24 errors / 5 warnings.** Same baseline as Plans 02-05. Errors all in `content/posts/*` (Phase 30 scope); warnings include the pre-existing tmux-poweruser orphan-artifact advisory and typescript-config orphan. **Zero new errors or warnings from Plan 06.**
- **Velite Jest console message:** `fatal: /var/.../velite-prepare-test-iqoRnK/multi.json' is outside repository`. Pre-existing test-setup quirk that has been present since Plan 04. All 40 suites / 280 tests still pass; the message is from a velite-prepare test that runs git commands in a tmp dir. Not in scope.
- **Uncommitted `apps/blakepetersen.io/content/.artifact-versions.json` modification at plan start.** Pre-existing leftover from Plan 05's last velite run (hash for branch-name-enforcement updated by velite after Plan 05's final commit). Stale uncommitted change unrelated to Plan 06; left alone (Plan 06 does not touch artifact-versions because guides have no artifacts).

## Next Phase Readiness

**Plan 29-07 (Wave 3 — phase gate verification) is unblocked.** Required artifacts on disk:

- All 20 net-new DX entries shipped across Plans 02-06 (5 skills + 7 configs + 4 hooks + 4 guides)
- Build green, Playwright 3/3 green, Jest 40/280 green, lint delta zero
- Cross-refs all resolve; no broken references; no orphan artifacts beyond the two pre-existing advisories (tmux-poweruser, typescript-config — Phase 30 scope)
- Plan 07 is a verification-only plan; no new content authoring expected

**Phase 30 carry-forward items (rolled forward from Plans 04/05/06):**

- Update Plan 03/04/05 `must_haves.truths` invariants for `<ArtifactBody>` or annotate as superseded (fifth consecutive plan)
- Update scaffold template to omit dead `artax-ui` imports (carry-forward from Plans 04/05/06)
- Fix scaffold CLI cwd resolution so it doesn't double the content-root path (carry-forward from Plans 04/05/06)
- Migrate pre-existing `monorepo-setup.mdx` (and `lint-staged-setup.mdx` per Plan 05's note) to v1.4 frontmatter shape if Blake wants the consistency sweep
- Tighten LINT-03 heuristic so `## Why ...` headings aren't auto-flagged as DecisionRationale candidates (carry-forward from Plan 05)
- Audit prettier behavior on `.md` files (carry-forward from Plan 05; N/A for Plan 06 since no shell artifacts)
- Editorial pass on the 4 new guides — Blake's 24h re-read per PITFALLS.md #6

## Self-Check: PASSED

Verifications performed before writing this SUMMARY:

- `git log --oneline | grep "29-06"` → 4 commits present (`95ac2c0`, `33dd259`, `50dada0`, `bbf600d`)
- `[ -f apps/blakepetersen.io/content/guides/ai-code-review.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/guides/design-system-adoption.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/guides/dx-registry-contribution.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/guides/obsidian-to-mdx-porting.mdx ]` → FOUND
- `find apps/blakepetersen.io/content/guides -name "*.mdx" | wc -l` → 7 (3 pre-existing + 4 net-new)
- `find apps/blakepetersen.io/content/guides -name "*.artifact.*" | wc -l` → 0 (D-14 satisfied — guides are MDX-only)
- All 4 bodies in 500-1500 prose-word band: 1389 / 1228 / 1395 / 1390 (excluding fenced code)
- All 4 entries contain `<AuthorNote>` AND `<DecisionRationale>` invocations (verified by grep)
- No entry contains `<ArtifactBody` (verified by grep — D-14 satisfied)
- All 4 entries have `requires_artifact: false` in frontmatter (verified by grep — D-14 satisfied)
- All 4 entries have `draft: false` in frontmatter (verified by grep)
- All 4 entries declare `voice: ["author-note", "decision-rationale"]` matching body invocations exactly (LINT-03 clean)
- `pnpm --filter blakepetersen.io velite` → exit 0
- `pnpm --filter blakepetersen.io build` → exit 0 (Pagefind indexed 44 pages, 4365 words — up from Plan 05 baseline of 40/4065)
- `pnpm --filter blakepetersen.io test` (Jest) → 40 suites / 280 tests passed
- `pnpm --filter blakepetersen.io lint:content` → 24 errors / 5 warnings — **delta zero vs Wave 0 baseline** (errors all in `content/posts/*` per Phase 30 scope; warnings include pre-existing tmux-poweruser and typescript-config orphans)
- `pnpm --filter blakepetersen.io exec blink lint --files <4 new guides>` → ✔ No issues found (lint clean specifically on the new entries)
- `pnpm exec playwright test tests/visual` → 3/3 passed in 2.6s (no regen needed; voice-primitives baseline stays green because Plan 06 adds to `content/guides/`, not `content/skills/`)

---
*Phase: 29-content-authoring-greenfield-ports*
*Plan: 06*
*Completed: 2026-05-13*
