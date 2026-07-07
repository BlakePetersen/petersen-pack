# Monodex Shortlist — Phase 29 Skill Ports

Source vault: ~/Monodex (D-04)
Total candidate .md files surveyed: 135 (excluding `.obsidian/`, `Templates/`, `Attachments/`, and any `node_modules/` under `Projects/figment`)

## Selection rule

Entry #1 = Plan 02 torture test (D-06). MUST contain BOTH `[!note]`/`[!tip]` AND `[!warning]`/`[!important]` callouts so the port auto-injects both AuthorNote and DecisionRationale (per RESEARCH §Pattern 3 + Open Question 1).

Entries #2–5 = Plan 03 ports. Need at least one callout each so D-11 is satisfied without manual voice-primitive surgery.

## ⚠️ BLOCKER: No notes contain Obsidian callouts

A full vault scan (`grep -rE '^>\s*\[!\w+\]' --include="*.md"` excluding `.obsidian`, `Templates`, `Attachments`, `node_modules`) returned **zero matches**. The vault uses standard Markdown with YAML frontmatter and `##` headings — no `> [!note]` / `> [!tip]` / `> [!warning]` / `> [!important]` callouts anywhere in user-authored content.

**Implication for Plan 02 torture test:** the `blink port stage` callout-mapping pass will inject NEITHER `<AuthorNote>` NOR `<DecisionRationale>`. To satisfy D-06 (both primitives invoked together), Blake has two options at the Task 3 checkpoint:

- **Option A:** Pick a candidate, then add at least one `> [!note]` (or `> [!tip]`) AND one `> [!warning]` (or `> [!important]`) callout to the source `.md` in `~/Monodex` BEFORE running `blink port stage`. Lowest risk — auto-inject still works.
- **Option B:** Pick a candidate, run the port unmodified, then manually author `<AuthorNote>` AND `<DecisionRationale>` invocations during Plan 02 prose pass. Rule-2-style additive authoring; explicitly authorize this in the checkpoint resume signal.

The candidates below are ranked by **skill-shape** (reusable, opinionated, applicable knowledge vs project-specific implementation logs) since callout-density ranking is non-discriminating (all zeros).

## Candidates (ranked by skill-shape + reusability)

| #   | Total callouts | note+tip / warn+important | Path                                                              | Proposed slug                  | Suitable for torture test?                  |
| --- | -------------- | ------------------------- | ----------------------------------------------------------------- | ------------------------------ | ------------------------------------------- |
| 1   | 0              | 0/0                       | ~/Monodex/Projects/wym/2026-02-18-convex-patterns-reference.md    | `convex-patterns`              | NO callouts — needs Option A or B           |
| 2   | 0              | 0/0                       | ~/Monodex/Projects/luna-n-b-link/2026-03-29-stack-patterns-reference.md | `nextjs-stack-patterns`   | NO callouts — needs Option A or B           |
| 3   | 0              | 0/0                       | ~/Monodex/Projects/blakepetersen/2026-04-04-tmux-poweruser-setup.md | `tmux-poweruser-setup` ⚠     | NO callouts; SLUG COLLIDES with existing config — pick distinct slug if used |
| 4   | 0              | 0/0                       | ~/Monodex/Projects/blakepetersen/2026-03-18-new-macbook-setup.md  | `macbook-dev-setup`            | NO callouts — needs Option A or B           |
| 5   | 0              | 0/0                       | ~/Monodex/Projects/blakepetersen/2026-04-24-tmux-ghostty-webdev-tuning.md | `terminal-webdev-tuning` | NO callouts — needs Option A or B           |
| 6   | 0              | 0/0                       | ~/Monodex/Projects/blakepetersen/2026-03-09-pencil-design-system.md | `pencil-design-workflow`     | NO callouts — needs Option A or B           |
| 7   | 0              | 0/0                       | ~/Monodex/Projects/wym/2026-03-17-feature-flags-facade-design.md  | `feature-flags-facade`         | NO callouts — needs Option A or B           |
| 8   | 0              | 0/0                       | ~/Monodex/Projects/wym/2026-03-17-service-registry-design.md      | `service-registry-pattern`     | NO callouts — needs Option A or B           |
| 9   | 0              | 0/0                       | ~/Monodex/Projects/wym/2026-03-17-scoring-engine-design.md        | `scoring-engine-design`        | NO callouts — needs Option A or B           |
| 10  | 0              | 0/0                       | ~/Monodex/Projects/blink/2026-01-11-tui-redesign-design.md        | `tui-redesign-principles`      | NO callouts — needs Option A or B           |

### Why this ranking (skill-shape rationale)

- **#1 convex-patterns** — 836-line patterns reference, explicitly titled "Convex Development Patterns Reference" — already shaped as reusable knowledge (likely has decisions and trade-offs in prose form, ripe for `<DecisionRationale>` authoring under Option B).
- **#2 nextjs-stack-patterns** — 249-line cross-project reference covering Next.js + Convex + Blink stack — broadly applicable to readers building similar stacks; natural fit for `<DecisionRationale>` on stack choices.
- **#3 tmux-poweruser-setup** — Blake's personal setup notes; SLUG COLLIDES with existing `content/configs/tmux-poweruser.mdx` (verified 2026-05-09, see RESEARCH Pitfall 3). If picked, choose a distinct slug like `tmux-power-workflows` or `tmux-from-scratch`.
- **#4 macbook-dev-setup** — opinionated "new machine" walkthrough; broadly relevant developer setup knowledge.
- **#5 terminal-webdev-tuning** — Ghostty + tmux for web dev — newer than #3, narrower angle, good for a focused skill.
- **#6 pencil-design-workflow** — Pencil-based design workflow (touches `mcp__pencil__*` — see global memory).
- **#7-9 wym design notes** — service patterns reference but more design-doc-shaped than skill-shaped; secondary picks.
- **#10 tui-redesign-principles** — TUI design principles abstracted from blink work; useful but most narrow.

### Skill-content collision check

Existing skill on disk (verified 2026-05-09): `apps/blakepetersen.io/content/skills/claude-code/writing-custom-skills.mdx`. New ports MUST use distinct slugs. None of the proposed slugs above collide with this single existing skill. **The `tmux-poweruser-setup` candidate (#3) collides with the existing `configs/tmux-poweruser.mdx`** entry — different collection but the slug is taken; pick a distinct slug if porting.

## Final selection (Blake-approved 2026-05-12)

<!-- LOCKED FORMAT — Plans 02 and 03 parse these lines verbatim. Slug MUST be in backticks. -->
<!-- Exactly ONE "Torture test" line. Exactly FOUR numbered lines (2..5). -->

- **Torture test:** `convex-patterns` — ~/Monodex/Projects/wym/2026-02-18-convex-patterns-reference.md
- 2. `nextjs-stack-patterns` — ~/Monodex/Projects/luna-n-b-link/2026-03-29-stack-patterns-reference.md
- 3. `macbook-dev-setup` — ~/Monodex/Projects/blakepetersen/2026-03-18-new-macbook-setup.md
- 4. `terminal-webdev-tuning` — ~/Monodex/Projects/blakepetersen/2026-04-24-tmux-ghostty-webdev-tuning.md
- 5. `tmux-power-workflows` — ~/Monodex/Projects/blakepetersen/2026-04-04-tmux-poweruser-setup.md

## Option B authorization (callouts absent in source vault)

**Decision (Blake, 2026-05-12):** Option B — port the 5 selected notes unmodified, then manually inject voice primitives during Plan 02 / Plan 03 prose pass.

**Why:** The Monodex vault contains **zero** Obsidian-style callouts across 135 user-authored notes (full vault scan: `grep -rE '^>\s*\[!\w+\]' --include="*.md"` excluding `.obsidian`, `Templates`, `Attachments`, `node_modules` → 0 matches). The `blink port stage` callout-mapping pass will inject neither `<AuthorNote>` nor `<DecisionRationale>`. Re-authoring vault prose to add callouts before porting is rejected as out-of-scope churn against the source-of-truth notes.

**Authorization for downstream executors:**

- **Plan 02 (torture-test entry `convex-patterns`)** — executor is **authorized and required** to manually add at least one `<AuthorNote>` invocation AND at least one `<DecisionRationale>` invocation to `apps/blakepetersen.io/content/skills/convex-patterns.mdx` after the port lands. This is the only path to D-06 satisfaction given the vault state. Treat the manual injection as additive prose authoring (Rule-2 style) — not a deviation from plan.
- **Plan 03 (batch entries 2–5)** — executor is **authorized and required** to ensure each of `nextjs-stack-patterns`, `macbook-dev-setup`, `terminal-webdev-tuning`, `tmux-power-workflows` contains at least one voice primitive (any of `<AuthorNote>` / `<DecisionRationale>`) per D-11. Manual authoring expected — auto-injection will be a no-op.

**Slug-collision note:** Source #5 (`2026-04-04-tmux-poweruser-setup.md`) would naturally slug to `tmux-poweruser-setup`, which collides with existing `apps/blakepetersen.io/content/configs/tmux-poweruser.mdx` (different collection — `configs/` vs `skills/` — but the bare slug is reserved; verified 2026-05-09, see RESEARCH Pitfall 3). Renamed to `tmux-power-workflows` to (a) avoid the collision and (b) signal a distinct workflow-focused angle from the existing config-focused entry.
