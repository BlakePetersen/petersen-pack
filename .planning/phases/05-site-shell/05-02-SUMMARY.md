---
phase: 05-site-shell
plan: 02
subsystem: ui
tags: [next.js, app-router, static-generation, velite, mdx, responsive]

requires:
  - phase: 05-site-shell
    provides: MDXContent component, header, footer, root layout
  - phase: 03-content-engine
    provides: Velite content collections and getter functions
  - phase: 04-content-rendering
    provides: DependencyGraph component, shiki code blocks
provides:
  - Homepage with category card grid and recent posts
  - 5 listing pages for all content types
  - 5 detail pages with static generation via generateStaticParams
  - DxContentLayout shared component for DX content types
  - PostLayout shared component for blog posts
  - CategoryCard component for homepage grid
  - VeliteWebpackPlugin for synchronous content builds
affects: [06-navigation, 07-seo, 08-comments]

tech-stack:
  added: []
  patterns: [VeliteWebpackPlugin for synchronous build, catch-all routes for nested slugs, slug prefix stripping for URL mapping]

key-files:
  created:
    - apps/blakepetersen.io/src/components/category-card.tsx
    - apps/blakepetersen.io/src/components/dx-content-layout.tsx
    - apps/blakepetersen.io/src/components/post-layout.tsx
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
  modified:
    - apps/blakepetersen.io/src/app/page.tsx
    - apps/blakepetersen.io/next.config.ts
    - apps/blakepetersen.io/package.json

key-decisions:
  - "VeliteWebpackPlugin replaces fire-and-forget async build for reliable content availability"
  - "Build uses --webpack flag since Turbopack (Next.js 16 default) does not support Velite import attributes"

patterns-established:
  - "Route pattern: listing at /collection, detail at /collection/[...slug] with generateStaticParams"
  - "Slug handling: Velite slugs include collection prefix, stripped for URL, reconstructed for lookup"
  - "DX content types share DxContentLayout; posts use PostLayout"

requirements-completed: [SITE-01, SITE-09, SITE-10]

duration: 12min
completed: 2026-03-08
---

# Phase 5 Plan 2: Content Routes Summary

**Homepage with category grid and 10 content route pages (5 listing + 5 detail) with full static generation**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-08T05:36:34Z
- **Completed:** 2026-03-08T05:48:51Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- Homepage with 4 category cards (skills, hooks, configs, guides) showing dynamic counts and recent items
- 5 listing pages with terminal aesthetic, tag badges, and hover effects
- 5 detail pages with catch-all routes, static generation, and proper slug handling
- Fixed Velite + Next.js 16 build by replacing async build with VeliteWebpackPlugin

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared layout components and homepage** - `d597a1a` (feat)
2. **Task 2: Create all content routes with static generation** - `ec3ce2f` (feat)

## Files Created/Modified
- `apps/blakepetersen.io/src/components/category-card.tsx` - Homepage category card with terminal aesthetic
- `apps/blakepetersen.io/src/components/dx-content-layout.tsx` - Shared layout for DX content (skills, hooks, configs, guides)
- `apps/blakepetersen.io/src/components/post-layout.tsx` - Blog-style layout for posts
- `apps/blakepetersen.io/src/app/page.tsx` - Homepage with category grid and recent posts
- `apps/blakepetersen.io/src/app/skills/page.tsx` - Skills listing page
- `apps/blakepetersen.io/src/app/skills/[...slug]/page.tsx` - Skill detail page
- `apps/blakepetersen.io/src/app/hooks/page.tsx` - Hooks listing page
- `apps/blakepetersen.io/src/app/hooks/[...slug]/page.tsx` - Hook detail page
- `apps/blakepetersen.io/src/app/configs/page.tsx` - Configs listing page
- `apps/blakepetersen.io/src/app/configs/[...slug]/page.tsx` - Config detail page
- `apps/blakepetersen.io/src/app/guides/page.tsx` - Guides listing page
- `apps/blakepetersen.io/src/app/guides/[...slug]/page.tsx` - Guide detail page
- `apps/blakepetersen.io/src/app/posts/page.tsx` - Posts listing page
- `apps/blakepetersen.io/src/app/posts/[...slug]/page.tsx` - Post detail page
- `apps/blakepetersen.io/next.config.ts` - VeliteWebpackPlugin for synchronous builds
- `apps/blakepetersen.io/package.json` - Build script uses --webpack flag

## Decisions Made
- Used VeliteWebpackPlugin (synchronous via beforeCompile hook) instead of fire-and-forget async build, ensuring content JSON files exist before webpack resolves imports
- Build uses `--webpack` flag since Next.js 16 defaults to Turbopack which does not support the `with { type: 'json' }` import attribute syntax generated by Velite 0.3.x

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Velite + Next.js 16 Turbopack build incompatibility**
- **Found during:** Task 2 verification (build)
- **Issue:** Next.js 16 defaults to Turbopack for builds, which cannot resolve Velite's `with { type: 'json' }` import attributes. Additionally, the previous async `import('velite').then(...)` approach was a race condition.
- **Fix:** Replaced async build trigger with VeliteWebpackPlugin using webpack's beforeCompile hook for synchronous content build. Added `--webpack` flag to build script.
- **Files modified:** apps/blakepetersen.io/next.config.ts, apps/blakepetersen.io/package.json
- **Verification:** `pnpm build` succeeds with all routes statically generated
- **Committed in:** ec3ce2f

**2. [Rule 1 - Bug] Added explicit type annotations for tag map callbacks**
- **Found during:** Task 2 verification (tsc --noEmit)
- **Issue:** `item.tags.map((tag) => ...)` triggered TS7006 implicit any errors across all 5 listing pages
- **Fix:** Added `(tag: string)` type annotation
- **Files modified:** All 5 listing page files
- **Committed in:** ec3ce2f

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for build to succeed. No scope creep.

## Issues Encountered
- Velite 0.3.x generates `with { type: 'json' }` import attributes in its index.js, which neither Turbopack nor webpack 5 (without experiments flag) supports out of the box. Resolved by using VeliteWebpackPlugin with the `--webpack` flag.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All content routes complete and statically generated
- Homepage with category grid ready for navigation integration (Phase 6)
- All pages accessible at their URLs for SEO work (Phase 7)

## Self-Check: PASSED

All 15 created files verified present. Both task commits (d597a1a, ec3ce2f) verified in git log.

---
*Phase: 05-site-shell*
*Completed: 2026-03-08*
