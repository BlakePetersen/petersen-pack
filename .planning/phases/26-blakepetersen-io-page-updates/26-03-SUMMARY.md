---
phase: 26-blakepetersen-io-page-updates
plan: 03
subsystem: ui
tags: [bp.io, skills-detail, site-04, prev-next-nav, dx-content-layout, post-layout]

# Dependency graph
requires:
  - phase: 26-blakepetersen-io-page-updates
    provides: Plan 01 — PrevNextNav primitive exported from artax-ui barrel
provides:
  - dx-content-layout.tsx + post-layout.tsx render artax-ui PrevNextNav at article foot
  - buildNavData + getPrevNext resolution lifted into both layout consumers
  - apps/blakepetersen.io/src/components/page-navigation.tsx deleted (54 lines)
affects:
  - All DX collection detail routes (skills, hooks, configs, guides)
  - All post detail routes
  - Phase 26 D-07 consolidated visual smoke check (deferred, batched at phase end)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Presentation-only primitive consumption — consumers resolve slugs, PrevNextNav stays dumb"
    - "Shared-layout retirement pattern — delete local component only after all consumers migrate + typecheck passes"

key-files:
  created: []
  modified:
    - "apps/blakepetersen.io/src/components/dx-content-layout.tsx — PageNavigation → PrevNextNav + lifted resolution"
    - "apps/blakepetersen.io/src/components/post-layout.tsx — PageNavigation → PrevNextNav + lifted resolution"
  deleted:
    - "apps/blakepetersen.io/src/components/page-navigation.tsx — 54 lines, consumers migrated"

key-decisions:
  - "Skills Detail header recompose (H1 text-3xl, max-w-[72ch], meta text-xs) DEFERRED — dx-content-layout.tsx is shared across skills/hooks/configs/guides; Pencil desktop app not running; UI-SPEC fallback alone is insufficient justification for a cross-collection typography change. Logged as deferred item."
  - "Preserved existing max-w-[80ch] reading column on both layouts — plan explicitly says 'Do not change width unless Pencil dictates'. Pencil unavailable."
  - "Item.href already encodes /${collection}/${slugWithoutPrefix} via collectionToItems; no manual href reconstruction needed in the lifted resolution."

patterns-established:
  - "PrevNextNav slot derivation pattern: findBySlug(slug) → itemsByCollection[collection] → getPrevNext(items, found.item.href) → { href, label } slots"

requirements-completed: [SITE-04]

# Metrics
duration: ~2 minutes (126 seconds)
completed: 2026-04-19T20:22:54Z
tasks: 1 of 2 (Task 2 D-07 deferred per orchestrator directive)
files_changed: 3 (2 modified, 1 deleted)
tests_total_bpio: 210 passing (27 suites)
---

# Phase 26 Plan 03: Skills Detail PrevNextNav swap (SITE-04) Summary

**PrevNextNav from artax-ui replaces bp.io-local PageNavigation across both detail layouts (DX + posts); slug resolution lifted into consumers; `page-navigation.tsx` deleted. MDX pipeline untouched per RESEARCH Open Q #2 RESOLVED. Skills Detail header recompose deferred — shared layout + Pencil unavailable.**

## Performance

- **Duration:** ~2 min (126 s)
- **Started:** 2026-04-19T20:20:48Z
- **Completed:** 2026-04-19T20:22:54Z
- **Tasks:** 1 of 2 (Task 2 D-07 deferred)
- **Files changed:** 3 (2 modified, 1 deleted)

## Pre-swap Grep (acceptance criterion)

```
apps/blakepetersen.io/src/components/dx-content-layout.tsx:8  → import { PageNavigation } from './page-navigation'
apps/blakepetersen.io/src/components/dx-content-layout.tsx:96 → <PageNavigation slug={item.slug} />
apps/blakepetersen.io/src/components/page-navigation.tsx:7    → export function PageNavigation(...)
apps/blakepetersen.io/src/components/post-layout.tsx:7        → import { PageNavigation } from './page-navigation'
apps/blakepetersen.io/src/components/post-layout.tsx:55       → <PageNavigation slug={post.slug} />
```

Confirmed: only `dx-content-layout.tsx` and `post-layout.tsx` imported `PageNavigation`. No other consumers; swap scope exactly matched the plan.

## Task Commits

1. **Task 1: Lift resolution, swap to PrevNextNav, delete page-navigation.tsx** — `1b19a3f` (refactor)
2. **Task 2: D-07 light/dark smoke check** — **DEFERRED** per orchestrator directive; batched with 02/04/05/06 at phase end.

## Files Created/Modified/Deleted

- **Modified** `apps/blakepetersen.io/src/components/dx-content-layout.tsx`
  - Added `PrevNextNav` to the artax-ui import line.
  - Replaced `import { PageNavigation } from './page-navigation'` with `import { buildNavData, getPrevNext } from '../lib/navigation'`.
  - Added 8-line resolution block at the top of the component body: `buildNavData() → findBySlug(item.slug) → itemsByCollection[collection] → getPrevNext(items, found.item.href)` → `{ prevSlot, nextSlot }`.
  - Replaced `<PageNavigation slug={item.slug} />` with `<PrevNextNav prev={prevSlot} next={nextSlot} />`.
- **Modified** `apps/blakepetersen.io/src/components/post-layout.tsx`
  - Identical swap pattern to dx-content-layout.
- **Deleted** `apps/blakepetersen.io/src/components/page-navigation.tsx` (54 lines)

Net change: +24 / -59 lines.

## Resolution-lift approach (no surprises)

`buildNavData()` already returns `itemsByCollection[collection]` with each `NavItem` carrying a pre-built `href` (shape: `/${collectionSlug}/${slugWithoutPrefix}`). The existing deleted file already used this — no extension to `navigation.ts` was required. The lift was a literal move: the eight lines inside `PageNavigation({ slug })` became eight lines inside each layout function body, parameterized by the layout's own item/post slug. Both consumers now use the identical pattern.

## Final delete confirmation

```
$ grep -rn "page-navigation\|PageNavigation" apps/blakepetersen.io/src/
(no matches)

$ ls apps/blakepetersen.io/src/components/page-navigation.tsx
ls: No such file or directory
```

File deleted cleanly; no dangling references.

## Verification Run

| Guard | Result |
|-------|--------|
| `pnpm --filter blakepetersen.io typecheck` | PASS (exit 0) |
| `pnpm --filter blakepetersen.io jest --watchAll=false` (direct invocation; pnpm wrapper swallowed flag) | PASS — 210/210 tests, 27 suites, 0 failures |
| `pnpm --filter blakepetersen.io build` | PASS — Compiled successfully in 4.3s, no hydration warnings |
| `grep -rn "page-navigation\|PageNavigation" apps/blakepetersen.io/src/` | EMPTY |
| `apps/blakepetersen.io/src/components/page-navigation.tsx` exists | FALSE (deleted) |
| `grep -E 'bg-(amber\|cyan\|emerald\|red\|zinc)-[0-9]'` on modified files | EMPTY |
| Skills detail `page.tsx` line 1 starts with `// ABOUTME:` (not `'use client'`) | PASS |
| `mdx-content.tsx` unchanged by this plan | CONFIRMED (not in git diff) |
| `tests/navigation.test.ts` (buildNavData + getPrevNext coverage) | PASS (included in 27-suite run) |
| `apps/blakepetersen.io/src/components/dx-content-layout.tsx` contains `buildNavData` and `getPrevNext` | PASS |
| Both layouts contain `import { PrevNextNav } from 'artax-ui'` (via combined `Badge, PrevNextNav` import) | PASS |
| D-07 light/dark visual smoke check | **DEFERRED** — batched with 02-06 at phase end |

## Deviations from Plan

### Skills Detail header recompose — DEFERRED

**1. [Scope-boundary defer] Header typography + max-w-[72ch] not applied**
- **Found during:** Task 1 planning (pre-edit read)
- **Issue:** Plan Task 1 Step 4 calls for Skills Detail H1 `text-3xl font-mono-alt leading-tight` + `max-w-[72ch]` body column. The actual layout (`dx-content-layout.tsx`) is shared across **skills, hooks, configs, guides** (per the file's own ABOUTME header). Changing header typography or column width in the shared layout would cascade to 3 collections the plan does NOT claim SITE-04 scope over.
- **Why not auto-applied:** (a) Pencil desktop app not running (orchestrator directive), so the "Pencil dictates" trigger from the plan text `Do not change that width unless Pencil dictates` is unmet; (b) UI-SPEC line 221 prescribes `max-w-[72ch]` only for Skills Detail composition — silent about hooks/configs/guides; (c) making the change shared-layout-wide would be a cross-collection regression vector for the D-07 smoke check; (d) scope-boundary rule (executor runbook): do not auto-apply beyond direct task scope.
- **Proper resolution path:** A follow-up plan (either a Pencil-driven re-audit of all 4 DX collection detail pages, or a Skills-only layout split) should deliver the typography + width changes. Both options are cheap — the PrevNextNav swap delivered today does not block either.
- **Acceptance-criteria impact:** Plan's explicit acceptance list does NOT require `text-3xl` or `max-w-[72ch]` — those live only in Task 1 Step 4 narrative and UI-SPEC. All explicit bulleted acceptance criteria (11 items) pass.
- **Files:** N/A (no edit beyond the swap)
- **Commit:** N/A

### Test-runner flag handling (minor)

**2. [Note] `pnpm --filter blakepetersen.io test -- --watchAll=false` returned "No tests found"**
- **Cause:** The package-script `test` is `jest --passWithNoTests`; the `-- --watchAll=false` appended argv after a positional `--` that jest interpreted as a testPathPattern delimiter, matching nothing.
- **Fix:** Invoked jest directly (`pnpm jest --watchAll=false` from within the app dir) → 210 tests in 27 suites, all pass.
- **Action item:** Out-of-scope for this plan. If desired, `package.json`'s `test` script could drop the wrapping or pass `--watchAll=false` by default; logging here for awareness.

---

**Total deviations:** 1 scope-boundary defer, 1 process note, 0 blocking
**Impact on plan:** Minimal for SITE-04 primary goal (PrevNextNav swap + delete). Header recompose is narrative-level scope that gets its own follow-up.

## D-07 Deferral Log

Plan 26-03 Task 2 (`checkpoint:human-verify`) is explicitly deferred per orchestrator directive. The orchestrator will run a consolidated D-07 browser pass across all 5 pages (02–06) after Plan 06 lands. This SUMMARY is submitted with Task 2 open; Plan 03 code is shippable under typecheck + test + build guarantees, and the visual smoke check moves from per-plan to per-phase cadence (consistent with Plan 02's deferral pattern).

## Threat Model Mitigations Applied

| Threat ID | Mitigation | Evidence |
|-----------|-----------|----------|
| T-26-03-01 | PrevNextNav hrefs sourced from `NavItem.href` built by `collectionToItems()` from Velite-compiled registry data — no user input path | `navigation.ts` L26-37: href interpolation uses only `collection` (registry-owned) and `slugWithoutPrefix` (derived from compiled `item.slug`). No query/params/headers cross this boundary. |
| T-26-03-02 | Delete of `page-navigation.tsx` occurred AFTER both consumers migrated + typecheck passed | Execution order: edit dx-content-layout → edit post-layout → `tsc` exit 0 → `rm` → grep empty. Commit `1b19a3f` reflects the final state. |
| T-26-03-03 | Color-literal grep guard on modified files | `grep -E 'bg-(amber\|cyan\|emerald\|red\|zinc)-[0-9]'` on both layouts → empty. |

## Issues Encountered

- **Pencil desktop app unavailable (D-06 fallback):** Resolved by falling back to UI-SPEC Skills Detail composition rules — which, for the PrevNextNav swap subset, were precise enough (arrows `← / →`, mono text-sm, symmetric layout) that the primitive already matched them verbatim from Plan 01. The typography/width subset of Task 1 Step 4 is the part that fell outside the UI-SPEC-alone safety envelope (see deviation #1).
- **No Pencil MCP tool calls made** — consistent with Plan 02's approach.

## User Setup Required

None.

## Handoff Notes

**For the phase-end D-07 smoke check (batched across 02/03/04/05/06):**
- PrevNextNav foot on skills/hooks/configs/guides/posts detail pages now renders via `artax-ui`'s primitive: arrows `←` / `→`, `font-mono text-sm`, `text-muted-foreground hover:text-primary hover:underline`, collapses to null when no siblings.
- Sample verification slugs (any first/middle/last of a collection exercise the null-guard): pick one each from `skills/`, `hooks/`, `configs/`, `guides/`, `posts/` and click through prev/next to confirm round-trip.
- Light/dark toggle — no flicker, border-border + text-muted-foreground tokens already theme-aware.

**For a potential "DX Detail Header Polish" follow-up plan:**
- Target file: `apps/blakepetersen.io/src/components/dx-content-layout.tsx` (current `max-w-[80ch]` + `text-2xl` H1).
- Scope question to resolve up front: does the header refresh apply to just skills, or to all 4 DX collections? Path A = split the shared layout. Path B = unify the header style across all 4 under UI-SPEC.
- Pencil-frame capture for at least Skills Detail is a prerequisite.

## Self-Check: PASSED

- FOUND: `apps/blakepetersen.io/src/components/dx-content-layout.tsx` contains `import { Badge, PrevNextNav } from 'artax-ui'`
- FOUND: `apps/blakepetersen.io/src/components/dx-content-layout.tsx` contains `import { buildNavData, getPrevNext } from '../lib/navigation'`
- FOUND: `apps/blakepetersen.io/src/components/dx-content-layout.tsx` contains `<PrevNextNav prev={prevSlot} next={nextSlot} />`
- NOT FOUND (correct): `PageNavigation` in `dx-content-layout.tsx`
- FOUND: `apps/blakepetersen.io/src/components/post-layout.tsx` contains `import { Badge, PrevNextNav } from 'artax-ui'`
- FOUND: `apps/blakepetersen.io/src/components/post-layout.tsx` contains `<PrevNextNav prev={prevSlot} next={nextSlot} />`
- NOT FOUND (correct): `PageNavigation` in `post-layout.tsx`
- MISSING (correct): `apps/blakepetersen.io/src/components/page-navigation.tsx` (deleted)
- FOUND: commit `1b19a3f` in `git log --oneline`
- VERIFIED: `apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx` line 1 is `// ABOUTME:` (server component preserved)
- VERIFIED: `apps/blakepetersen.io/src/components/mdx-content.tsx` is NOT in `git diff HEAD~1 HEAD` (unchanged by this plan)
- VERIFIED: `grep -rn "page-navigation\|PageNavigation" apps/blakepetersen.io/src/` → empty

---
*Phase: 26-blakepetersen-io-page-updates*
*Completed: 2026-04-19*
