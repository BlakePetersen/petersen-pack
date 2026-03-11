---
phase: 09-community-engagement
plan: 02
subsystem: ui
tags: [giscus, react-context, community, comments, reactions]

requires:
  - phase: 09-01
    provides: GiscusComments, DiscussionSection, ReportProblemLink components
provides:
  - ReactionCount component with context-based state lifting
  - DiscussionWithReactions client wrapper for giscus metadata
  - Discussion sections wired into DX content and blog post layouts
  - Live reaction count in header metadata on all content pages
affects: [10-github-integration]

tech-stack:
  added: []
  patterns: [react-context-state-lifting, client-leaf-in-server-layout]

key-files:
  created:
    - apps/blakepetersen.io/src/components/reaction-count.tsx
    - apps/blakepetersen.io/src/components/content-with-discussion.tsx
    - apps/blakepetersen.io/tests/reaction-count.test.tsx
  modified:
    - apps/blakepetersen.io/src/components/dx-content-layout.tsx
    - apps/blakepetersen.io/src/components/post-layout.tsx
    - apps/blakepetersen.io/src/components/giscus-comments.tsx
    - apps/blakepetersen.io/src/components/discussion-section.tsx
    - apps/blakepetersen.io/tests/giscus-comments.test.tsx
    - apps/blakepetersen.io/next.config.ts

key-decisions:
  - "React Context lifts reaction count from giscus iframe at page bottom to header metadata at top"
  - "Switched from specific mapping to pathname mapping for giscus discussions"
  - "Environment variable fallback for giscus theme URL (dark_tritanopia when NEXT_PUBLIC_SITE_URL unset)"

patterns-established:
  - "Client leaf nodes in server layouts: ReactionCountProvider, ReactionCount, DiscussionWithReactions imported as client components into server layout files"
  - "React Context for cross-component state: useReactionCount hook pattern for lifting state across distant DOM positions"

requirements-completed: [COMM-05]

duration: 15min
completed: 2026-03-11
---

# Phase 09 Plan 02: Layout Integration Summary

**Discussion sections and live reaction counts wired into all DX content and blog post layouts via React Context state lifting**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3 (including checkpoint verification)
- **Files created:** 3
- **Files modified:** 6

## Accomplishments
- ReactionCount component displays thumbs-up count (including zero) in header metadata
- React Context (ReactionCountProvider/useReactionCount) lifts reaction count from giscus iframe to header
- DiscussionWithReactions client wrapper wires giscus onMetadata callback to context
- Both DxContentLayout and PostLayout render discussion sections before PageNavigation
- Switched giscus from specific/term mapping to pathname mapping with real repo/category IDs
- Environment-aware giscus theme (custom CSS in production, dark_tritanopia fallback in dev)

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): ReactionCount + DiscussionWithReactions tests** - `a3208bc` (test)
2. **Task 1 (GREEN): ReactionCount + DiscussionWithReactions implementation** - `6d981dd` (feat)
3. **Task 2: Wire into both layouts** - `da2a55a` (feat)
4. **Task 3: Post-checkpoint fixes (pathname mapping, real IDs, test updates)** - `be09325` (fix)

## Files Created/Modified
- `reaction-count.tsx` - Client component with ReactionCountProvider, useReactionCount hook, and ReactionCount display
- `content-with-discussion.tsx` - Client wrapper lifting reaction state from giscus iframe to header via context
- `tests/reaction-count.test.tsx` - Tests for ReactionCount rendering and DiscussionWithReactions wiring
- `dx-content-layout.tsx` - Added ReactionCountProvider, ReactionCount in metadata, DiscussionWithReactions before nav
- `post-layout.tsx` - Same integration as DxContentLayout for blog posts
- `giscus-comments.tsx` - Removed term prop, switched to pathname mapping, added real repo IDs, env-based theme
- `discussion-section.tsx` - Removed term prop pass-through
- `tests/giscus-comments.test.tsx` - Updated for pathname mapping and env-based theme tests
- `next.config.ts` - Added turbopack config for Next.js 16 dev server compatibility

## Decisions Made
- React Context chosen over prop drilling for reaction count state (spans header to page bottom)
- Pathname mapping preferred over specific/term mapping for giscus (simpler, no slug wiring needed)
- Environment variable fallback ensures giscus theme works in both local dev and production

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated tests for removed term prop**
- **Found during:** Task 3 continuation (post-checkpoint)
- **Issue:** Orchestrator removed `term` prop from GiscusComments but reaction-count tests still expected it
- **Fix:** Updated mock and assertion in reaction-count.test.tsx to match new prop signature
- **Files modified:** tests/reaction-count.test.tsx
- **Committed in:** be09325

**2. [Rule 1 - Bug] Updated giscus theme test for env var fallback**
- **Found during:** Task 3 continuation (post-checkpoint)
- **Issue:** Theme test expected `giscus-theme.css` but env var unset in test causes `dark_tritanopia` fallback
- **Fix:** Split into two tests: one for fallback, one with env var set
- **Files modified:** tests/giscus-comments.test.tsx
- **Committed in:** be09325

---

**Total deviations:** 2 auto-fixed (2 bugs in tests after orchestrator's post-checkpoint changes)
**Impact on plan:** Both fixes necessary for test correctness. No scope creep.

## Issues Encountered
- Pre-existing sitemap.test.ts failures (4 tests) due to missing `getAllGitHistory` mock from phase 08-03. Not caused by this plan. Logged to `deferred-items.md`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Community engagement fully integrated into all content pages
- Phase 09 complete -- ready for Phase 10 (GitHub Integration)
- Pre-existing sitemap test failure should be addressed in a future plan

---
*Phase: 09-community-engagement*
*Completed: 2026-03-11*
