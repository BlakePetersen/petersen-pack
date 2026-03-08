---
phase: 07-site-discovery
plan: 01
subsystem: seo
tags: [rss, sitemap, robots, json-ld, schema-dts, metadata, seo]

requires:
  - phase: 05-site-shell
    provides: "App Router layout, content routes, footer component"
  - phase: 03-content-engine
    provides: "Velite collection getters for all 5 content types"
provides:
  - "Root layout with metadataBase and title template for all pages"
  - "RSS 2.0 feed at /feed.xml with all content types"
  - "Dynamic sitemap.xml listing all content URLs"
  - "Robots.txt allowing all crawlers"
  - "JSON-LD component for structured data injection"
  - "Metadata helper library (buildMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd, escapeXml)"
affects: [07-02-route-metadata, 07-03-og-images]

tech-stack:
  added: [schema-dts]
  patterns: [build-time-feed-generation, metadata-helper-pattern]

key-files:
  created:
    - apps/blakepetersen.io/src/lib/metadata.ts
    - apps/blakepetersen.io/src/components/json-ld.tsx
    - apps/blakepetersen.io/src/app/sitemap.ts
    - apps/blakepetersen.io/src/app/robots.ts
    - apps/blakepetersen.io/src/app/feed.xml/route.ts
    - apps/blakepetersen.io/tests/sitemap.test.ts
    - apps/blakepetersen.io/tests/feed.test.ts
  modified:
    - apps/blakepetersen.io/src/app/layout.tsx
    - apps/blakepetersen.io/src/components/footer.tsx

key-decisions:
  - "Posts sorted by date descending appear before DX content (dateless) in RSS feed"
  - "Sitemap uses new Date() placeholder for lastModified (git dates are a future optimization)"
  - "escapeXml shared between feed generation and future XML needs"

patterns-established:
  - "buildMetadata helper pattern for route-level generateMetadata consumption"
  - "JSON-LD server component pattern with script injection and < escaping"

requirements-completed: [SITE-05, SITE-06]

duration: 13min
completed: 2026-03-08
---

# Phase 7 Plan 01: SEO Infrastructure Summary

**Root layout metadata, RSS 2.0 feed at /feed.xml, sitemap.xml, robots.txt, JSON-LD component, and metadata helper library using schema-dts**

## Performance

- **Duration:** 13 min
- **Started:** 2026-03-08T08:17:40Z
- **Completed:** 2026-03-08T08:30:40Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Root layout enhanced with metadataBase, title template, and RSS alternate link
- RSS 2.0 feed at /feed.xml serves all 5 content types with XML escaping and ~300 char excerpts
- Dynamic sitemap.xml covers homepage, 5 listing pages, and all content items
- Robots.txt allows all crawlers and references sitemap
- JSON-LD component and metadata helpers ready for route-level consumption in Plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: SEO infrastructure - root layout, metadata helpers, JSON-LD, sitemap, robots** - `8d58610` (feat)
2. **Task 2: RSS 2.0 feed at /feed.xml** - `a8f21e6` (feat)

## Files Created/Modified
- `apps/blakepetersen.io/src/lib/metadata.ts` - buildMetadata, buildArticleJsonLd, buildBreadcrumbJsonLd, escapeXml helpers
- `apps/blakepetersen.io/src/components/json-ld.tsx` - Server component for JSON-LD structured data
- `apps/blakepetersen.io/src/app/sitemap.ts` - Dynamic sitemap from Velite collections
- `apps/blakepetersen.io/src/app/robots.ts` - Robots.txt allowing all crawlers
- `apps/blakepetersen.io/src/app/feed.xml/route.ts` - RSS 2.0 feed with static generation
- `apps/blakepetersen.io/src/app/layout.tsx` - Added metadataBase, title template, RSS alternate
- `apps/blakepetersen.io/src/components/footer.tsx` - RSS link changed from /rss to /feed.xml
- `apps/blakepetersen.io/tests/sitemap.test.ts` - 6 tests for sitemap and metadata helpers
- `apps/blakepetersen.io/tests/feed.test.ts` - 7 tests for RSS feed

## Decisions Made
- Posts sorted by date descending appear before DX content (dateless) in RSS feed
- Sitemap uses new Date() placeholder for lastModified (git dates are a future optimization)
- escapeXml shared between feed generation and future XML needs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing test failure in code-highlight.test.ts (JSON parse error in Velite build) - unrelated to this plan's changes, not addressed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Metadata helpers (buildMetadata, buildArticleJsonLd) ready for Plan 02 route-level consumption
- JSON-LD component ready for structured data on all content pages
- No blockers for Plan 02

---
*Phase: 07-site-discovery*
*Completed: 2026-03-08*
