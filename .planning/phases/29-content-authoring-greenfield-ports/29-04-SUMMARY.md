---
phase: 29-content-authoring-greenfield-ports
plan: 04
subsystem: content
tags: [configs-batch, greenfield, tmux-collision-resolved, variant-3-pattern]

# Dependency graph
requires:
  - phase: 29-content-authoring-greenfield-ports
    plan: 02
    provides: "Variant 3 install-context route at /install/[type]/[slug]; authoring pattern (architectural framing + quoted snippets + new-tab install links + no inline ArtifactBody)"
  - phase: 29-content-authoring-greenfield-ports
    plan: 03
    provides: "Downstream-consumer notes confirming /install/configs/<slug> works for Plan 04; LINT-03 awareness; word-count includes code fences"
provides:
  - "Seven net-new v1.4-compliant config entries: typescript-strict, commitlint, turborepo-pipeline, zed-editor, tmux-popup-workflows, ghostty-terminal, obsidian-vault"
  - "Seven companion artifacts with real, working content (D-13 — tsconfig.base.json, commitlint.config.js, turbo.json, Zed settings.json, popups.conf, Ghostty config, Obsidian vault config)"
  - "Tmux slug collision resolved: new entry shipped as `tmux-popup-workflows` (distinct angle), pre-existing `tmux-poweruser.mdx` untouched"
  - "13 total config entries on disk — CONTENT-02 floor (5 required) exceeded by D-02 expansion to 7"
affects: [29-05, 29-06, 30]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Variant 3 pattern applied to seven configs: architectural framing → quoted snippets with title= → new-tab anchors to /install/configs/<slug> → no inline ArtifactBody → at least one voice primitive matching frontmatter voice"
    - "Single-file artifact shape uniformly (.artifact.md, not .artifact/ directory) — all 7 configs are config files at well-known destinations (tsconfig.base.json, commitlint.config.js, turbo.json, ~/.config/{zed,ghostty,tmux}/, ~/Obsidian/.../.obsidian/app.json)"
    - "Cross-collection cross-references via `related:` frontmatter (typescript-strict → eslint-flat-config; tmux-popup-workflows → tmux-poweruser; ghostty-terminal → tmux-poweruser + tmux-popup-workflows; obsidian-vault → zed-editor)"

key-files:
  created:
    - "apps/blakepetersen.io/content/configs/typescript-strict.mdx"
    - "apps/blakepetersen.io/content/configs/typescript-strict.artifact.md"
    - "apps/blakepetersen.io/content/configs/commitlint.mdx"
    - "apps/blakepetersen.io/content/configs/commitlint.artifact.md"
    - "apps/blakepetersen.io/content/configs/turborepo-pipeline.mdx"
    - "apps/blakepetersen.io/content/configs/turborepo-pipeline.artifact.md"
    - "apps/blakepetersen.io/content/configs/zed-editor.mdx"
    - "apps/blakepetersen.io/content/configs/zed-editor.artifact.md"
    - "apps/blakepetersen.io/content/configs/tmux-popup-workflows.mdx"
    - "apps/blakepetersen.io/content/configs/tmux-popup-workflows.artifact.md"
    - "apps/blakepetersen.io/content/configs/ghostty-terminal.mdx"
    - "apps/blakepetersen.io/content/configs/ghostty-terminal.artifact.md"
    - "apps/blakepetersen.io/content/configs/obsidian-vault.mdx"
    - "apps/blakepetersen.io/content/configs/obsidian-vault.artifact.md"
  modified: []

key-decisions:
  - "29-04: Apply Plan 02 Variant 3 pattern verbatim to all 7 configs — supersedes the plan-file `<ArtifactBody slug=\"configs/<slug>\" />` truth (same supersession as 29-02 and 29-03; logged for Phase 30 doc-cleanup)"
  - "29-04: tmux collision resolved by shipping new entry as `tmux-popup-workflows` covering popup-driven workflows; pre-existing `tmux-poweruser.mdx` left untouched (verified 0 diff lines)"
  - "29-04: Every config uses both voice primitives (AuthorNote + DecisionRationale) in body matching frontmatter voice: [author-note, decision-rationale] — the source material had enough decision-shaped content that the second primitive landed naturally"
  - "29-04: Single-file `.artifact.md` for all 7 (no multi-file artifacts) — each config targets one well-known file at its standard destination, the right shape per RESEARCH §Pattern 4"
  - "29-04: Five entries use merge: replace, one (tmux-popup-workflows) uses merge: section as a fragment sourced from main tmux.conf — matches eslint-flat-config precedent for additive configs"

patterns-established:
  - "Bulk config-scaffold flow: `pnpm exec blink scaffold config <slug> --voice author-note,decision-rationale` produces v1.3-default stubs (draft: true, empty applies_to, TODO destinations) — rewrite the MDX and artifact entirely rather than incrementally fix the stub"
  - "Cross-collection `related:` chains: configs cross-reference each other via path-shaped slugs (configs/<slug>) in `related:` frontmatter — readers hop between related configs without manual navigation"

requirements-completed:
  - CONTENT-02

# Metrics
duration: "~55 min wall (2026-05-13 first scaffold to final commit)"
completed: 2026-05-13
---

# Phase 29 Plan 04: Wave 3 Configs Batch Summary

**Seven v1.4-compliant config entries (`typescript-strict`, `commitlint`, `turborepo-pipeline`, `zed-editor`, `tmux-popup-workflows`, `ghostty-terminal`, `obsidian-vault`) ship in seven atomic commits with real working companion artifacts, the Plan 02 Variant 3 authoring pattern applied verbatim, the tmux slug collision resolved by distinct-angle slug, and the CONTENT-02 floor exceeded per D-02 expansion to 7.**

## Performance

- **Duration:** ~55 min wall on 2026-05-13 (first scaffold to final commit, pre-metadata)
- **Tasks:** 2 plan tasks combined into 7 atomic per-config commits + 1 metadata commit (this SUMMARY)
- **Files created:** 14 (7 .mdx entries + 7 .artifact.md companions)
- **Files modified:** 0 (pre-existing `tmux-poweruser.mdx` and `tmux-poweruser.artifact.md` untouched — git diff confirmed 0 lines changed)

## Accomplishments

- **typescript-strict shipped** at `apps/blakepetersen.io/content/configs/typescript-strict.mdx` — 1122-word reference for a strict pnpm/Turbo monorepo tsconfig. Both voice primitives invoked (AuthorNote on `skipLibCheck`, DecisionRationale on `exactOptionalPropertyTypes`). Artifact ships a complete `tsconfig.base.json` with `strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess`, `module: esnext`, `moduleResolution: bundler`.
- **commitlint shipped** at `…/configs/commitlint.mdx` — 929-word entry on Conventional Commits enforcement via Husky. AuthorNote on `--no-verify` etiquette, DecisionRationale on `scope-enum`. Artifact is a `commitlint.config.js` with workspace-scoped `scope-enum`, `subject-case` rules, and a body-line-length warning.
- **turborepo-pipeline shipped** at `…/configs/turborepo-pipeline.mdx` — 1138-word pipeline reference. AuthorNote on the "0.8s clean build" surprise, DecisionRationale on excluding `.next/cache/`. Artifact is a working `turbo.json` for a pnpm + Next.js monorepo with `build`/`test`/`lint`/`typecheck`/`dev` tasks.
- **zed-editor shipped** at `…/configs/zed-editor.mdx` — 960-word config for Zed with Vim mode + Assistant panel + per-language Prettier wiring. AuthorNote on the VS Code → Zed Copilot desync, DecisionRationale on Vim mode + IDE binding cohabitation. Artifact is a full `settings.json` with Catppuccin-free One themes, JetBrains Mono, Anthropic assistant config.
- **tmux-popup-workflows shipped** at `…/configs/tmux-popup-workflows.mdx` — 1221-word popup-binding layer. AuthorNote on the commit-cadence side effect, DecisionRationale on popup-vs-status-bar pickers. Artifact is a `popups.conf` fragment (merge: section, sourced from main `tmux.conf`) with 10 bindings: lazygit, gh dash, gh issues, scratch shell, command runner, session switcher, new session, ripgrep search, notes, help.
- **ghostty-terminal shipped** at `…/configs/ghostty-terminal.mdx` — 1036-word Ghostty config for a tmux-heavy macOS workflow. AuthorNote on the `TERM` value gotcha (week of italics-as-inverse-video), DecisionRationale on built-in vs custom theme. Artifact is a `~/.config/ghostty/config` with Catppuccin Mocha, JetBrains Mono, tmux-friendly keybinding unbinds.
- **obsidian-vault shipped** at `…/configs/obsidian-vault.mdx` — 1223-word Monodex-pattern vault setup. AuthorNote on callout-discipline as AI-port signal, DecisionRationale on Markdown links vs wikilinks. Artifact is the full `.obsidian/` config bundle (`app.json`, `core-plugins.json`, `community-plugins.json`, `daily-notes.json`, Templater daily template, no-fluff CSS snippet, `.gitignore`).
- **CONTENT-02 floor exceeded** — 7 net-new config entries on disk (CONTENT-02 required 5). Total configs: 13 (6 pre-existing + 7 new).
- **tmux slug collision avoided** — `tmux-popup-workflows.mdx` is a distinct entry covering popup workflows; pre-existing `tmux-poweruser.mdx` is byte-identical to its pre-Plan-04 state.
- **Build green** — `pnpm --filter blakepetersen.io build` exits 0; Pagefind indexes 36 pages / 3731 words (up from Plan 03 baseline of 29/2996). All `/install/configs/<slug>` URLs resolve.
- **Playwright voice-primitives spec stays green** — 3/3 passed in 2.3s, no regen needed (Plan 03's downstream-consumer note correctly predicted that adding entries to `content/configs/` would not drift the `/skills/convex-patterns` full-page baselines).
- **Jest green** — 40 suites / 280 tests passed (unchanged from Plan 03).

## Task Commits

| Commit  | Slug                  | Body words | Type |
| ------- | --------------------- | ---------- | ---- |
| `8c184f2` | typescript-strict     | 1122       | feat |
| `07a1cf6` | commitlint            | 929        | feat |
| `e54e194` | turborepo-pipeline    | 1138       | feat |
| `de7f5a9` | zed-editor            | 960        | feat |
| `125ca4d` | tmux-popup-workflows  | 1221       | feat |
| `7f0c62b` | ghostty-terminal      | 1036       | feat |
| `6562d1c` | obsidian-vault        | 1223       | feat |

**Plan metadata:** *(see final commit below this SUMMARY)*

## Files Created/Modified

### Created (this plan)

- `apps/blakepetersen.io/content/configs/typescript-strict.mdx` — strict tsconfig base for pnpm/Turbo monorepo; both voice primitives; 2 new-tab anchors
- `apps/blakepetersen.io/content/configs/typescript-strict.artifact.md` — working tsconfig.base.json (merge: replace)
- `apps/blakepetersen.io/content/configs/commitlint.mdx` — Conventional Commits + Husky; both voice primitives; 2 new-tab anchors
- `apps/blakepetersen.io/content/configs/commitlint.artifact.md` — commitlint.config.js (merge: replace; @commitlint/cli@^19.6.0, @commitlint/config-conventional@^19.6.0, husky@^9.1.7)
- `apps/blakepetersen.io/content/configs/turborepo-pipeline.mdx` — turbo.json pipeline guide; both voice primitives; 2 new-tab anchors
- `apps/blakepetersen.io/content/configs/turborepo-pipeline.artifact.md` — working turbo.json (merge: replace; turbo@^2.5.0)
- `apps/blakepetersen.io/content/configs/zed-editor.mdx` — Zed settings + Vim + Assistant; both voice primitives; 2 new-tab anchors
- `apps/blakepetersen.io/content/configs/zed-editor.artifact.md` — full ~/.config/zed/settings.json (merge: replace)
- `apps/blakepetersen.io/content/configs/tmux-popup-workflows.mdx` — popup-driven workflows; distinct from tmux-poweruser; both voice primitives; 2 new-tab anchors
- `apps/blakepetersen.io/content/configs/tmux-popup-workflows.artifact.md` — popups.conf fragment (merge: section)
- `apps/blakepetersen.io/content/configs/ghostty-terminal.mdx` — Ghostty config for tmux+Vim workflow; both voice primitives; 2 new-tab anchors
- `apps/blakepetersen.io/content/configs/ghostty-terminal.artifact.md` — ~/.config/ghostty/config (merge: replace)
- `apps/blakepetersen.io/content/configs/obsidian-vault.mdx` — Monodex-pattern vault setup; both voice primitives; 2 new-tab anchors
- `apps/blakepetersen.io/content/configs/obsidian-vault.artifact.md` — .obsidian/app.json + multi-file content for plugins/templates/CSS (merge: replace)

### Modified

- (none)

### Confirmed untouched

- `apps/blakepetersen.io/content/configs/tmux-poweruser.mdx` — git diff 0 lines from pre-Plan-04 state
- `apps/blakepetersen.io/content/configs/tmux-poweruser.artifact.md` — git diff 0 lines from pre-Plan-04 state

## Downstream-consumer notes (Plan 05 — hooks)

Plan 05 (4 hooks: `claude-code-thinking-budget`, `claude-code-spinner`, `claude-code-completion-sound`, `claude-code-stop-hook`) can apply the same flow:

1. `pnpm exec blink scaffold hook <slug> --voice author-note,decision-rationale` per slug
2. Strip the scaffold's `import { AuthorNote } from 'artax-ui'` block at the top of the MDX — `artax-ui` registers these globally via `mdxComponents` in `apps/blakepetersen.io/src/components/mdx-content.tsx:8`. The scaffold-emitted imports cause no visible problem but are dead code.
3. Author the MDX to the Plan 02 Variant 3 pattern: architectural framing → quoted snippets with `title=` → new-tab anchors to `/install/hooks/<slug>` → at least one voice primitive matching frontmatter `voice` → no inline `<ArtifactBody>`
4. Author the companion `.artifact.md` with real working content (D-13)
5. Verify per entry: `pnpm --filter blakepetersen.io velite` clean + `pnpm --filter blakepetersen.io exec blink lint --files content/hooks/<slug>.mdx` clean + body word count 500-1500
6. Commit each entry as its own `feat(29-05): wr-NN scaffold + author <slug> hook + artifact` atomic commit

**Carry-forward gotchas:**

- The scaffold emits `import { AuthorNote } from 'artax-ui'` / `import { DecisionRationale } from 'artax-ui'` at the top of every new MDX file. **Strip these** — `artax-ui`'s `mdxComponents` are registered globally by `mdx-content.tsx`, the scaffold imports are dead code, and existing canonical entries (`convex-patterns.mdx`, all 6 pre-existing configs) do not have them.
- Hooks live at `~/.claude/hooks/<slug>.sh` (or wherever Claude Code's hook config points). Destination paths in artifacts should match the user's expected hook directory.
- Voice frontmatter MUST match body invocations (LINT-03). Both primitives in frontmatter + body for every config in this plan — Plan 05 can follow the same shape.
- Plan 05's `/install/hooks/<slug>` URLs work without infra changes — the parametric install route from Plan 02 already handles `hooks`.
- `tmux-poweruser.artifact.md` has a pre-existing lint warning (`requires_artifact: false` on sibling) that's part of the 5 lint warnings in Wave 0 baseline. Plan 04 did not modify it; the warning persists at baseline.

## Decisions Made

- **Variant 3 pattern over the stale plan-file `<ArtifactBody>` invariant.** Plan 02's SUMMARY explicitly documented this supersession for Plans 03/04/05/06; Plan 04 inherits it. Plan-file `key_links.pattern: "ArtifactBody slug=\"configs/"` is therefore a known-fail for this plan — same as Plan 03's `key_links` against `skills/`. Phase 30 cleanup item.
- **Both voice primitives in every config, not "at least one."** D-11 requires one; all 7 entries shipped with both because the source material had genuine decision-shaped content. Same outcome as Plan 03.
- **Strip scaffold's `import { AuthorNote }` block.** The scaffold templates emit `import { AuthorNote } from 'artax-ui'` and `import { DecisionRationale } from 'artax-ui'` at the top of every MDX file. `artax-ui` registers these via `mdxComponents` in `apps/blakepetersen.io/src/components/mdx-content.tsx:8`, so the imports are dead code. Stripping keeps the file shape matching canonical entries (convex-patterns, eslint-flat-config, tmux-poweruser — none have these imports).
- **Single-file `.artifact.md` for all 7 configs.** Each config targets one well-known file (tsconfig.base.json, commitlint.config.js, turbo.json, settings.json, popups.conf, ghostty config, .obsidian/app.json). Multi-file shape didn't fit any of them; the obsidian-vault artifact body discusses multiple config files inside its single `.artifact.md` document.
- **`merge: section` for tmux-popup-workflows; `merge: replace` for the other 6.** The popup workflows are an additive layer on top of an existing tmux config — `merge: section` matches the eslint-flat-config precedent for additive configs. Everything else is a complete file at a fresh destination.
- **No `decisions:` array entries on commitlint, zed-editor, tmux-popup-workflows, ghostty-terminal, obsidian-vault.** Each of those entries has exactly one `decisions:` row in frontmatter — the single highest-value decision for the entry. The plan didn't require multiple; one matches the natural shape and avoids manufacturing a second.

## Deviations from Plan

The plan-file's `must_haves.truths` includes `"All 7 invoke <ArtifactBody slug=\"configs/<slug>\" /> for the artifact body (D-15 / RESEARCH §Pattern 2)"` — this is **superseded** by the Plan 02 Variant 3 pattern (architectural framing + quoted snippets + new-tab anchors to `/install/configs/<slug>` + no inline `<ArtifactBody>`). Plan 02's SUMMARY explicitly documented this supersession for Plans 03/04/05/06 in its Downstream-consumer notes; Plan 03's SUMMARY logged the same deviation. Treating as **planning-time evolution, not auto-fix deviation** — Plan 02's checkpoint authority drove the shift; the new pattern is documented at Plan 02 and inherited here.

Plan-file `key_links.pattern: "ArtifactBody slug=\"configs/"` is a **known-fail** for this plan under the new pattern. Phase 30 cleanup item (same as Plan 03's `key_links` against `skills/`).

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Stripped scaffold-emitted `artax-ui` imports**

- **Found during:** Read of the first scaffold output (`typescript-strict.mdx`)
- **Issue:** Scaffold emitted `import { AuthorNote } from 'artax-ui'` and `import { DecisionRationale } from 'artax-ui'` at the top of every new MDX. These are dead code — `artax-ui` registers both components globally via `mdxComponents` in `apps/blakepetersen.io/src/components/mdx-content.tsx:8`, and no canonical existing entry (convex-patterns.mdx, eslint-flat-config.mdx, tmux-poweruser.mdx) carries these imports.
- **Fix:** When rewriting each scaffold output, omit the import block entirely. The MDX renders both primitives correctly via the global registry.
- **Files modified:** All 7 new `.mdx` entries
- **Verification:** `pnpm --filter blakepetersen.io build` exits 0 (Velite + Webpack); voice primitives render in the live page (verified by passing Playwright voice-primitives spec against /skills/convex-patterns which uses the same registry path)
- **Committed in:** wr-01 through wr-07 (rolled into each entry's commit)

---

**Total deviations:** 1 auto-fixed (blocking — dead-code import stub from scaffold). **Impact on plan:** Minimal; the imports would not have caused a runtime issue but would have created drift from the canonical entry shape and forced Phase 30 to clean them up. Fixing inline keeps every Plan 04 entry shape-identical to the existing canonical entries.

## Plan deviations / Phase 30 documentation cleanup

The following are downstream-only and should be tracked in Phase 30's docs-cleanup scope:

- **Plan-file `must_haves.truths` invariant `"All 7 invoke <ArtifactBody slug=\"configs/<slug>\" />"`** is superseded by the Plan 02 Variant 3 pattern (no inline ArtifactBody). Same supersession applies to the plan-file `key_links.pattern` check. Phase 30 should annotate the plan file as historical or update the truth.
- **Scaffold template emits dead `artax-ui` imports.** `packages/blink-cli/src/scaffold/templates.ts` (and/or `generator.ts`) emits `import { AuthorNote } from 'artax-ui'` blocks at the top of every MDX it generates. These are dead code — `artax-ui`'s `mdxComponents` are registered globally in `apps/blakepetersen.io/src/components/mdx-content.tsx:8`. Phase 30 should either (a) update the scaffold to omit the imports, or (b) update `mdx-content.tsx` to not register globally and require per-file imports. Option (a) is the smaller and more consistent change; canonical entries don't use the imports.
- **Pre-existing `tmux-poweruser.artifact.md` lint warning.** Sibling `.mdx` has `requires_artifact: false` (or missing) while the artifact exists. Pre-Plan-04 state; not addressed in this plan. Phase 30 should decide whether to flip the frontmatter or remove the orphan declaration.
- **Pre-existing `typescript-config.artifact.md` orphan.** An orphan artifact with no sibling `.mdx`. Pre-Plan-04 (likely a leftover from an aborted scaffold). Phase 30 should delete or pair it. The new `typescript-strict` entry is a separate slug and does not conflict.

## Known Stubs

None. All 7 entries ship with real prose (no "TODO" / "placeholder" / "coming soon") and all 7 artifacts ship with executable/working content. The frontmatter `decisions:` arrays correspond to actual `<DecisionRationale>` invocations in body where present. No hardcoded empty arrays flow to UI.

## Threat Flags

None new. All 7 entries are static MDX rendered by Velite into the existing `/configs/<slug>` route. The companion artifacts are plain-text config files surfaced through the existing `/install/configs/<slug>` route (Plan 02 deliverable). No new endpoints, no auth surface, no schema changes, no user input paths.

Threat register from the plan frontmatter:

- **T-29-04-01 (Slug collision):** Mitigated — tmux entry shipped as `tmux-popup-workflows`; SCHEMA-03 build-time uniqueness check passed (build green).
- **T-29-04-02 (Destination overwrite):** Accepted as designed — readers opt in via `blink apply`; `merge: section` used for tmux-popup-workflows (additive layer); `merge: replace` for the rest (clean destinations on standard config paths).
- **T-29-04-03 (Vulnerable devDep pin):** Mitigated — `@commitlint/cli@^19.6.0`, `@commitlint/config-conventional@^19.6.0`, `husky@^9.1.7`, `typescript@^5.7.0`, `turbo@^2.5.0`. Versions are current stable; no advisories.
- **T-29-04-04 (Voice declaration/body mismatch):** Mitigated — `blink lint --files` clean for all 7 entries; both primitives present in body matching `voice: [author-note, decision-rationale]` in frontmatter.
- **T-29-04-05 (tmux entry overlap):** Mitigated — tmux-popup-workflows covers popup workflows only; tmux-poweruser covers the full status-bar/theme/plugin/session-persistence surface. Verified by reading tmux-poweruser end-to-end before authoring tmux-popup-workflows. Pre-existing file is byte-identical to its pre-Plan-04 state (`git diff HEAD apps/blakepetersen.io/content/configs/tmux-poweruser.{mdx,artifact.md}` returns 0 lines).

## Issues Encountered

- **Scaffold's dead `artax-ui` imports.** Caught on the first scaffold output; stripped consistently across all 7 entries. Logged as Phase 30 cleanup item for the scaffold template itself.
- **Prettier reformatting on commit.** Lint-staged ran Prettier against each `.artifact.md` and removed the indentation inside JSON code (since the body is bare JSON, not a fenced block). The reformatted files still parse correctly as JSON when extracted — the indent loss is cosmetic. Verified by running `velite` after each commit (always clean).
- **`pnpm lint:content` exits 1 with the pre-existing 24 errors / 5 warnings.** Same baseline as Plan 02 and Plan 03 reported. Errors all in `content/posts/*` (Phase 30 scope); warnings include the pre-existing tmux-poweruser orphan-artifact advisory and typescript-config orphan. **Zero new errors or warnings from Plan 04.**

## Next Phase Readiness

**Plan 05 (Wave 3 — 4 hooks: `claude-code-thinking-budget`, `claude-code-spinner`, `claude-code-completion-sound`, `claude-code-stop-hook`) is unblocked.** Required artifacts on disk:

- Install route at `/install/[type]/[slug]/` ready to receive hook slugs — Plan 05's entries link to `/install/hooks/<slug>` without infra changes
- Authoring pattern documented in Downstream-consumer notes above — Plan 05 executor has explicit per-collection guidance including the scaffold-import strip step
- Voice-primitives Playwright baseline is green at current state; Plan 05 won't add to `content/skills/` (the route the baseline captures), so the spec should stay green through Plan 06; Plan 07 verifier should re-run as a final guard
- 13 total configs on disk (6 pre-existing + 7 new); CONTENT-02 satisfied; Plan 05 builds on the configs collection separately by adding to `content/hooks/`

**Plan 06 (guides ×4) is unblocked** — guides don't produce companion artifacts (`/install/guides/<slug>` intentionally 404s per D-14); pattern still applies for the prose.

**Phase 30 carry-forward items:**

- Update Plan 04's `must_haves.truths` invariant for `<ArtifactBody>` or annotate as superseded
- Update scaffold template to omit dead `artax-ui` imports
- Resolve pre-existing `tmux-poweruser.artifact.md` / `typescript-config.artifact.md` lint warnings
- Editorial pass on the 7 new entries — Blake's 24h re-read per PITFALLS.md #6

## Self-Check: PASSED

Verifications performed before writing this SUMMARY:

- `git log --oneline | grep "feat(29-04)"` → 7 commits present (`8c184f2`, `07a1cf6`, `e54e194`, `de7f5a9`, `125ca4d`, `7f0c62b`, `6562d1c`)
- `[ -f apps/blakepetersen.io/content/configs/typescript-strict.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/typescript-strict.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/commitlint.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/commitlint.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/turborepo-pipeline.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/turborepo-pipeline.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/zed-editor.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/zed-editor.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/tmux-popup-workflows.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/tmux-popup-workflows.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/ghostty-terminal.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/ghostty-terminal.artifact.md ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/obsidian-vault.mdx ]` → FOUND
- `[ -f apps/blakepetersen.io/content/configs/obsidian-vault.artifact.md ]` → FOUND
- `find apps/blakepetersen.io/content/configs -name "*.mdx" | wc -l` → 13 (6 pre-existing + 7 net-new)
- All 7 bodies in 500-1500 word band: 1122 / 929 / 1138 / 960 / 1221 / 1036 / 1223
- All 7 entries contain at least one `<AuthorNote>` AND at least one `<DecisionRationale>` (verified by grep)
- All 7 entries contain new-tab anchors to `/install/configs/<slug>` (verified by grep `target="_blank"`)
- No entry contains `<ArtifactBody` (verified — Variant 3 pattern, no inline artifact)
- `git diff HEAD apps/blakepetersen.io/content/configs/tmux-poweruser.mdx apps/blakepetersen.io/content/configs/tmux-poweruser.artifact.md | wc -l` → 0 (pre-existing tmux entry untouched)
- `pnpm --filter blakepetersen.io velite` → exit 0
- `pnpm --filter blakepetersen.io build` → exit 0 (Pagefind indexed 36 pages, 3731 words — up from Plan 03 baseline of 29/2996)
- `pnpm --filter blakepetersen.io test` (Jest) → 40 suites / 280 tests passed
- `pnpm --filter blakepetersen.io lint:content` → 24 errors / 5 warnings — **delta zero vs Wave 0 baseline** (errors all in `content/posts/*` per Phase 30 scope; warnings include pre-existing tmux-poweruser and typescript-config orphans)
- `pnpm --filter blakepetersen.io exec blink lint --files <7 new configs>` → ✔ No issues found (lint clean specifically on the new entries)
- `pnpm exec playwright test tests/visual` → 3/3 passed in 2.3s (no regen needed; voice-primitives baseline stays green because Plan 04 adds to `content/configs/`, not `content/skills/`)

---
*Phase: 29-content-authoring-greenfield-ports*
*Plan: 04*
*Completed: 2026-05-13*
