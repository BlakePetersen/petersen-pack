---
phase: 06-site-navigation
plan: 02
subsystem: ui
tags: [breadcrumbs, pagination, table-of-contents, scroll-spy, intersection-observer, useSyncExternalStore]

requires:
  - phase: 06-site-navigation
    provides: "ContentShell with TOC slot, buildNavSections, getPrevNext, heading IDs via rehype-slug"
provides:
  - "Terminal-styled breadcrumb trail on detail pages"
  - "Prev/next page navigation within content type"
  - "Right-side table of contents with scroll spy highlighting"
  - "useActiveHeading hook for IntersectionObserver scroll tracking"
affects: [07-search]

tech-stack:
  added: []
  patterns: [useSyncExternalStore for DOM-derived state, IntersectionObserver scroll spy]

key-files:
  created:
    - apps/blakepetersen.io/src/components/breadcrumbs.tsx
    - apps/blakepetersen.io/src/components/page-navigation.tsx
    - apps/blakepetersen.io/src/components/table-of-contents.tsx
    - apps/blakepetersen.io/src/hooks/use-active-heading.ts
    - apps/blakepetersen.io/tests/breadcrumbs.test.ts
  modified:
    - apps/blakepetersen.io/src/components/dx-content-layout.tsx
    - apps/blakepetersen.io/src/components/post-layout.tsx
    - apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx
    - apps/blakepetersen.io/src/app/hooks/[...slug]/page.tsx
    - apps/blakepetersen.io/src/app/configs/[...slug]/page.tsx
    - apps/blakepetersen.io/src/app/guides/[...slug]/page.tsx
    - apps/blakepetersen.io/src/app/posts/[...slug]/page.tsx

key-decisions:
  - "useSyncExternalStore for TOC heading extraction instead of useState+useEffect (react-hooks/set-state-in-effect lint rule)"

patterns-established:
  - "useSyncExternalStore with MutationObserver for DOM-derived client state"
  - "Breadcrumb path derived from URL segments with hyphen-to-space formatting"

requirements-completed: [SITE-04, SITE-07]

duration: 6min
completed: 2026-03-08
---

# Phase 6 Plan 2: In-Page Navigation Summary

**Terminal-styled breadcrumbs, prev/next page links, and right-side table of contents with IntersectionObserver scroll spy**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-08T07:15:02Z
- **Completed:** 2026-03-08T07:21:25Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Breadcrumb trail in `// collection / page-name` format on all detail pages
- Prev/next page navigation at bottom of content, within same content type
- Table of contents on right side (xl+ screens) with h2/h3 headings and scroll spy
- 6 breadcrumb tests passing, all 77 project tests green

## Task Commits

Each task was committed atomically:

1. **Task 1: Breadcrumbs, prev/next navigation, and tests** - `4cac096` (test) + `0831917` (feat)
2. **Task 2: Table of contents, scroll spy, and route integration** - `2fac567` (feat)

## Files Created/Modified
- `src/components/breadcrumbs.tsx` - Terminal-styled breadcrumb trail with buildBreadcrumbs() helper
- `src/components/page-navigation.tsx` - Prev/next links using navigation.ts helpers
- `src/components/table-of-contents.tsx` - Right-side TOC with useSyncExternalStore DOM extraction
- `src/hooks/use-active-heading.ts` - IntersectionObserver scroll spy hook
- `tests/breadcrumbs.test.ts` - 6 tests for buildBreadcrumbs path builder
- `src/components/dx-content-layout.tsx` - Added Breadcrumbs and PageNavigation
- `src/components/post-layout.tsx` - Added Breadcrumbs, PageNavigation, and slug prop
- All 5 detail route pages - Added TableOfContents to ContentShell toc slot

## Decisions Made
- Used useSyncExternalStore with MutationObserver for TOC heading extraction instead of useState+useEffect, because react-hooks/set-state-in-effect lint rule prohibits setState directly within an effect body

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used useSyncExternalStore instead of useState+useEffect for TOC**
- **Found during:** Task 2 (Table of contents)
- **Issue:** react-hooks/set-state-in-effect lint rule rejected setState(entries) inside useEffect
- **Fix:** Replaced with useSyncExternalStore + MutationObserver subscribe + cached snapshot
- **Files modified:** apps/blakepetersen.io/src/components/table-of-contents.tsx
- **Verification:** ESLint passes, build succeeds
- **Committed in:** 2fac567

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Lint-compliant pattern achieves same behavior with better React integration. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All in-page navigation complete (breadcrumbs, prev/next, TOC)
- Phase 06 fully complete: sidebar, drawer, heading anchors, breadcrumbs, prev/next, TOC
- Ready for Phase 07 (search)

---
*Phase: 06-site-navigation*
*Completed: 2026-03-08*
