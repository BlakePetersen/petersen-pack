# Phase 29 Lint Warning Delta — DEBT-05 Input

**Captured:** 2026-05-13 (Phase 29 Wave 4 end-of-phase gate)
**Inputs:** `lint-baseline.txt` (Wave 0, 2026-05-10) vs `lint-final.txt` (Wave 4, 2026-05-13)
**Purpose:** Phase 30 DEBT-05 (voice-lint promotion review) evidence.

---

## Summary

| Axis     | Baseline (Wave 0) | Final (Wave 4) | Delta |
| -------- | ----------------- | -------------- | ----- |
| Errors   | 24                | 24             | **0** |
| Warnings | 5                 | 5              | **0** |

**Verdict:** Zero NEW errors AND zero NEW warnings introduced across 20 net-new entries (5 skills + 7 configs + 4 hooks + 4 guides). LINT-03 voice-primitive advisory rule did not fire once during authoring — every new entry whose frontmatter declared `voice:` also invoked the corresponding primitive in body MDX.

---

## Per-rule breakdown (warnings only — errors are blocking and pre-existing)

| Rule                                                     | Baseline count | End count | Delta | Notes                                                                                                                                                                |
| -------------------------------------------------------- | -------------- | --------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LINT-03 (voice-primitive invocation advisory)            | 0              | 0         | 0     | All 20 Phase 29 entries declaring `voice: [...]` also invoke `<AuthorNote>` and `<DecisionRationale>` in body MDX. Rule produced no advisory output across the phase. |
| LINT-02 (orphan `.artifact.md` warning)                  | 3              | 3         | 0     | Pre-existing in `content/configs/claude-global.artifact.md`, `claude-project.artifact.md`, `typescript-config.artifact.md`. Phase 30 DEBT-02 owns sibling-MDX creation.  |
| LINT-02 (sibling has `requires_artifact: false`)         | 2              | 2         | 0     | Pre-existing in `eslint-flat-config.artifact.md` and `tmux-poweruser.artifact.md`. Per Plan 04 D-04, `tmux-poweruser` was intentionally NOT touched (collision-resolved by shipping `tmux-popup-workflows` as a separate entry). |

## Per-collection authored count

| Collection | Net-new entries | Voice primitives invoked (both AuthorNote + DecisionRationale) | Avg prose word count | Notes                                                                                       |
| ---------- | --------------- | -------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| skills     | 5               | 5/5 (100%)                                                     | ~988                 | Includes torture-test entry (`convex-patterns`). 1 pre-existing entry (`writing-custom-skills`) untouched. |
| configs    | 7               | 7/7 (100%)                                                     | ~861                 | Includes `tmux-popup-workflows` (collision-resolved). 6 pre-existing configs untouched.    |
| hooks      | 4               | 4/4 (100%)                                                     | ~894                 | All artifacts are real working shell scripts (Husky v9 idiom). 1 pre-existing untouched.   |
| guides     | 4               | 4/4 (100%)                                                     | ~990                 | MDX-only per D-14 (`requires_artifact: false`). 3 pre-existing guides untouched.           |
| **Total**  | **20**          | **20/20 (100%)**                                               | ~915                 | Both-primitives invocation rate is 100% — exceeds D-11 minimum (1 of 2) for every entry.    |

---

## DEBT-05 recommendation (Phase 30 input)

**Recommendation: PROMOTE LINT-03 voice-primitive rule from `warn` to `error` in Phase 30.**

**Rationale:**
- v1.4-PLAN-06 set the 8-entry organic-pass heuristic for promotion. We have a 20-entry organic-pass sample, all clean.
- Across 20 new entries declaring `voice: ['author-note']` or `voice: ['decision-rationale']`, **every single one** invokes the declared primitive in body MDX. LINT-03 fired zero times during the phase.
- The Plan 02 + Plan 03 voice-primitive contract was internalized via the scaffold template — authors never had to remember to add the body invocation, because the scaffold pre-populated it.
- Promotion is safe: the rule cannot regress without a deliberate frontmatter edit that strips the body, and the cost of catching such drift at lint-time (error) vs CI/PR review is the entire point of advisory→blocking promotion.

**Risk:** none material. Three rule promotions to consider:

| Rule                                                                 | Current | Recommended | Rationale                                                                                  |
| -------------------------------------------------------------------- | ------- | ----------- | ------------------------------------------------------------------------------------------ |
| `voice: ['author-note']` declared but no `<AuthorNote>` in body       | warn    | **error**   | 20/20 invocation rate. Promotion safe.                                                     |
| `voice: ['decision-rationale']` declared but no `<DecisionRationale>` | warn    | **error**   | 20/20 invocation rate. Promotion safe.                                                     |
| Orphan `.artifact.md` (LINT-02)                                       | warn    | keep warn   | 3 pre-existing orphans block promotion; Phase 30 DEBT-02 creates sibling MDX, then promote. |

---

## Carry-forward items to Phase 30

1. **Backfill `voice:` frontmatter on the 4 pre-existing `.mdx` entries that predate the voice schema** (1 skill `claude-code/writing-custom-skills.mdx` + 6 legacy configs + 1 legacy hook + 3 legacy guides where rationale-shaped content exists). DEBT-02 / DEBT-03 territory.
2. **Promote LINT-03 to error** per recommendation above. Update `packages/blink-cli/src/lint/rules/voice-primitive.ts` and add a Phase 30 test fixture.
3. **Resolve the 3 LINT-02 orphan warnings** by creating sibling MDX entries for `claude-global.artifact.md`, `claude-project.artifact.md`, and `typescript-config.artifact.md`. These are real artifacts without prose homes.
4. **Decide on `eslint-flat-config` + `tmux-poweruser` `requires_artifact: false` warnings.** Plan 04 D-04 locked `tmux-poweruser` untouched, but the LINT-02 warning persists as an editorial signal. Either flip both to `requires_artifact: true` (suppress warning) or formally accept the warning as expected — currently it's a permanent advisory.
5. **24 pre-existing posts/* errors** (12 entries × 2 errors each: missing `applies_to`, additional properties). Phase 30 OR a dedicated content-migration plan owns the posts schema reconciliation. Out of v1.4 scope per Pitfall 1.
