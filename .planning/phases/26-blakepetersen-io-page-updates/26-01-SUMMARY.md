---
phase: 26
plan: 01
subsystem: artax-ui
tags: [artax-ui, primitives, modal, badge, prev-next-nav, ssr]
requires:
  - packages/artax-ui/src/components/organisms/dialog/dialog.tsx
  - packages/artax-ui/src/components/atoms/badge/badge.tsx
  - packages/artax-ui/src/lib/utils.ts
provides:
  - artax-ui::Badge (variants: info|success|warning|destructive)
  - artax-ui::Modal (Dialog composition with mounted-flag SSR gate)
  - artax-ui::PrevNextNav (symmetric article-foot navigation)
affects:
  - packages/artax-ui/src/index.ts (barrel)
  - packages/artax-ui/tests/boundaries.test.ts (server/client registry)
tech-stack:
  added: []
  patterns:
    - "Composition over duplication: Modal composes Dialog (not a parallel Radix wrapper)."
    - "Mounted-flag SSR gate (Phase 24.1 D-09) applied at the Modal primitive boundary so every consumer inherits it."
    - "Presentation-only molecules: PrevNextNav never resolves prev/next slugs — consumers pass { href, label }."
key-files:
  created:
    - packages/artax-ui/src/components/organisms/modal/modal.tsx
    - packages/artax-ui/src/components/molecules/prev-next-nav/prev-next-nav.tsx
    - packages/artax-ui/tests/components/modal.test.tsx
    - packages/artax-ui/tests/components/prev-next-nav.test.tsx
  modified:
    - packages/artax-ui/src/components/atoms/badge/badge.tsx
    - packages/artax-ui/tests/components/badge.test.tsx
    - packages/artax-ui/src/index.ts
    - packages/artax-ui/tests/boundaries.test.ts
decisions:
  - "Use next/link inside PrevNextNav (not asChild fallback): verified require.resolve('next/link') succeeds from artax-ui's jest context via pnpm hoisting; tests pass without wiring a Next router provider."
  - "SSR assertion colocated in modal.test.tsx (not a separate modal.hydration.test.tsx) per plan acceptance criteria."
  - "Boundary test (tests/boundaries.test.ts) updated in the same commit as the barrel: Modal → clientFiles, PrevNextNav → serverSafeFiles. This is an auto-registered correctness requirement, not gold-plating."
metrics:
  duration: "~4 minutes (224 seconds)"
  completed: "2026-04-19T20:07:36Z"
  tasks: 4
  files_changed: 8
  tests_added: 13
  tests_total_artax_ui: 293
---

# Phase 26 Plan 01: Generic Primitives (Badge, Modal, PrevNextNav) Summary

Three "generic-by-construction" Pencil primitives landed in `packages/artax-ui`: Badge gained four additive status variants (`info`, `success`, `warning`, `destructive`); Modal arrived as a thin composition over artax-ui Dialog with the Phase 24.1 mounted-flag SSR gate applied at the primitive boundary; PrevNextNav was extracted as a dumb, presentation-only molecule consuming `{ href, label }` slots. All three ship from the `artax-ui` barrel. Editorial-voice primitives (AuthorNote, DecisionRationale) deferred to Plan 01b per D-05.

## Tasks Executed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Extend Badge variants (info/success/warning/destructive) | `749e1bc` | badge.tsx, badge.test.tsx |
| 2 | Build Modal primitive + SSR assertion | `c602fdf` | modal.tsx, modal.test.tsx |
| 3 | Build PrevNextNav primitive | `a9f9b1b` | prev-next-nav.tsx, prev-next-nav.test.tsx |
| 4 | Barrel exports + full-suite regression | `8118afd` | index.ts, boundaries.test.ts |

## Verification Outcomes

- `npx jest --watchAll=false` in `packages/artax-ui`: **293/293 passing** (25 suites, 0 failures).
- Badge suite: 10 cases (6 existing + 4 new variants).
- Modal suite: 5 cases — controlled open, trigger click, Escape close, Title slot, SSR `.not.toMatch(/aria-controls="radix-/)`.
- PrevNextNav suite: 4 cases — prev-only, next-only, both slots, null-guard.
- Boundaries suite: 2 newly-registered files (Modal client, PrevNextNav server-safe) with full coverage holding.
- `grep -rE 'bg-(amber|cyan|emerald|red|zinc)-[0-9]+'` across the 3 primitive source files: **empty** (no hardcoded color literals).
- `tsc --noEmit` against the 3 new/modified primitive sources: **0 errors**. (Pre-existing 31 errors in unrelated `tests/token-usage.test.ts` and `tests/tokens-sync.test.ts` are out of Plan 01 scope — logged in Deferred Issues.)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] boundaries.test.ts required registration**
- **Found during:** Task 4 (full-suite run)
- **Issue:** `tests/boundaries.test.ts` enforces that every `*.tsx` under `src/components` is classified as server-safe or client-only. Adding Modal + PrevNextNav without registration caused the `every component file is covered by boundary tests` case to fail.
- **Fix:** Added `molecules/prev-next-nav/prev-next-nav.tsx` to `serverSafeFiles` and `organisms/modal/modal.tsx` to `clientFiles` in the same commit as the barrel.
- **Files modified:** `packages/artax-ui/tests/components/../boundaries.test.ts`
- **Commit:** `8118afd`

### Pre-empted fallback

**PrevNextNav — `next/link` vs asChild fallback.** Plan allowed a fallback to `asChild` if `next/link` failed in jest-jsdom. I probed with `require.resolve('next/link')` before the test run; it resolved (pnpm hoisting makes Next reachable from artax-ui's node_modules). Kept the direct `<Link>` import. Tests passed with no Next router provider wiring. No fallback applied. This preserves client-side transitions for bp.io consumers in Plan 03 and matches the RESEARCH.md recommendation (a).

### Pencil MCP

Pencil desktop app was not running at execute-time. Per the executor's operating note, fell back to the UI-SPEC Copywriting Contract + RESEARCH.md composition rules for the Modal trigger pattern (RESEARCH Open Q #1: "default controlled; `trigger` optional — wraps in DialogTrigger asChild when provided"). No Pencil screenshots referenced. The primitive API surfaces declared in UI-SPEC matched the final implementation verbatim; no Pencil-driven re-shape needed.

## Deferred Issues

Pre-existing TypeScript errors in `packages/artax-ui/tests/token-usage.test.ts` and `tests/tokens-sync.test.ts` (missing `@types/node`, implicit `any` in callbacks, missing `@/*` path resolution at type-check time). **Out of Plan 01 scope** — these files predate this plan. Logging here for visibility; tests still execute cleanly under ts-jest because `ts-jest`'s transpile path is more permissive than `tsc --noEmit`. Appropriate follow-up would be a small types/tsconfig cleanup phase.

## Threat Model Mitigations Applied

| Threat ID | Mitigation | Evidence |
|-----------|-----------|----------|
| T-26-01-01 | Modal mounted-flag gate emits plain trigger on SSR | `modal.test.tsx` case 5: `renderToString(...)` + `.not.toMatch(/aria-controls="radix-/)` passes |
| T-26-01-02 | Focus trap delegated to Radix Dialog.Content (no hand-rolled handlers) | modal.tsx imports DialogContent from `../dialog/dialog`; real Radix used in tests |
| T-26-01-03 | PrevNextNav accepts only resolved `{href, label}`; no user input path | prev-next-nav.tsx has no input parsing, no dynamic href construction |
| T-26-01-04 | All primitives render via JSX children only | No `dangerouslyInnerHTML` in any file |
| T-26-01-05 | No `process.env.*` reads introduced | `grep process.env` across new files → empty |

## Handoff Notes

**For Plan 01b (AuthorNote + DecisionRationale + D-05 gate):**
- Barrel insertion points already identified: AuthorNote + DecisionRationale belong in the Molecules section of `index.ts`, ideally alongside PrevNextNav.
- `mdxComponents.AuthorNote` reconciliation (Pitfall 1) is Plan 01b's responsibility — have it re-export from the new molecule to maintain single source of truth.
- Boundary test (`tests/boundaries.test.ts`) will need AuthorNote and DecisionRationale added to `serverSafeFiles` (neither expects client-only behavior per UI-SPEC).

**For Plans 02/03/04/06 (page consumers):**
- Import pattern: `import { Badge, Modal, PrevNextNav } from 'artax-ui'`.
- Badge: use `variant="secondary"` for existing muted chips, `variant="outline"` for stack tools, `variant="info|success|warning"` for status.
- Modal: pass `trigger={...}` for self-contained open semantics, or leave it off for externally-controlled flows.
- PrevNextNav: resolve siblings via existing `buildNavData + getPrevNext` in `apps/blakepetersen.io/src/lib/navigation.ts` (Plan 03 will delete the bp.io-local `page-navigation.tsx` after swap-in).

## Self-Check: PASSED

- [x] `packages/artax-ui/src/components/atoms/badge/badge.tsx` — FOUND (modified)
- [x] `packages/artax-ui/src/components/organisms/modal/modal.tsx` — FOUND (created)
- [x] `packages/artax-ui/src/components/molecules/prev-next-nav/prev-next-nav.tsx` — FOUND (created)
- [x] `packages/artax-ui/tests/components/badge.test.tsx` — FOUND (extended; 10 cases)
- [x] `packages/artax-ui/tests/components/modal.test.tsx` — FOUND (created; 5 cases)
- [x] `packages/artax-ui/tests/components/prev-next-nav.test.tsx` — FOUND (created; 4 cases)
- [x] `packages/artax-ui/src/index.ts` — FOUND (Modal + PrevNextNav exported; no 01b exports)
- [x] `packages/artax-ui/tests/boundaries.test.ts` — FOUND (registered new files)
- [x] `packages/artax-ui/tests/components/modal.hydration.test.tsx` — CORRECTLY ABSENT (SSR assertion lives in modal.test.tsx per plan)
- [x] Commit `749e1bc` — FOUND (Badge variants)
- [x] Commit `c602fdf` — FOUND (Modal)
- [x] Commit `a9f9b1b` — FOUND (PrevNextNav)
- [x] Commit `8118afd` — FOUND (barrel + boundaries)
