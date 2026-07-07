---
phase: 29-content-authoring-greenfield-ports
plan: 05
subsystem: content
tags: [hooks-batch, greenfield, variant-3-pattern, husky-v9, prettier-asterisk-gotcha]

# Dependency graph
requires:
  - phase: 29-content-authoring-greenfield-ports
    plan: 02
    provides: "Variant 3 install-context route at /install/[type]/[slug]; authoring pattern (architectural framing + quoted snippets + new-tab install links + no inline ArtifactBody)"
  - phase: 29-content-authoring-greenfield-ports
    plan: 04
    provides: "Bulk scaffold-then-rewrite flow; scaffold-emitted dead artax-ui imports stripped per entry; lint baseline 24/5 stable"
provides:
  - "Four net-new v1.4-compliant hook entries: pre-push-validation, post-merge-dep-sync, commit-msg-ai-assist, branch-name-enforcement"
  - "Four companion artifacts with real working executable shell scripts (D-13) targeting .husky/<hook-name> destinations under husky v9"
  - "5 total hook entries on disk — CONTENT-03 floor (3 required) exceeded by D-02 expansion to 4"
  - "Prettier-asterisk gotcha documented (lockfile case-glob got mangled into Markdown italics; mitigation: prefer grep -qE with anchored regex over case-glob in shell artifacts)"
affects: [29-06, 30]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Variant 3 pattern applied to four hooks: architectural framing → quoted snippets with title= → new-tab anchors to /install/hooks/<slug> → no inline ArtifactBody → at least one voice primitive matching frontmatter voice"
    - "Single-file artifact shape uniformly (.artifact.md, not .artifact/ directory) — all 4 hooks target a single husky-v9 hook file at .husky/<hook-name>"
    - "Husky v9 form: NO shebang in hook bodies (husky invokes via sh directly); two-line `# ABOUTME:` comment as first prose lines of body"
    - "Prettier-safe shell idioms: grep -qE with anchored regex inside single-quoted strings, if/elif chains instead of case statements with bare `*)` fallthroughs — every `*` outside a fenced code block is a prettier-italic candidate"

key-files:
  created:
    - "apps/blakepetersen.io/content/hooks/pre-push-validation.mdx"
    - "apps/blakepetersen.io/content/hooks/pre-push-validation.artifact.md"
    - "apps/blakepetersen.io/content/hooks/post-merge-dep-sync.mdx"
    - "apps/blakepetersen.io/content/hooks/post-merge-dep-sync.artifact.md"
    - "apps/blakepetersen.io/content/hooks/commit-msg-ai-assist.mdx"
    - "apps/blakepetersen.io/content/hooks/commit-msg-ai-assist.artifact.md"
    - "apps/blakepetersen.io/content/hooks/branch-name-enforcement.mdx"
    - "apps/blakepetersen.io/content/hooks/branch-name-enforcement.artifact.md"
  modified:
    - "apps/blakepetersen.io/content/.artifact-versions.json"

key-decisions:
  - "29-05: Apply Plan 02 Variant 3 pattern verbatim to all 4 hooks — supersedes the plan-file `<ArtifactBody slug=\"hooks/<slug>\" />` truth (same supersession as 29-02, 29-03, 29-04; logged for Phase 30 doc-cleanup)"
  - "29-05: Switch from case-glob (`*pnpm-lock.yaml*`) to grep -qE in shell artifacts after prettier mangled the asterisks into Markdown italics on first commit — discovered live, fixed inline with a follow-up commit"
  - "29-05: Switch from `case` with `*)` fallthrough to if/elif chain in commit-msg hook after prettier escaped the asterisk on commit — sh -n still passed but the n/no/decline branch became a no-match"
  - "29-05: Pre-push for branch-name-enforcement (decision-rationale primitive explains the call); pre-commit on a non-conforming branch produces 10-50× the noise per branch and trains developers to ignore the hook"
  - "29-05: AI_COMMIT_CMD env var (default `claude`) for the AI-assist hook — readers swap to ollama/aichat/llm with one env var; the hook is provider-agnostic"
  - "29-05: Never silently rewrite commit messages — always show original + suggestion, always require explicit y/e/n. The /dev/tty redirect is the load-bearing trick to reattach to the user's terminal inside commit-msg's closed-stdin context"

patterns-established:
  - "Prettier-asterisk avoidance in shell artifacts: any case-glob with `*pattern*` outside a fenced code block is a markdown-italics candidate. Prefer `grep -qE` with anchored regex inside single-quoted strings, or fenced shell blocks if illustrating in prose. Caught and fixed on two hooks in this plan (post-merge wr-02, commit-msg wr-03)."
  - "Husky-v9 hook artifact shape: no shebang in body, destination `.husky/<hook-name>`, two-line `# ABOUTME:` prose comment as first lines of body, `merge: replace` for fresh hook files, `merge: section` only if the hook merges into an existing file (none in this plan)."
  - "The hook chain stays clean if each hook stays single-purpose: branch-name and pre-push-validation both target `.husky/pre-push` but ship as separate artifacts with `merge: replace`, and the MDX prose explains how to compose them into one file. Avoids the multi-artifact directory shape for this kind of stack-up."

requirements-completed:
  - CONTENT-03

# Metrics
duration: "~70 min wall (2026-05-13 first scaffold to final task commit, pre-metadata)"
completed: 2026-05-13
---

# Phase 29 Plan 05: Wave 3 Hooks Batch Summary

**Four v1.4-compliant hook entries (`pre-push-validation`, `post-merge-dep-sync`, `commit-msg-ai-assist`, `branch-name-enforcement`) ship in six atomic commits (4 feat + 2 fix) with real working husky-v9 shell artifacts, the Plan 02 Variant 3 authoring pattern applied verbatim, the prettier-asterisk gotcha caught and mitigated mid-plan, and the CONTENT-03 floor exceeded per D-02 expansion to 4.**

## Performance

- **Duration:** ~70 min wall on 2026-05-13 (first scaffold to final task commit, pre-metadata)
- **Tasks:** 2 plan tasks combined into 4 atomic per-hook commits + 2 fix-forward commits (prettier-asterisk damage on wr-02 and wr-03) + 1 metadata commit (this SUMMARY)
- **Files created:** 8 (4 .mdx entries + 4 .artifact.md companions)
- **Files modified:** 1 (`content/.artifact-versions.json` — auto-tracked by Velite per new artifact)

## Accomplishments

- **pre-push-validation shipped** at `apps/blakepetersen.io/content/hooks/pre-push-validation.mdx` — 1254-word entry on a husky-v9 pre-push hook that scopes typecheck + lint + jest related-tests to files changed between `@{u}` and HEAD. Both voice primitives invoked (`<AuthorNote>` on the 90-day full-suite-on-pre-push experiment, `<DecisionRationale>` on diff-vs-stdin signaling). Artifact ships a complete `.husky/pre-push` with upstream/origin-main/root-commit fallback chain, per-tool scoping, helpful failure framing.
- **post-merge-dep-sync shipped** at `…/hooks/post-merge-dep-sync.mdx` — 1129-word entry on a post-merge hook that re-runs `pnpm install` when `pnpm-lock.yaml` changed in the merge diff. `<AuthorNote>` on the "third week, you've forgotten the hook exists" win condition for silent-good-citizen hooks. Artifact uses `grep -q 'pnpm-lock\.yaml'` against the diff-tree output (originally a case-glob, fixed after prettier-asterisk damage).
- **commit-msg-ai-assist shipped** at `…/hooks/commit-msg-ai-assist.mdx` — 1259-word entry on a commit-msg hook that detects non-conventional messages, pipes the staged diff plus the developer's draft into a local AI CLI (`AI_COMMIT_CMD`, default `claude`), and offers a three-way accept/edit/reject prompt via `/dev/tty`. `<DecisionRationale>` on sending the staged diff (scope inference) vs message only. `<AuthorNote>` on the 60% accept rate from a one-month side-project trial. Cross-references `configs/commitlint` as the downstream stick to this hook's carrot.
- **branch-name-enforcement shipped** at `…/hooks/branch-name-enforcement.mdx` — 1245-word entry on a pre-push hook that rejects non-conventional branch names with a helpful rename-command failure message. `<DecisionRationale>` on pre-push vs pre-commit (10-50× noise reduction). Artifact uses `grep -qE` with anchored regex (no asterisks in case patterns — preemptive prettier-asterisk avoidance after the wr-02 incident).
- **CONTENT-03 floor exceeded** — 4 net-new hook entries on disk (CONTENT-03 required 3). Total hooks: 5 (1 pre-existing + 4 new).
- **Husky-v9 form respected** — all 4 artifact bodies omit the shebang line per the plan's Step 0 policy; `sh -n` syntax-clean on every committed file (verified after prettier passes).
- **Build green** — `pnpm --filter blakepetersen.io build` exits 0; Pagefind indexes 40 pages / 4065 words (up from Plan 04 baseline of 36/3731). All `/install/hooks/<slug>` URLs resolve.
- **Playwright voice-primitives spec stays green** — 3/3 passed in 2.2s, no regen needed (the spec captures `/skills/convex-patterns`; adding to `content/hooks/` does not drift the skill-page baselines, confirming Plan 03 and 04's downstream-consumer prediction).
- **Jest green** — 40 suites / 280 tests passed (unchanged from Plan 04).

## Task Commits

| Commit    | Slug                      | Body words | Type |
| --------- | ------------------------- | ---------- | ---- |
| `716c6d0` | pre-push-validation       | 1254       | feat |
| `a2581e9` | post-merge-dep-sync (v1)  | 1102       | feat |
| `0788208` | post-merge-dep-sync (fix) | 1129       | fix  |
| `7eea0b6` | commit-msg-ai-assist (v1) | 1259       | feat |
| `609087c` | commit-msg-ai-assist (fix)| 1259       | fix  |
| `d3ab9d1` | branch-name-enforcement   | 1245       | feat |

**Plan metadata:** *(see final commit below this SUMMARY)*

## Files Created/Modified

### Created (this plan)

- `apps/blakepetersen.io/content/hooks/pre-push-validation.mdx` — husky-v9 pre-push hook scoping typecheck + lint + tests to changed files; both voice primitives; 4 new-tab anchors
- `apps/blakepetersen.io/content/hooks/pre-push-validation.artifact.md` — working `.husky/pre-push` with upstream-fallback chain and per-tool scoping (merge: replace)
- `apps/blakepetersen.io/content/hooks/post-merge-dep-sync.mdx` — husky-v9 post-merge hook that re-runs pnpm install when the lockfile moves; author-note primitive; 3 new-tab anchors
- `apps/blakepetersen.io/content/hooks/post-merge-dep-sync.artifact.md` — working `.husky/post-merge` using `grep -q` against `git diff-tree ORIG_HEAD..HEAD` (merge: replace)
- `apps/blakepetersen.io/content/hooks/commit-msg-ai-assist.mdx` — husky-v9 commit-msg hook that pipes draft + staged diff into a local AI CLI; both voice primitives; 4 new-tab anchors
- `apps/blakepetersen.io/content/hooks/commit-msg-ai-assist.artifact.md` — working `.husky/commit-msg` with `AI_COMMIT_CMD` env var (default `claude`), `/dev/tty` reattach for the y/e/n prompt, if/elif chain instead of case (prettier-safe) (merge: replace)
- `apps/blakepetersen.io/content/hooks/branch-name-enforcement.mdx` — husky-v9 pre-push hook that rejects non-conventional branch names; decision-rationale primitive; 4 new-tab anchors
- `apps/blakepetersen.io/content/hooks/branch-name-enforcement.artifact.md` — working `.husky/pre-push` with `grep -qE` against anchored regex; helpful failure message with literal rename command (merge: replace)

### Modified

- `apps/blakepetersen.io/content/.artifact-versions.json` — Velite's auto-tracked artifact-hash registry; 4 new slug entries added across the per-hook commits

### Confirmed untouched

- `apps/blakepetersen.io/content/hooks/pre-commit/lint-staged-setup.mdx` — pre-existing v1.0 entry left as-is (Phase 30 cleanup item to upgrade to v1.4 frontmatter shape if Blake wants the lint sweep)
- `apps/blakepetersen.io/content/hooks/husky-lint-staged.artifact/manifest.json` — pre-existing multi-file artifact left as-is

## Downstream-consumer notes (Plan 06 — guides)

Plan 06 (4 guides, NO companion artifacts per D-14) can apply the same Variant 3 prose pattern with three modifications:

1. **No `.artifact.md` sibling** — guides are prose-only by D-14. `requires_artifact: false` in frontmatter (or omit the field entirely; it defaults false). The scaffold's stub `.artifact.md` file should be deleted, not authored.
2. **No `/install/guides/<slug>` links** — that route intentionally 404s (Plan 02 INSTALLABLE_TYPES allowlist excludes `guides`). Prose can still quote illustrative snippets in fenced code blocks, just without the new-tab anchor below each snippet.
3. **Voice primitives still required** — D-11 floor applies to every DX collection regardless of artifact-bearing status. At least one `<AuthorNote>` or `<DecisionRationale>` per entry; both is better.

Otherwise: same flow — `pnpm exec blink scaffold guide <slug> --voice author-note,decision-rationale`, strip the scaffold's dead `artax-ui` imports, rewrite the body to architectural-framing + quoted-snippet shape, commit atomically per entry as `feat(29-06): wr-NN scaffold + author <slug> guide`.

**Carry-forward gotchas:**

- The scaffold puts files at `apps/blakepetersen.io/apps/blakepetersen.io/content/<collection>/<slug>.mdx` (the CLI's working-dir resolution doubles the app path when run from the workspace). Move them to `apps/blakepetersen.io/content/<collection>/` immediately after each scaffold call and `rm -rf` the orphan tree. Plan 04 hit the same; Plan 06 should expect it.
- The scaffold emits dead `import { AuthorNote } from 'artax-ui'` blocks at the top of each MDX. **Strip these** — they're dead code (the components register globally via `mdx-content.tsx`). Plan 04 SUMMARY documented this; Plan 05 inherited it; Plan 06 should too.
- **Prettier on `.md` files mangles bare asterisks into italics.** This bit Plan 05 twice: a `*pnpm-lock.yaml*` case-glob became `_pnpm-lock.yaml_`, and a bare `*)` fallthrough in a case statement got escaped to `\*)`. Neither broke sh -n syntax but both produced silently wrong behavior. **Mitigation for Plan 06: guides don't have shell artifacts, so this risk is N/A — but if any guide's prose includes shell code outside a fenced block, watch the asterisks.**
- Voice frontmatter must match body invocations (LINT-03). Both primitives in frontmatter + body for entries that use both; one primitive in frontmatter + body for entries that only use one. The lint heuristic also flags `## Why ...` H2 headings as suspected DecisionRationale candidates — if a non-decision section happens to start with "Why", rename it to dodge the false-positive (caught and renamed once in this plan: post-merge-dep-sync `## Why Not pre-commit or pre-push` → `## Not the Same Problem as pre-commit or pre-push`).

## Decisions Made

- **Variant 3 pattern over the stale plan-file `<ArtifactBody>` invariant.** Plan 02's SUMMARY explicitly documented this supersession for Plans 03/04/05/06; Plan 05 inherits it for the fourth consecutive plan. Plan-file `key_links.pattern: "ArtifactBody slug=\"hooks/"` is therefore a known-fail for this plan — same as Plans 03 and 04. Phase 30 cleanup item.
- **Husky v9 form (no shebang) per the plan's Step 0 policy.** Verified the repo pins husky `9.1.7`; all 4 artifact bodies start with `# ABOUTME:` comments, not `#!/usr/bin/env sh`. If the repo ever rolls back to husky v8 or earlier, every hook artifact needs a shebang re-added; flagging here for the Phase 30 audit.
- **grep -qE over case-glob in shell artifacts.** Discovered live on wr-02 (post-merge-dep-sync): prettier on the .md file passed over a literal `*pnpm-lock.yaml*` and turned it into `_pnpm-lock.yaml_`, breaking the case match silently. Fixed inline by switching the artifact to `grep -q 'pnpm-lock\.yaml'`. Pre-applied to wr-04 (branch-name-enforcement) as `grep -qE` with anchored regex — never had asterisks for prettier to mangle.
- **if/elif over case-with-`*)` fallthrough in commit-msg hook.** Same lesson, different incarnation. Prettier escaped `*)` to `\*)` — sh-n-clean but only matches a literal asterisk string, so the n/decline branch silently did nothing. Replaced with explicit `if [ "$answer" = "y" ] || [ "$answer" = "Y" ] || ...` chain. Slightly more verbose, immune to formatter slip.
- **AI_COMMIT_CMD as the trust boundary for commit-msg-ai-assist.** Reader picks the local CLI via env var; default is `claude` (lowest install friction for the Claude-using audience), but `ollama run llama3`, `aichat`, `llm` all work. The hook never hard-codes a provider, never bypasses the env var. T-29-05-04 mitigation per the plan's threat model.
- **Pre-push (not pre-commit) for branch-name enforcement.** Documented as a DecisionRationale primitive in the entry body. Pre-commit on a non-conforming branch fires every commit (10-50 times per dev day on a busy branch); pre-push fires once. Same enforcement strength, dramatically less noise.
- **Voice declarations matched to body invocations exactly.** Per the lint heuristic: pre-push-validation declares `voice: [author-note, decision-rationale]` and uses both. post-merge-dep-sync declares `voice: [author-note]` and uses only AuthorNote. commit-msg-ai-assist declares `voice: [author-note, decision-rationale]` and uses both. branch-name-enforcement declares `voice: [decision-rationale]` and uses only DecisionRationale. Zero LINT-03 mismatches at commit time.

## Deviations from Plan

The plan-file's `must_haves.truths` includes `"All 4 invoke <ArtifactBody slug=\"hooks/<slug>\" /> in body per D-15"` — this is **superseded** by the Plan 02 Variant 3 pattern (architectural framing + quoted snippets + new-tab anchors to `/install/hooks/<slug>` + no inline `<ArtifactBody>`). Plan 02's SUMMARY explicitly documented this supersession for Plans 03/04/05/06 in its Downstream-consumer notes; Plans 03 and 04's SUMMARIES logged the same deviation. Treating as **planning-time evolution, not auto-fix deviation** — Plan 02's checkpoint authority drove the shift; the new pattern is documented at Plan 02 and inherited here.

Plan-file `key_links.pattern: "ArtifactBody slug=\"hooks/"` is a **known-fail** for this plan under the new pattern. Phase 30 cleanup item.

### Auto-fixed Issues

**1. [Rule 1 - Bug] Switch post-merge match from case-glob to grep -q**

- **Found during:** Inspection of the wr-02 commit output (the prettier diff in the lint-staged stderr summary)
- **Issue:** The artifact's `case "$changed" in *pnpm-lock.yaml*)` branch was mangled by Prettier (running over `.md` files via lint-staged) into `_pnpm-lock.yaml_` — Markdown italics, not a glob. `sh -n` still passed (`_pnpm-lock.yaml_)` is a valid case pattern, just one that matches the literal string `_pnpm-lock.yaml_`), so the syntax check was a false-positive on correctness. The case branch would have never fired in practice.
- **Fix:** Switched the artifact to `if printf '%s\n' "$changed" | grep -q 'pnpm-lock\.yaml'; then ...`. Updated the MDX prose example to match. Committed as a follow-up fix.
- **Files modified:** `post-merge-dep-sync.artifact.md`, `post-merge-dep-sync.mdx`, `content/.artifact-versions.json`
- **Verification:** `awk '/^---$/{c++; next} c==2' …artifact.md | sh -n /dev/stdin` clean; `velite` clean; `blink lint` clean
- **Committed in:** `0788208`

**2. [Rule 1 - Bug] Replace case fallthrough with if/elif in commit-msg hook**

- **Found during:** Inspection of the wr-03 commit output (similar prettier-italic damage on a `*)` case pattern)
- **Issue:** Same family as the post-merge bug. The artifact had `case "$answer" in y|Y) ...;; e|E) ...;; *) ...;; esac` where `*)` is the fallthrough. Prettier escaped it to `\*)` — `sh -n` clean (matches the literal string `*`), but the n/decline branch never fired. Original message would have stayed in place anyway, so the user-visible outcome was right but for the wrong reason.
- **Fix:** Replaced the case statement entirely with an `if [ "$answer" = "y" ] || ... elif ... fi` chain. No asterisks anywhere a formatter can find them. The decline path is now the implicit fallthrough (no matching branch, no action).
- **Files modified:** `commit-msg-ai-assist.artifact.md`, `content/.artifact-versions.json`
- **Verification:** sh -n clean; build green; pre-emptively avoided in wr-04 by using `grep -qE` from the start
- **Committed in:** `609087c`

**3. [Rule 2 - Missing Critical Functionality] Heading rename to dodge LINT-03 false-positive**

- **Found during:** First `blink lint` pass on post-merge-dep-sync.mdx
- **Issue:** The heading `## Why Not pre-commit or pre-push` matched the LINT-03 heuristic for "this section looks like a decision rationale; add `voice: ['decision-rationale']` to frontmatter." The section was *informational*, not a decision-rationale invocation — adding the frontmatter declaration without a matching `<DecisionRationale>` body invocation would have introduced its own LINT-03 mismatch.
- **Fix:** Renamed the heading to `## Not the Same Problem as pre-commit or pre-push`. Same content, no false-positive trigger.
- **Files modified:** `post-merge-dep-sync.mdx`
- **Verification:** Re-ran `blink lint --files content/hooks/post-merge-dep-sync.mdx` → `✔ No issues found`
- **Committed in:** rolled into the wr-02 fix commit (`0788208`) since it was part of the same recovery pass

**4. [Rule 3 - Blocking] Stripped scaffold-emitted `artax-ui` imports**

- **Found during:** First read of each scaffolded MDX (carry-forward from Plan 04)
- **Issue:** Scaffold emits `import { AuthorNote } from 'artax-ui'` and `import { DecisionRationale } from 'artax-ui'` at the top of every new MDX. These are dead code per Plan 04's analysis (the components register globally via `mdx-content.tsx`'s `mdxComponents`), and no canonical existing entry carries them.
- **Fix:** Omitted the import block entirely when rewriting each scaffold output.
- **Files modified:** All 4 new `.mdx` entries
- **Verification:** `pnpm --filter blakepetersen.io build` exits 0 (Velite + Webpack); voice primitives render in the live page via the global registry path
- **Committed in:** wr-01 through wr-04 (rolled into each entry's commit)

**5. [Rule 3 - Blocking] Relocate scaffold output from `apps/blakepetersen.io/apps/blakepetersen.io/content/hooks/` to `apps/blakepetersen.io/content/hooks/`**

- **Found during:** First scaffold call (pre-push-validation)
- **Issue:** `pnpm exec blink scaffold` resolves its content-root from `process.cwd()` and prepends `apps/blakepetersen.io` — when run from the workspace directory (the executor's working dir), the path doubles to `apps/blakepetersen.io/apps/blakepetersen.io/content/hooks/<slug>.mdx`. Plan 04 hit the same; this is a scaffold-CLI behavior, not Plan 05's bug.
- **Fix:** After each scaffold call, `mv` the two emitted files into the correct location and `rm -rf` the doubled-path tree.
- **Files modified:** None in the final commits (the doubled-path tree never existed in any committed state)
- **Verification:** `git status` clean of the doubled path after each move; `ls apps/blakepetersen.io/content/hooks/<slug>.*` confirms files in the right place
- **Committed in:** N/A (working-directory recovery only, not a code change)

---

**Total deviations:** 5 auto-fixed (2 bugs from prettier-asterisk damage, 1 critical-funcionality heading rename, 2 blocking scaffold-recovery). **Impact on plan:** Significant for fix-forward count (2 of the 6 task commits are explicitly labeled `fix(29-05)` rather than `feat(29-05)`), but contained to a single class of issue (prettier mangling asterisks in shell prose) caught and mitigated mid-plan. The wr-04 artifact (branch-name-enforcement) shipped first-time-clean because the pattern was already established by then.

## Plan deviations / Phase 30 documentation cleanup

The following are downstream-only and should be tracked in Phase 30's docs-cleanup scope:

- **Plan-file `must_haves.truths` invariant `"All 4 invoke <ArtifactBody slug=\"hooks/<slug>\" /> in body per D-15"`** is superseded by the Plan 02 Variant 3 pattern (no inline ArtifactBody). Same supersession applies to the plan-file `key_links.pattern` check. Phase 30 should annotate the plan file as historical or update the truth (fourth consecutive plan with this same downstream item).
- **Scaffold template emits dead `artax-ui` imports.** Already on the Phase 30 list from Plan 04; Plan 05 hit the same and applied the same per-entry strip. The scaffold template should either omit the imports or `mdx-content.tsx` should require per-file imports. Option (a) is smaller.
- **Scaffold CLI doubles the content-root path when run from workspace cwd.** `pnpm exec blink scaffold hook <slug>` from inside `apps/blakepetersen.io/` writes to `apps/blakepetersen.io/apps/blakepetersen.io/content/hooks/<slug>.*`. Plan 04 hit it and worked around; Plan 05 hit it and worked around again. Phase 30 should fix the cwd resolution in the scaffold CLI.
- **Pre-existing `lint-staged-setup.mdx` is v1.0 frontmatter shape.** No `voice:`, `requires_artifact:`, `decisions:` fields. Plan 05 left it untouched. Phase 30 should decide whether to migrate to v1.4 (and pair with `husky-lint-staged.artifact/`) or leave as a historical entry.
- **LINT-03 "Why ..." heuristic false-positive.** The lint rule flags any `## Why ...` heading as a possible DecisionRationale candidate. Plan 05 dodged it by renaming, but the heuristic should probably be tightened — a heading is a decision-rationale candidate only if the body contains decision-shaped prose (e.g., "X over Y", "the reasoning is..."). Phase 30 lint-rule scope.

## Known Stubs

None. All 4 entries ship with real prose (no "TODO" / "placeholder" / "coming soon") and all 4 artifacts ship with executable working shell content. The frontmatter `decisions:` arrays correspond to actual `<DecisionRationale>` body invocations where present. No hardcoded empty arrays flow to UI.

## Threat Flags

None new. All 4 entries are static MDX rendered by Velite into the existing `/hooks/<slug>` route. The companion artifacts are plain-text shell scripts surfaced through the existing `/install/hooks/<slug>` route (Plan 02 deliverable). No new endpoints, no auth surface, no schema changes, no user input paths.

Threat register from the plan frontmatter:

- **T-29-05-01 (Destructive shell in artifact):** Mitigated — every artifact body audited for `rm -rf`, `curl|sh`, and other dangerous patterns. None present. Heaviest operation is `pnpm install` (post-merge), `pnpm exec eslint`/`jest` (pre-push), branch-name regex match (branch-name), and a piped AI call (commit-msg). All explicit, scoped, and auditable.
- **T-29-05-02 (Hook execution privilege):** Accepted by design — readers opt in via `blink apply`; the `# ABOUTME:` two-line comment helps audit before applying.
- **T-29-05-03 (Bad shebang / unportable shell):** Mitigated by inversion — husky v9 invokes hooks via `sh` directly, so the artifacts deliberately *omit* the shebang. All bodies use POSIX-portable constructs (`printf`, `grep`, `case`/`if`, `git diff-tree`, `git symbolic-ref`); no bash-isms.
- **T-29-05-04 (commit-msg AI endpoint spoofing):** Mitigated — `AI_COMMIT_CMD` env var is the configurable trust boundary; no hard-coded provider. Reader controls. Body prose explicitly calls out the privacy consideration for repos with private code.
- **T-29-05-05 (Voice declaration/body mismatch):** Mitigated — `blink lint --files` clean for all 4 entries; voice frontmatter matches body invocations exactly.

## Issues Encountered

- **Prettier ate the asterisks in shell prose, twice.** First incident: `*pnpm-lock.yaml*` (case-glob in post-merge-dep-sync) → `_pnpm-lock.yaml_` (Markdown italics). Second incident: `*)` (case fallthrough in commit-msg-ai-assist) → `\*)` (escaped backslash). Both passed `sh -n` (one matched a literal underscore string, the other matched a literal asterisk string), so the syntax gate didn't catch them — the bugs were semantic, not syntactic. **Mitigation locked in:** never use case-glob with bare asterisks in shell artifacts; prefer `grep -qE` with anchored regex inside single-quoted strings, or `if/elif` chains. Pre-applied to wr-04 (branch-name-enforcement) — that artifact shipped first-time-clean.
- **`pnpm lint:content` exits 1 with the pre-existing 24 errors / 5 warnings.** Same baseline as Plans 02/03/04. Errors all in `content/posts/*` (Phase 30 scope); warnings include the pre-existing tmux-poweruser orphan-artifact advisory and typescript-config orphan. **Zero new errors or warnings from Plan 05.**
- **Velite Jest console message:** `fatal: /var/.../velite-prepare-test-c0tjwj/multi.json' is outside repository`. Pre-existing test-setup quirk, not Plan 05's. All 40 suites / 280 tests still pass; the message is from a velite-prepare test that runs git commands in a tmp dir. Same message in Plan 04's run. Not in scope.

## Next Phase Readiness

**Plan 06 (Wave 3 — 4 guides) is unblocked.** Required artifacts on disk:

- Install route at `/install/[type]/[slug]/` still ready, but guides intentionally 404 from INSTALLABLE_TYPES (no companion artifacts for guides per D-14). Plan 06 should not add `/install/guides/<slug>` references anywhere.
- Authoring pattern documented in Downstream-consumer notes above — Plan 06 executor has explicit per-collection guidance including the no-artifact + no-install-link variant of the Variant 3 pattern.
- Voice-primitives Playwright baseline is green at current state; Plan 06 will add to `content/guides/`, which is not the route the baseline captures (`/skills/convex-patterns`), so the spec should stay green through Plan 07.
- 5 total hooks on disk (1 pre-existing + 4 new); CONTENT-03 satisfied; Plan 06 builds the guides collection independently.

**Phase 30 carry-forward items:**

- Update Plan 05's `must_haves.truths` invariant for `<ArtifactBody>` or annotate as superseded (fourth consecutive plan)
- Update scaffold template to omit dead `artax-ui` imports (Plan 04 + 05)
- Fix scaffold CLI cwd resolution so it doesn't double the content-root path (Plan 04 + 05)
- Migrate pre-existing `lint-staged-setup.mdx` to v1.4 frontmatter shape if Blake wants the consistency sweep
- Tighten LINT-03 heuristic so `## Why ...` headings aren't auto-flagged as DecisionRationale candidates
- Audit prettier behavior on `.md` files (specifically: asterisk handling outside fenced code blocks) and either configure prettier to skip `.artifact.md` files or document the asterisk-avoidance pattern in the authoring contract

## Self-Check: PASSED

Verifications performed before writing this SUMMARY:

- `git log --oneline | grep "29-05"` → 6 commits present (`716c6d0`, `a2581e9`, `0788208`, `7eea0b6`, `609087c`, `d3ab9d1`)
- `[ -f apps/blakepetersen.io/content/hooks/pre-push-validation.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/hooks/pre-push-validation.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/content/hooks/post-merge-dep-sync.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/hooks/post-merge-dep-sync.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/content/hooks/commit-msg-ai-assist.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/hooks/commit-msg-ai-assist.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/content/hooks/branch-name-enforcement.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/hooks/branch-name-enforcement.artifact.md ]` → FOUND
- `find apps/blakepetersen.io/content/hooks -name "*.mdx" | wc -l` → 5 (1 pre-existing + 4 net-new)
- All 4 bodies in 500-1500 word band: 1254 / 1129 / 1259 / 1245
- All 4 entries contain at least one matching voice primitive per their frontmatter `voice` field (verified by grep)
- All 4 entries contain new-tab anchors to `/install/hooks/<slug>` (verified by grep `target="_blank"`)
- No entry contains `<ArtifactBody` (verified — Variant 3 pattern, no inline artifact)
- All 4 artifact bodies parse `sh -n` clean (verified post-prettier on each committed file)
- All 4 artifact bodies omit the shebang (husky v9 form; verified by grep)
- All 4 artifact bodies include the two-line `# ABOUTME:` prose comment (verified by grep)
- `pnpm --filter blakepetersen.io velite` → exit 0
- `pnpm --filter blakepetersen.io build` → exit 0 (Pagefind indexed 40 pages, 4065 words — up from Plan 04 baseline of 36/3731)
- `pnpm --filter blakepetersen.io test` (Jest) → 40 suites / 280 tests passed
- `pnpm --filter blakepetersen.io lint:content` → 24 errors / 5 warnings — **delta zero vs Wave 0 baseline** (errors all in `content/posts/*` per Phase 30 scope; warnings include pre-existing tmux-poweruser and typescript-config orphans)
- `pnpm --filter blakepetersen.io exec blink lint --files <4 new hooks>` → ✔ No issues found (lint clean specifically on the new entries after the LINT-03 heading rename)
- `pnpm exec playwright test tests/visual` → 3/3 passed in 2.2s (no regen needed; voice-primitives baseline stays green because Plan 05 adds to `content/hooks/`, not `content/skills/`)

---
*Phase: 29-content-authoring-greenfield-ports*
*Plan: 05*
*Completed: 2026-05-13*
