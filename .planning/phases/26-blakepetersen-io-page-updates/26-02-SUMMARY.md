---
phase: 26-blakepetersen-io-page-updates
plan: 02
subsystem: ui
tags: [bp.io, homepage, site-03, badge, artax-ui]

# Dependency graph
requires:
  - phase: 26-blakepetersen-io-page-updates
    provides: Plan 01 — Badge primitive exported from artax-ui barrel with outline variant
  - phase: 26-blakepetersen-io-page-updates
    provides: Plan 01b — AuthorNote and DecisionRationale molecules (not consumed by this plan)
provides:
  - Homepage (`apps/blakepetersen.io/src/app/page.tsx`) surgically recomposed per UI-SPEC Homepage composition rules with Badge variant="outline" stack chips
  - Server-component boundary preserved on `page.tsx` (no 'use client' directive, build-time data fetch intact)
  - H3 role in recent_posts list conforms to UI-SPEC 4-size typography scale (text-base font-medium)
affects:
  - 26-03-skills-detail
  - 26-04-about
  - 26-05-start-here
  - 26-06-collection-listing
  - Phase 26 D-07 consolidated visual smoke check (deferred, batched at phase end)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Primitive swap pattern — replace inline token-heavy spans with artax-ui Badge variant, keeping adjacent markup untouched"
    - "Server-component-first Homepage — any future interactivity lands in a client island imported into page.tsx, never in page.tsx itself"

key-files:
  created: []
  modified:
    - "apps/blakepetersen.io/src/app/page.tsx — surgical recompose of // stack section + recent_posts H3 size correction"

key-decisions:
  - "No Modal island introduced on Homepage — UI-SPEC Homepage composition rules (line 204-216) do not require one; Pencil desktop app unavailable during execution (D-06 fallback); YAGNI applies"
  - "Recent_posts H3 scaled from text-sm to text-base font-medium — UI-SPEC explicitly declares a 4-size cap {xs, base, lg, 3xl} and the plan's recent_posts refinement directive locks H3 at text-base font-medium"
  - "Pre-existing text-sm violations on recent_posts description + contribute copy left alone — out of scope (Rule: scope boundary); logged as a phase-wide deferred audit item"

patterns-established:
  - "Badge primitive is the canonical chip/pill for bp.io — any future chip UI (skills applies_to, category tags) should consume Badge rather than hand-rolling border+px-2+py-1 spans"

requirements-completed: [SITE-03]

# Metrics
duration: ~14min
completed: 2026-04-19
---

# Phase 26 Plan 02: Homepage surgical rewrite (SITE-03) Summary

**Badge primitive swap on `// stack` section + recent_posts H3 token-scale correction; all 5 section captions, bracket/shell CTAs, and data contract preserved verbatim; server-component boundary intact.**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-04-19T20:04:00Z (approximate — plan load)
- **Completed:** 2026-04-19T20:18:14Z
- **Tasks:** 1 of 2 (Task 2 D-07 deferred per orchestrator directive)
- **Files modified:** 1

## Accomplishments
- Stack chip span (`border border-border px-2 py-1 font-mono text-xs text-secondary-foreground`) replaced with `<Badge variant="outline">` from artax-ui barrel — delivers the primary SITE-03 token contract.
- Recent_posts H3 lifted from `text-sm` to `text-base font-medium` — restores conformance to the UI-SPEC 4-size typography cap at the site's most visible list row.
- Data contract preserved: `getAllCollections`, `getCollection('posts').getter`, `recentPosts.slice(0, 5)`, `stackTools` array all untouched.
- Server-component boundary preserved: `page.tsx` first line remains the `// ABOUTME:` header, not `'use client'` — build-time SSG still runs.
- Typecheck + build both clean, no hydration warnings, no new color literals.

## Task Commits

1. **Task 1: Pencil Homepage frame read + surgical recompose** — `d343145` (feat)
2. **Task 2: D-07 light/dark smoke check** — **DEFERRED** per orchestrator directive; will be batched with 02-06 visual smoke checks at phase end.

**Plan metadata:** (pending final metadata commit by orchestrator)

## Files Created/Modified
- `apps/blakepetersen.io/src/app/page.tsx` — +Badge import; stack chip span → `<Badge variant="outline">`; recent_posts H3 `text-sm` → `text-base`. Net +4/-3 lines.

## Decisions Made

**1. No Modal island on Homepage.** The plan left this conditional on the Pencil Homepage frame showing a subscribe/contact Modal. With the Pencil desktop app unavailable, Phase 26 D-06 fallback sends us to UI-SPEC as the authoritative composition spec. UI-SPEC §"Homepage … — SITE-03" (line 214) lists Modal only as "optionally … if Pencil frame wires a subscribe or contact modal off // contribute". No Modal is mandated. The existing Homepage has no Modal. Per CLAUDE.md YAGNI and Phase 25 precedent, I did not speculatively introduce one. `home-subscribe-modal.tsx` is NOT created. If a later Pencil read shows a Modal is wanted, a follow-up plan can add the island without touching this work.

**2. Recent_posts H3 size correction applied.** Plan explicitly calls for `text-base font-medium` on the H3. Current was `text-sm`. UI-SPEC line 57 declares the 4-size scale `{text-xs, text-base, text-lg, text-3xl}` as a hard cap — `text-sm` is a token-scale violation. Fixed inline (Rule 1 / Rule 2 — correctness against the design-system contract).

**3. Pre-existing text-sm violations left untouched.** Three other `text-sm` usages in `page.tsx` (recent_posts description L106, contribute body L122, contribute CTAs L125) are also outside the 4-size scale but were not flagged by the plan's explicit refinement directives. Per scope-boundary guidance, I did not fix them; they are logged as deferred items for a phase-wide token audit (see "Deferred Issues" below).

## Deviations from Plan

Plan executed mostly as written. Two minor deviations:

### Pre-committed auto-fix

**1. [Rule 2 — Design-system correctness] Recent_posts H3 token-scale fix**
- **Found during:** Task 1 (Homepage surgical recompose)
- **Issue:** H3 was at `text-sm` (14px, not in the 4-size scale declared by UI-SPEC line 57).
- **Fix:** Lifted to `text-base font-medium` — which is also what Plan 26-02's `recent_posts` refinement directive explicitly specifies.
- **Files modified:** `apps/blakepetersen.io/src/app/page.tsx` (line 92)
- **Verification:** grep confirms no `text-sm` on H3; build green.
- **Committed in:** `d343145` (Task 1 commit)

### Deferred Issues (out of scope, flagged for later audit)

- **Pre-existing `text-sm` usages in `page.tsx`:**
  - Line 34: `<nav … font-mono text-sm>` on workbench CTAs
  - Line 106: recent_posts description `text-sm text-muted-foreground`
  - Line 122: contribute body `text-sm text-secondary-foreground`
  - Line 125: contribute CTAs `font-mono text-sm`
  All outside the UI-SPEC 4-size cap. Not touched because the plan's refinement directives didn't call them out, and the scope-boundary rule applies. Phase 26 should consider a consolidated token audit (mirror of Phase 25 color-literal audit) once plans 03-06 land.

---

**Total deviations:** 1 auto-fix (design-system correctness), 0 blocking
**Impact on plan:** Minimal. The H3 fix is required by the plan's own acceptance criteria (UI-SPEC 4-size cap). The deferred `text-sm` items are logged but not fixed.

## Issues Encountered

- **Commitlint `body-max-line-length 100`:** First commit attempt failed on a 273-char line in the commit body. Rewrapped to ≤72 chars per line, commit succeeded.
- **Pencil desktop app unavailable (D-06 fallback):** Documented and resolved by deferring to UI-SPEC Homepage composition rules — which turned out to already lock section order, token usage, and chip placement with enough precision. No ambiguity required judgment calls beyond the Modal decision above.

## Verification Run

| Guard | Result |
|-------|--------|
| `head -1 page.tsx` starts with `// ABOUTME:` (not `'use client'`) | PASS |
| `grep` for `border border-border px-2 py-1 font-mono text-xs` | EMPTY (old chip span removed) |
| `grep` for `getAllCollections\|getCollection('posts')` | Still matches (data contract preserved) |
| `grep` for hardcoded color literals (`bg-/text-{amber,cyan,emerald,red,zinc}-\d`) | EMPTY |
| `pnpm --filter blakepetersen.io typecheck` | Exit 0 |
| `pnpm --filter blakepetersen.io build` | Compiled successfully, no hydration warnings |
| D-07 light/dark visual smoke check | **DEFERRED** — batched with 02-06 at phase end |

## D-07 Deferral Log

Plan 26-02 Task 2 (`checkpoint:human-verify`) is explicitly deferred per orchestrator directive. The orchestrator will run a consolidated D-07 browser pass across all 5 pages (02-06) after Plan 06 lands. This SUMMARY is submitted with Task 2 open; Plan 02 code is shippable under typecheck + build guarantees, and the visual smoke check simply moves from per-plan to per-phase cadence.

## User Setup Required

None — no external service configuration.

## Next Phase Readiness

- Plan 26-03 (Skills Detail, SITE-04) can start: Badge consumption pattern established, PrevNextNav primitive available from Plan 01, artax-ui barrel stable.
- Homepage is functionally correct and token-clean for the surfaces the plan touched. D-07 light/dark verification pending but non-blocking for downstream plan execution.

## Self-Check: PASSED

- FOUND: `apps/blakepetersen.io/src/app/page.tsx` contains `import { Badge } from 'artax-ui'`
- FOUND: `apps/blakepetersen.io/src/app/page.tsx` contains `<Badge key={tool} variant="outline">`
- FOUND: commit `d343145` in `git log --oneline`
- VERIFIED: `page.tsx` line 1 is the `// ABOUTME:` header (server component preserved)
- VERIFIED: all 5 section captions present (`// dx_workbench`, `// stack`, `// collections`, `// recent_posts`, `// contribute`)
- VERIFIED: bracket + shell CTAs present (`[skills]`, `[hooks]`, `[configs]`, `[guides]`, `$ report-problem`, `$ suggest-improvement`)

---
*Phase: 26-blakepetersen-io-page-updates*
*Completed: 2026-04-19*
