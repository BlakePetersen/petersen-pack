---
phase: 29-content-authoring-greenfield-ports
plan: 01
subsystem: infra
tags: [playwright, jest, lint-baseline, obsidian-port, monodex, voice-primitives]

# Dependency graph
requires:
  - phase: 28-authoring-scaffolds-lint-port
    provides: "blink port stage/commit pipeline; .obsidian-port-staging/ ignore guard; blink lint command"
provides:
  - "Playwright 1.59.1 installed in apps/blakepetersen.io with three viewport projects (desktop-light, desktop-dark, mobile-light)"
  - "Jest isolated from tests/visual/ via testPathIgnorePatterns"
  - "Frozen lint baseline (24 errors / 5 warnings — all pre-existing) for phase-end diff target"
  - "Blake-locked Monodex shortlist with 1 torture-test slug + 4 batch slugs for Plans 02/03 consumption"
  - "Option B authorization recorded: manual voice-primitive injection required across Plans 02/03 (vault has zero callouts)"
affects: [29-02, 29-03, 29-04, 29-05, 29-06, 29-07]

# Tech tracking
tech-stack:
  added:
    - "@playwright/test ^1.59.1 (devDep, apps/blakepetersen.io)"
    - "playwright ^1.59.1 (devDep, apps/blakepetersen.io)"
  patterns:
    - "LOCKED-FORMAT planning artifact: shortlist slugs in single backticks, exactly-one torture line + exactly-four numbered batch lines — Plans 02/03 parse via `awk -F'\\`'`"
    - "Pre-port shortlist as planning-time artifact (decoupled from blink port runtime)"

key-files:
  created:
    - "apps/blakepetersen.io/playwright.config.ts"
    - ".planning/phases/29-content-authoring-greenfield-ports/lint-baseline.txt"
    - ".planning/phases/29-content-authoring-greenfield-ports/monodex-shortlist.md"
  modified:
    - "apps/blakepetersen.io/package.json (devDeps + test:visual scripts)"
    - "apps/blakepetersen.io/jest.config.ts (testPathIgnorePatterns)"

key-decisions:
  - "29-01: Option B — port Monodex notes unmodified, manually author <AuthorNote>/<DecisionRationale> during Plan 02/03 prose pass (vault contains zero Obsidian callouts across 135 user-authored notes; auto-injection would be a no-op)"
  - "29-01: Slug #5 renamed from `tmux-poweruser-setup` to `tmux-power-workflows` to avoid collision with existing apps/blakepetersen.io/content/configs/tmux-poweruser.mdx and to signal workflow-focused angle vs config-focused existing entry"
  - "29-01: Shortlist ranked by skill-shape/reusability (not callout density) since callout count is uniform zero — torture-test selection is qualitative"
  - "29-01: Plan 02 hard-gate requirement (D-06: both voice primitives co-occur) satisfied via manual authoring authorization, not auto-injection"

patterns-established:
  - "Wave 0 preflight pattern: install visual-regression infra + freeze lint baseline + lock content selection BEFORE any content authoring begins (de-risks Wave 1 torture test and Wave 2 batch ports)"
  - "Planning-artifact LOCKED FORMAT contract: downstream-consumer plans parse slug lines via awk; format invariants enforced by acceptance verifier in the producing task"

requirements-completed:
  - CONTENT-06

# Metrics
duration: ~2 days wall (multi-session; Tasks 1-2 on 2026-05-10, Task 3 checkpoint resumed 2026-05-12)
completed: 2026-05-12
---

# Phase 29 Plan 01: Wave 0 Preflight Summary

**Playwright 1.59.1 installed in blakepetersen.io with three viewport projects, Jest isolated from visual tests, lint baseline frozen at 24 errors / 5 warnings (all pre-existing, out of scope), and Blake-locked Monodex shortlist of 5 net-new skill slugs with Option B manual-injection authorization for downstream voice-primitive work.**

## Performance

- **Duration:** ~2 days wall (Tasks 1-2 on 2026-05-10; Task 3 checkpoint resumed 2026-05-12)
- **Started:** 2026-05-10T08:21:34Z (Task 1 commit)
- **Completed:** 2026-05-12T22:54:40Z (Task 3 commit) + plan metadata commit
- **Tasks:** 3 of 3 complete
- **Files modified:** 5 (2 created in apps/, 1 modified in apps/, 2 created in .planning/)

## Accomplishments

- Playwright 1.59.1 (`@playwright/test` + `playwright`) installed in `apps/blakepetersen.io` with three viewport projects matching luna's working pattern (desktop-light, desktop-dark, mobile-light); `test:visual` + `test:visual:update` scripts added.
- Jest's `testPathIgnorePatterns` extended with `/tests/visual/` so Plan 02's spec file will not collide with the unit runner.
- `.gitignore` already contained `.obsidian-port-staging/` (carried over from Phase 28 D-PORT-02 — verify-only step landed as a no-op).
- Lint baseline frozen at `.planning/phases/29-content-authoring-greenfield-ports/lint-baseline.txt`: **24 errors / 5 warnings**, all pre-existing (24 errors in `content/posts/*` owned by Phase 30; 5 warnings in `content/configs/*`). Scope-relevant baseline for `skills/configs/hooks/guides` = 0 errors / 5 warnings. Plan 07 will diff against this.
- Monodex vault audited (135 user-authored `.md` files surveyed across `Projects/*` and other folders). Shortlist of 10 ranked candidates recorded at `.planning/phases/29-content-authoring-greenfield-ports/monodex-shortlist.md`. **Blake reviewed at checkpoint and approved 5 slugs in LOCKED FORMAT.**

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Playwright + add config + isolate Jest** — `38e6963` (chore)
2. **Task 2: Capture lint baseline + record Monodex shortlist** — `efe7acd` (chore)
3. **Task 3: Blake-approved Monodex shortlist + Option B authorization** — `33bcf29` (chore)

**Plan metadata:** *(see final commit below)*

## Files Created/Modified

- `apps/blakepetersen.io/playwright.config.ts` (created) — Playwright config: `testDir: './tests/visual'`, port 3000 `webServer`, three viewport projects, `maxDiffPixels: 100`, `threshold: 0.2`.
- `apps/blakepetersen.io/package.json` (modified) — added `@playwright/test ^1.59.1` + `playwright ^1.59.1` devDeps; added `test:visual` + `test:visual:update` scripts.
- `apps/blakepetersen.io/jest.config.ts` (modified) — `testPathIgnorePatterns` extended with `/tests/visual/`.
- `.planning/phases/29-content-authoring-greenfield-ports/lint-baseline.txt` (created) — frozen `pnpm lint:content` output with header comment identifying out-of-scope errors.
- `.planning/phases/29-content-authoring-greenfield-ports/monodex-shortlist.md` (created in Task 2, finalized in Task 3) — 10 ranked candidates + Final selection block + Option B authorization block.

## Downstream-consumer notes (CRITICAL — Plan 02 + Plan 03 executors MUST read)

### Blake-approved slug set (LOCKED FORMAT — parseable via `awk -F'\``)

| Role | Slug | Source path |
| --- | --- | --- |
| Torture test (Plan 02) | `convex-patterns` | `~/Monodex/Projects/wym/2026-02-18-convex-patterns-reference.md` |
| Batch #2 (Plan 03) | `nextjs-stack-patterns` | `~/Monodex/Projects/luna-n-b-link/2026-03-29-stack-patterns-reference.md` |
| Batch #3 (Plan 03) | `macbook-dev-setup` | `~/Monodex/Projects/blakepetersen/2026-03-18-new-macbook-setup.md` |
| Batch #4 (Plan 03) | `terminal-webdev-tuning` | `~/Monodex/Projects/blakepetersen/2026-04-24-tmux-ghostty-webdev-tuning.md` |
| Batch #5 (Plan 03) | `tmux-power-workflows` | `~/Monodex/Projects/blakepetersen/2026-04-04-tmux-poweruser-setup.md` |

All five slugs verified net-new in `apps/blakepetersen.io/content/skills/` (no collisions) at 2026-05-12.

### Option B authorization (manual voice-primitive injection)

**Decision (Blake, 2026-05-12):** Port the 5 selected notes unmodified, then manually author voice primitives during Plan 02 / Plan 03 prose pass.

**Why:** The Monodex vault contains **zero** Obsidian-style callouts across 135 user-authored notes (full vault scan: `grep -rE '^>\s*\[!\w+\]' --include="*.md"` excluding `.obsidian`, `Templates`, `Attachments`, `node_modules` → 0 matches). The `blink port stage` callout-mapping pass will produce nothing for AuthorNote/DecisionRationale auto-injection. Re-authoring vault prose to add callouts before porting was rejected as out-of-scope churn against source-of-truth notes.

**Authorization for downstream executors:**

- **Plan 02 (`convex-patterns` torture test)** — executor is **authorized and required** to manually add at least one `<AuthorNote>` invocation AND at least one `<DecisionRationale>` invocation to `apps/blakepetersen.io/content/skills/convex-patterns.mdx` after the port lands. This is the only path to D-06 satisfaction given the vault state. Treat the manual injection as additive prose authoring (Rule-2 style), not a deviation from plan.
- **Plan 03 (batch entries 2–5)** — executor is **authorized and required** to ensure each of `nextjs-stack-patterns`, `macbook-dev-setup`, `terminal-webdev-tuning`, `tmux-power-workflows` contains at least one voice primitive (`<AuthorNote>` or `<DecisionRationale>`) per D-11. Manual authoring expected — auto-injection will be a no-op.

### Slug-collision resolution (#5)

Source `2026-04-04-tmux-poweruser-setup.md` would naturally slug to `tmux-poweruser-setup`, which collides with the existing `apps/blakepetersen.io/content/configs/tmux-poweruser.mdx`. Different collection (`configs/` vs `skills/`), but the bare slug is reserved (verified 2026-05-09, see RESEARCH Pitfall 3). **Renamed to `tmux-power-workflows`** to (a) avoid the collision and (b) signal a distinct workflow-focused angle vs the existing config-focused entry.

## Decisions Made

- **Option B over Option A.** Cleanest path. Modifying ~/Monodex source notes solely to feed an auto-inject pass conflates the vault (source of truth for thinking) with the published site (curated output). Manual injection during Plan 02/03 prose is additive, traceable per-MDX, and preserves vault integrity.
- **Skill-shape ranking over callout-density ranking.** Callout-density column collapsed to all-zeros; ranking by reusability/opinion-shape (#1 `convex-patterns` is an 836-line patterns reference, ripe for `<DecisionRationale>` blocks) gives downstream authors the most surface area.
- **Slug rename (`tmux-power-workflows`)** preserves both entries' voice — the existing config is a token-level dotfile breakdown; the new skill is workflow-focused. Distinct angle, distinct slug.

## Deviations from Plan

None — plan executed as written. Task 1's `.gitignore` verify step landed as a no-op (`.obsidian-port-staging/` already present from Phase 28 D-PORT-02, as predicted by RESEARCH §Pattern 3 footnote).

The Option B authorization is **not** a deviation — Task 2's acceptance criteria explicitly anticipated this branch ("if no candidate qualifies, surface this as a blocker in the checkpoint below"). Blake chose Option B at the checkpoint per the documented decision path.

## Issues Encountered

- **Vault has zero callouts** — surfaced by Task 2's vault scan, escalated to Blake at the Task 3 checkpoint, resolved via Option B authorization. Documented prominently in `monodex-shortlist.md` and this SUMMARY so Plan 02/03 executors cannot miss it.
- **Pre-commit lint-staged emitted spurious `[FAILED] .planning ignored` log line** during Task 3 commit. The line came from lint-staged's post-Prettier write-back step trying to re-stage Prettier modifications to a `.planning/` path that's git-tracked but appears ignored to lint-staged's tooling. The commit itself succeeded (`33bcf29`) and the shortlist's LOCKED FORMAT invariants survived Prettier (verified post-commit). Treating as noisy-but-harmless pre-commit output, no fix required.

## Next Phase Readiness

**Plan 02 (Wave 1 — torture-test entry) is unblocked.** Required artifacts on disk:

- Playwright config + chromium installed → spec file can be authored and run.
- Jest isolated from `tests/visual/` → no collision risk.
- Lint baseline frozen → Plan 07 has a diff target.
- Monodex shortlist Final selection block in LOCKED FORMAT → `convex-patterns` slug + source path extractable via `awk -F'\``.
- Option B authorization documented in two places (shortlist + this summary) → Plan 02 executor cannot miss the manual-injection mandate.

**Carry-forward concerns for Plan 02/03:**

- D-06 satisfaction is entirely manual — Plan 02's executor must add both `<AuthorNote>` and `<DecisionRationale>` to `convex-patterns.mdx` after `blink port commit`. The Playwright spec must run against the post-injection state.
- D-11 satisfaction is entirely manual across four Plan 03 entries. Plan 03's executor must remember the authorization (it lives in this SUMMARY and in `monodex-shortlist.md`, both grep-able from any subsequent agent).

## Self-Check: PASSED

Verifications performed before writing this SUMMARY:

- `git log --oneline --all | grep 29-01` → 3 task commits present (`38e6963`, `efe7acd`, `33bcf29`)
- `[ -f apps/blakepetersen.io/playwright.config.ts ]` → FOUND
- `[ -f .planning/phases/29-content-authoring-greenfield-ports/lint-baseline.txt ]` → FOUND
- `[ -f .planning/phases/29-content-authoring-greenfield-ports/monodex-shortlist.md ]` → FOUND
- Shortlist verifier (1 torture + 4 batch in LOCKED FORMAT, slugs in backticks) → PASS
- `awk -F'\`' '/^- \*\*Torture test:\*\* \`/ { print $2 } /^- [2-5]\. \`/ { print $2 }' shortlist` → 5 slugs extracted cleanly (`convex-patterns`, `nextjs-stack-patterns`, `macbook-dev-setup`, `terminal-webdev-tuning`, `tmux-power-workflows`)
- Skill-collection collision check (`apps/blakepetersen.io/content/skills/<slug>.mdx`) → all 5 net-new, zero collisions

---
*Phase: 29-content-authoring-greenfield-ports*
*Plan: 01*
*Completed: 2026-05-12*
