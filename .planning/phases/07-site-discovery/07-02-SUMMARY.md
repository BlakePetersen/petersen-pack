---
phase: 07-site-discovery
plan: 02
subsystem: seo
tags: [metadata, json-ld, schema-dts, generateMetadata, seo, breadcrumbs]

requires:
  - phase: 07-site-discovery
    provides: "buildMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd helpers and JsonLd component"
  - phase: 03-content-engine
    provides: "Velite collection getters for all 5 content types"
provides:
  - "generateMetadata on all 10 content routes (5 listing + 5 detail)"
  - "TechArticle + BreadcrumbList JSON-LD on all 5 detail pages"
  - "Listing page descriptions with dynamic item counts"
affects: [07-03-og-images]

tech-stack:
  added: []
  patterns: [route-level-generateMetadata, json-ld-injection]

key-files:
  created:
    - apps/blakepetersen.io/tests/metadata.test.ts
    - apps/blakepetersen.io/tests/structured-data.test.ts
  modified:
    - apps/blakepetersen.io/src/app/skills/page.tsx
    - apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx
    - apps/blakepetersen.io/src/app/hooks/page.tsx
    - apps/blakepetersen.io/src/app/hooks/[...slug]/page.tsx
    - apps/blakepetersen.io/src/app/configs/page.tsx
    - apps/blakepetersen.io/src/app/configs/[...slug]/page.tsx
    - apps/blakepetersen.io/src/app/guides/page.tsx
    - apps/blakepetersen.io/src/app/guides/[...slug]/page.tsx
    - apps/blakepetersen.io/src/app/posts/page.tsx
    - apps/blakepetersen.io/src/app/posts/[...slug]/page.tsx
    - apps/blakepetersen.io/src/lib/search.ts

key-decisions:
  - "Listing page descriptions use dynamic item count from collection getters"
  - "search.ts pagefind import uses variable to avoid TypeScript module resolution on string literal"

patterns-established:
  - "Detail page pattern: generateMetadata + two JsonLd components (TechArticle + BreadcrumbList) before layout component"
  - "Listing page pattern: generateMetadata with collection count in description and canonical URL"

requirements-completed: [SITE-05]

duration: 22min
completed: 2026-03-08
---

# Phase 7 Plan 02: Route Metadata and JSON-LD Summary

**generateMetadata with SEO fallbacks on all 10 content routes, plus TechArticle and BreadcrumbList JSON-LD structured data on all 5 detail pages**

## Performance

- **Duration:** 22 min
- **Started:** 2026-03-08T08:34:37Z
- **Completed:** 2026-03-08T08:56:37Z
- **Tasks:** 1
- **Files modified:** 13

## Accomplishments
- All 5 detail pages export generateMetadata using buildMetadata with seo_title/seo_description fallbacks
- All 5 detail pages render TechArticle + BreadcrumbList JSON-LD via JsonLd component
- All 5 listing pages export generateMetadata with title, canonical URL, and dynamic item count in description
- 13 unit tests for metadata helpers and JSON-LD generation

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Tests for metadata and structured data** - `f4d89f7` (test)
2. **Task 1 (GREEN): generateMetadata and JSON-LD on all routes** - `22d25b2` (feat)

## Files Created/Modified
- `apps/blakepetersen.io/tests/metadata.test.ts` - Unit tests for buildMetadata helper
- `apps/blakepetersen.io/tests/structured-data.test.ts` - Unit tests for JSON-LD generation
- `apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx` - generateMetadata + JSON-LD
- `apps/blakepetersen.io/src/app/skills/page.tsx` - generateMetadata with item count
- `apps/blakepetersen.io/src/app/hooks/[...slug]/page.tsx` - generateMetadata + JSON-LD
- `apps/blakepetersen.io/src/app/hooks/page.tsx` - generateMetadata with item count
- `apps/blakepetersen.io/src/app/configs/[...slug]/page.tsx` - generateMetadata + JSON-LD
- `apps/blakepetersen.io/src/app/configs/page.tsx` - generateMetadata with item count
- `apps/blakepetersen.io/src/app/guides/[...slug]/page.tsx` - generateMetadata + JSON-LD
- `apps/blakepetersen.io/src/app/guides/page.tsx` - generateMetadata with item count
- `apps/blakepetersen.io/src/app/posts/[...slug]/page.tsx` - generateMetadata + JSON-LD
- `apps/blakepetersen.io/src/app/posts/page.tsx` - generateMetadata with item count
- `apps/blakepetersen.io/src/lib/search.ts` - Fix pagefind import for TypeScript strict mode

## Decisions Made
- Listing page descriptions use dynamic item count from collection getters
- search.ts pagefind import uses variable to avoid TypeScript module resolution on string literal

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed search.ts pagefind import TypeScript error**
- **Found during:** Task 1 (build verification)
- **Issue:** @ts-expect-error directive on pagefind import was flagged as unused in cached builds but required for clean builds
- **Fix:** Refactored to use a variable for the import path, avoiding TypeScript's string literal module resolution
- **Files modified:** apps/blakepetersen.io/src/lib/search.ts
- **Verification:** TypeScript compilation passes cleanly
- **Committed in:** 22d25b2 (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary for build to pass. No scope creep.

## Issues Encountered
- Pre-existing build failure during static page generation for opengraph-image routes (missing build-manifest.json) -- unrelated to this plan's changes, from plan 07-03/07-04 work. TypeScript compilation and all tests pass.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All routes have SEO metadata and structured data
- Ready for OG image generation (Plan 03) and any remaining discovery tasks
- No blockers for next plan

## Self-Check: PASSED

All 12 modified/created files verified on disk. Both commit hashes (f4d89f7, 22d25b2) confirmed in git log.

---
*Phase: 07-site-discovery*
*Completed: 2026-03-08*
