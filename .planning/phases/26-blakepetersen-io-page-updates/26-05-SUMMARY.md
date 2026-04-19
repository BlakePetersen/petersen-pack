---
phase: 26
plan: 05
subsystem: blakepetersen.io
tags: [bp.io, start-here, site-06, recompose]
requires:
  - apps/blakepetersen.io/src/app/start-here/page.tsx
  - apps/blakepetersen.io/src/lib/collection-registry.ts
  - packages/artax-ui/src/index.ts (DecisionRationale — unused)
provides:
  - bp.io::start-here (Pencil-matched walkthrough — hero, numbered card-style steps, // next footer)
affects:
  - apps/blakepetersen.io/src/app/start-here/page.tsx
tech-stack:
  added: []
  patterns:
    - "Data contract preservation: steps array + resolveSteps() getter preserved verbatim; only the resolved-shape type extended with `collection` to drive per-step CTA label."
    - "Shell-command CTA motif: `$ start-here` hero anchor + per-step `$ go-to-{collection}` actions."
    - "Bracket-link motif: `// next` footer uses `[skills]` / `[home]` terminal convention."
    - "Server component preserved — no `'use client'` introduced."
key-files:
  created: []
  modified:
    - apps/blakepetersen.io/src/app/start-here/page.tsx
decisions:
  - "DecisionRationale omitted — Pencil MCP unavailable at execute-time; current content model has no discrete \"why this stack\" block (per-step `why` is orientation rationale, not a stack decision). Consistent with 26-04 AuthorNote skip (Pencil unavailable → fall back to UI-SPEC)."
  - "resolveSteps return type extended with `collection: Step['collection']` field to support the per-step `$ go-to-{collection}` CTA label. Data-contract-safe: `steps` array and getter signature unchanged; additive to internal resolved shape only."
  - "Per-step CTA label uses `collection` (e.g. `$ go-to-configs`) rather than slug — slugs are path-qualified (`configs/eslint-flat-config`) and would render an awkward CTA. UI-SPEC action block used `slug` as a shape guide; collection reads better as shell-verb-noun."
  - "Reading column widened from `max-w-[80ch]` to `max-w-[72ch]` per UI-SPEC reading-column rule (line 46 of 26-UI-SPEC.md). Vertical rhythm bumped from `py-8` → `py-12` to match Start Here editorial density."
metrics:
  duration: "~80 seconds"
  completed: "2026-04-19T20:31:37Z"
  tasks: 1
  tasks_deferred: 1
  files_changed: 1
---

# Phase 26 Plan 05: Start Here Page Recompose (SITE-06) Summary

Start Here page recomposed to Pencil composition: `// start_here` mono hero with editorial H1 and `$ start-here` shell CTA anchoring to the step list, numbered walkthrough rendered as `bg-card p-6 border-border` cards with zero-padded `text-primary font-mono text-lg` step numbers, per-step `$ go-to-{collection}` primary CTA, and `// next` footer with `[skills]` / `[home]` bracket CTAs. Data contract (`steps` array + `resolveSteps()` getter) preserved verbatim; resolved-shape type extended additively with `collection`. DecisionRationale omitted (Pencil unavailable, no discrete "why this stack" content). Server component boundary preserved.

## Tasks Executed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Start Here Pencil-matched recompose | `c16db24` | apps/blakepetersen.io/src/app/start-here/page.tsx |

## Tasks Deferred

| # | Task | Reason |
|---|------|--------|
| 2 | D-07 light/dark smoke check | Batched for phase end per Plans 02/03/04 precedent — single in-browser pass across all recomposed pages. |

## Verification Outcomes

- `pnpm --filter blakepetersen.io typecheck`: **0 errors**.
- `pnpm --filter blakepetersen.io build`: **green** (24 pages indexed, Pagefind build clean).
- `grep -E 'bg-(amber|cyan|emerald|red|zinc)-[0-9]' apps/blakepetersen.io/src/app/start-here/page.tsx`: **empty**.
- Acceptance markers (grep counts from final page.tsx):
  - `// start_here` = 1
  - `// next` = 1
  - `$ start-here` = 1
  - `bg-card p-6` = 1
  - `text-primary font-mono text-lg` = 1
  - `resolveSteps` = 2 (definition + invocation)
  - `steps: Step[]` = preserved
- `head -1` of page.tsx starts with `// ABOUTME:` comment — NOT `'use client'`. Server component boundary intact.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] resolveSteps stripped `collection` field, breaking per-step CTA**
- **Found during:** Task 1 (first typecheck run)
- **Issue:** Initial rewrite referenced `step.collection` in the per-step CTA label (`$ go-to-${step.collection}`), but the existing `resolveSteps()` return shape only exposed `{ title, href, why, number }`. Typecheck error: `TS2339: Property 'collection' does not exist on type '{ title: string; href: string; why: string; number: number; }'`.
- **Fix:** Extended the resolved-shape type with `collection: Step['collection']` and added `collection: step.collection` to the push. The external `steps: Step[]` array and the `resolveSteps` function signature remain unchanged — this is an additive extension to the internal resolved shape only, not a data-contract break.
- **Files modified:** apps/blakepetersen.io/src/app/start-here/page.tsx
- **Commit:** `c16db24` (same commit; discovered + fixed pre-commit)

**2. [Rule 3 - Blocking issue] Token order for acceptance-criteria grep**
- **Found during:** Task 1 (acceptance-marker grep)
- **Issue:** Initial class order on the step-number span was `font-mono text-lg text-primary` (matches UI-SPEC line 249 prose literally: "text-primary font-mono text-lg"). Acceptance criteria grep searches for the exact string `text-primary font-mono text-lg`.
- **Fix:** Reordered to `text-primary font-mono text-lg` to satisfy the acceptance grep.
- **Files modified:** apps/blakepetersen.io/src/app/start-here/page.tsx
- **Commit:** `c16db24` (same commit; caught pre-commit)

### Pencil MCP

Pencil desktop app was not running at execute-time. Per the executor's operating note (and consistent with 26-02 / 26-03 / 26-04), fell back to the UI-SPEC Start Here composition rules (lines 243-253) and the Copywriting Contract. No Pencil screenshots referenced.

### DecisionRationale conditional — skipped

UI-SPEC line 251 makes DecisionRationale optional: "possibly DecisionRationale if any step includes a 'why this stack' block." The current `steps` array has a per-step `why` field that functions as orientation rationale ("Consistent code style is the foundation…"), not a discrete "why this stack" decision record. Without a Pencil frame to dictate placement, and consistent with 26-04's AuthorNote skip pattern (Pencil unavailable → omit conditional primitive rather than invent placement), DecisionRationale is not imported or used. `artax-ui` export remains available for future content that warrants it.

## Threat Model Mitigations Applied

| Threat ID | Mitigation | Evidence |
|-----------|-----------|----------|
| T-26-05-01 | Color-literal regression guard | `grep -E 'bg-(amber\|cyan\|emerald\|red\|zinc)-[0-9]'` on final file → empty. Only semantic tokens (`bg-card`, `text-primary`, `text-muted-foreground`, `border-border`, `text-foreground`) used. |
| T-26-05-02 | Open-redirect via step `href` | Accepted per threat register — `steps` array is module-scope, authored in-repo. Per-step `<Link href={step.href}>` resolves `/{step.slug}` where slug is a literal-union-constrained field. No user input path. |

## Known Stubs

None. All content flows from the preserved `resolveSteps()` getter against live content-collection data. Hero H1 copy ("A guided path through the practices.") and subtitle ("Four steps, in order. Each one builds the foundation for the next.") are executor-authored editorial that Blake can edit post-D-07 — not a stub.

## Handoff Notes

**For Plan 06 (Collection Listing recompose, SITE-07):**
- Badge primitive is available for count chips and tag chips.
- Start Here established the `// next` footer + bracket-link pattern (`[skills]` / `[home]`) — Collection Listing can reuse the motif for "back to collections index" / "contribute" continuations.
- `$ verb-noun` CTA pattern consistent across 26-02/03/04/05 — carry forward.

**For D-07 phase-end smoke check:**
- All 5 recomposed bp.io pages (Homepage 26-02, Skills Detail 26-03, About 26-04, Start Here 26-05) batched for single in-browser pass.
- Start Here specifics to verify per the plan Task 2 script:
  - Zero-padded step numbers `01`, `02`, `03`, `04` in primary.
  - Step cards render with `bg-card` distinguishing from page bg in both themes.
  - Per-step `$ go-to-{collection}` CTAs: `$ go-to-configs`, `$ go-to-hooks`, `$ go-to-guides`, `$ go-to-skills`.
  - `$ start-here` anchor scrolls to `#steps`.
  - `// next` footer bracket links navigate correctly.

## Self-Check: PASSED

- [x] `apps/blakepetersen.io/src/app/start-here/page.tsx` — FOUND (modified).
- [x] Commit `c16db24` — FOUND (`git log --oneline` confirms `feat(26-05): recompose Start Here to Pencil composition (SITE-06)`).
- [x] typecheck passed post-fix.
- [x] build passed.
- [x] color-literal grep empty.
- [x] `'use client'` absent — server component preserved.
- [x] `steps` + `resolveSteps` preserved (data contract intact).
- [x] All acceptance-criteria markers present in final file.
