---
phase: 26-blakepetersen-io-page-updates
plan: 06
subsystem: blakepetersen.io
tags: [bp.io, collection-listing, site-07, factory, badge, empty-state]
requirements: [SITE-07]
dependency_graph:
  requires:
    - 26-01 (Badge variant additions)
    - 26-CONTEXT.md / 26-UI-SPEC.md / 26-RESEARCH.md / 26-PATTERNS.md
  provides:
    - "Collection Listing recomposed to Pencil spec across all 5 factory-driven routes (/configs, /hooks, /guides, /skills, /posts)"
    - "Deterministic empty-state verification pattern (mocked getCollection + renderToStaticMarkup) for future collection-route tests"
  affects:
    - apps/blakepetersen.io/src/app/configs/page.tsx (inherits)
    - apps/blakepetersen.io/src/app/hooks/page.tsx (inherits)
    - apps/blakepetersen.io/src/app/guides/page.tsx (inherits)
    - apps/blakepetersen.io/src/app/skills/page.tsx (inherits)
    - apps/blakepetersen.io/src/app/posts/page.tsx (inherits)
tech_stack:
  added: []
  patterns:
    - "Single-factory propagation: edit createCollectionIndexPage once → 5 listing routes recompose with zero per-route edits (Phase 22 factory pattern honored)"
    - "Empty-state unit test via mocked getCollection returning [] + renderToStaticMarkup — replaces destructive content-deletion manual verification"
    - "next/link mocked to plain <a> for SSR renderToStaticMarkup in jest env=node (avoids circular-ref on JSON.stringify of React trees containing Link)"
key_files:
  created:
    - apps/blakepetersen.io/tests/lib/collection-pages.test.tsx
  modified:
    - apps/blakepetersen.io/src/lib/collection-pages.tsx
decisions:
  - "Count Badge uses variant=secondary (existing tag-pill visual language) rather than outline — keeps header visual consistent with in-row tag chips; no new Badge variants needed"
  - "Empty-state contribute link targets /start-here (route exists in repo); no /guides/contributing route present"
  - "indexDescription(count) used for the header subtitle paragraph — registry already exposes per-collection one-liners (e.g., 'Browse N Git hooks for automated code quality')"
  - "Typography refresh: row titles promoted from text-sm to text-base font-medium text-foreground; descriptions unified on font-mono text-base text-muted-foreground; caption weight moved from text-sm to text-xs per UI-SPEC"
  - "D-07 visual smoke check deferred to phase-end batch (all 5 factory-driven routes in light/dark together), consistent with 02/03/04/05"
metrics:
  duration_minutes: 18
  completed_date: 2026-04-19
  tasks_completed: 1
  tasks_deferred: 1
  files_modified: 1
  files_created: 1
  tests_added: 4
  tests_total_passing: 214
---

# Phase 26 Plan 06: Collection Listing Factory Recompose + Empty-State Test Summary

Recomposed `createCollectionIndexPage` to the Pencil Collection Listing spec (header caption + label H1 + count Badge + registry description, refined row typography, UI-SPEC empty-state branch) via a single factory edit that propagates to all 5 listing routes. Added a deterministic Jest unit test that mocks `getCollection` to return `[]` and verifies the empty-state branch with `renderToStaticMarkup`, eliminating the need for a destructive dev-time content-deletion step. D-07 light/dark smoke check deferred to phase-end batch.

## What Shipped

**Factory edit (single file, 5 routes inherit):**
- New collection header: `// {slug}` mono caption → `{label}` H1 (`font-mono-alt text-3xl leading-tight`) + count `<Badge variant="secondary">` + `indexDescription(count)` paragraph in `font-mono text-base text-muted-foreground`.
- Empty-state branch (`items.length === 0`): `// empty_collection` caption + label H1 + body `No entries yet. Check back, or contribute one → [contribute]` with Link to `/start-here`.
- Row typography refresh: titles → `text-base font-medium text-foreground group-hover:text-primary`; descriptions → `font-mono text-base text-muted-foreground`; dx-layout tag row switched to `flex-wrap items-center gap-2` so chips wrap cleanly; post-layout date + reading-time + tag-chip cluster preserved.
- Preserved verbatim (D-01): factory signature, `generateMetadata`, canonical URL, `ContentShell` wrapper, `<Link hover:border-primary>` block, `post` vs `dx` branching, all existing `<Badge variant="secondary">{tag}</Badge>` tag-pill sites, server-component contract (no `'use client'`).

**New test (`apps/blakepetersen.io/tests/lib/collection-pages.test.tsx`, 4 cases):**
1. Renders `// empty_collection` caption when getter returns `[]`.
2. Renders `No entries yet. Check back, or contribute one` copy.
3. Renders `[contribute]` anchor with `href="/start-here"`.
4. Renders the collection label in the empty-state heading.

## Deviations from Plan

**Auto-fixed issues**

1. **[Rule 3 — Blocker] Test runner: JSON.stringify circular ref on React trees with `next/link`**
   - **Found during:** Task 1 verification (first jest run)
   - **Issue:** The plan's suggested pattern (`JSON.stringify(tree)` borrowed from `roadmap.test.tsx`) fails with "Converting circular structure to JSON" when the rendered tree contains `<Link>` — Next.js's Link module has a circular `default` reexport.
   - **Fix:** Switched the test to `renderToStaticMarkup(Page() as React.ReactElement)` from `react-dom/server` and added a `jest.mock('next/link')` that returns a plain `<a>` element. This is the same SSR-string pattern used in `packages/artax-ui/tests/components/modal.test.tsx`. The contribute-link assertion was tightened from `"href":"/start-here"` (JSON-shape) to an HTML regex `/<a[^>]*href="\/start-here"/`.
   - **Files modified:** `apps/blakepetersen.io/tests/lib/collection-pages.test.tsx`
   - **Commit:** 34dc42e

No other deviations. Factory structure, branching, and tag-pill consumers preserved exactly per plan.

## Verification Results

| Check | Result |
|-------|--------|
| `pnpm --filter blakepetersen.io typecheck` | exit 0 |
| `pnpm exec jest --testPathPatterns=collection-pages` | 4/4 pass |
| `pnpm exec jest` (full bp.io suite) | 28 suites / 214 tests pass |
| `pnpm --filter blakepetersen.io build` | green; all 5 listing routes prerender static; pagefind index built |
| `grep -c 'variant="secondary"' src/lib/collection-pages.tsx` | pre=2, post=3 (additive count Badge only; Pitfall 5 guard honored) |
| `grep -E 'bg-(amber\|cyan\|emerald\|red\|zinc)-[0-9]'` | no matches (no color literals introduced) |
| `head -3 src/lib/collection-pages.tsx` | no `'use client'` (server component contract preserved) |
| Per-route `page.tsx` diff check | `configs/page.tsx`, `hooks/page.tsx`, `guides/page.tsx`, `skills/page.tsx`, `posts/page.tsx` all UNMODIFIED (grep of commit diff confirms only `src/lib/collection-pages.tsx` + `tests/lib/collection-pages.test.tsx` changed) |

## Key Artifacts

- **Modified:** `apps/blakepetersen.io/src/lib/collection-pages.tsx` — `createCollectionIndexPage` factory recomposed (header, empty-state, row typography). `createCollectionDetailPage` untouched.
- **Created:** `apps/blakepetersen.io/tests/lib/collection-pages.test.tsx` — 4 empty-state cases via mocked registry + SSR render.

## Known Stubs

None. The factory reads `collection.indexDescription(count)` from the real registry — every collection ships a real one-liner. The contribute link points to `/start-here` (route exists). No hardcoded empty arrays, no placeholder copy.

## Deferred

**Task 2 — D-07 light/dark smoke check across all 5 routes** — deferred to phase-end batch verification alongside 26-02/03/04/05 (consistent with each of those plans' handling; batching produces one reviewer session for all Phase 26 routes rather than five separate visual passes).

Non-empty visual render is covered by the successful prerendering of all 5 listing routes during `pnpm build` (HTML emitted without warnings). The empty-state branch is now fully owned by the unit test — the destructive content-deletion manual step has been eliminated.

## Commits

- `34dc42e` feat(26-06): recompose collection listing factory per Pencil (SITE-07)

## Self-Check: PASSED

- FOUND: `apps/blakepetersen.io/src/lib/collection-pages.tsx` (modified, contains `createCollectionIndexPage`, `// empty_collection`, `items.length === 0`, count Badge, all existing `variant="secondary"` tag pills).
- FOUND: `apps/blakepetersen.io/tests/lib/collection-pages.test.tsx` (new, 4 passing cases, contains `getter: () => []`).
- FOUND: commit `34dc42e` in `git log`.
- Verified: `pnpm exec jest` → 214/214 pass. `pnpm --filter blakepetersen.io build` → green, all 5 listing routes prerender.
- Verified: no per-route `page.tsx` files in commit diff (factory-only change).
- Verified: pre-edit `variant="secondary"` count = 2, post-edit = 3 (Pitfall 5 guard: additive only).
