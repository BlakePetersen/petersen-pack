---
phase: 05-site-shell
plan: 01
subsystem: ui
tags: [next.js, mdx, layout, header, footer, responsive]

requires:
  - phase: 02-design-system
    provides: artax-ui mdxComponents, terminal design tokens
  - phase: 04-content-rendering
    provides: Velite MDX code string compilation
provides:
  - Sticky terminal-styled header with site branding
  - Terminal-styled footer with command links
  - MDXContent client component for rendering Velite MDX code strings
  - Root layout with header, footer, responsive font sizing
  - Terminal-styled 404 page
affects: [05-site-shell, 06-navigation, 07-seo]

tech-stack:
  added: []
  patterns: [flex-column sticky footer, createElement for dynamic MDX components, responsive text sizing]

key-files:
  created:
    - apps/blakepetersen.io/src/components/mdx-content.tsx
    - apps/blakepetersen.io/src/components/header.tsx
    - apps/blakepetersen.io/src/components/footer.tsx
    - apps/blakepetersen.io/src/app/not-found.tsx
  modified:
    - apps/blakepetersen.io/src/app/layout.tsx
    - packages/artax-ui/src/mdx/components.tsx

key-decisions:
  - "createElement used instead of JSX for dynamic MDX component to satisfy react-hooks/static-components lint rule"
  - "MDX component Props type changed from ComponentPropsWithoutRef<'div'> to HTMLAttributes<HTMLElement> for cross-element compatibility"

patterns-established:
  - "MDXContent pattern: useMemo + createElement for rendering Velite MDX code strings"
  - "Site chrome pattern: Header/Footer imported in root layout with flex-col min-h-screen sticky footer"

requirements-completed: [SITE-01, SITE-10]

duration: 7min
completed: 2026-03-08
---

# Phase 5 Plan 1: Site Shell Summary

**Sticky terminal header, command-style footer, MDX rendering component, and responsive root layout with 404 page**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-08T05:26:57Z
- **Completed:** 2026-03-08T05:34:05Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Sticky header with "// blake_petersen" branding and nav placeholder for Phase 6
- Footer with terminal command links ($ github, $ rss) and copyright
- MDXContent client component using useMemo + createElement for Velite code string rendering
- Root layout with flex-column sticky footer, responsive 14px/16px font sizing
- Terminal-styled 404 page with "cd /" link back to homepage

## Task Commits

Each task was committed atomically:

1. **Task 1: Create MDXContent, header, footer, and not-found** - `66577f1` (feat)
2. **Task 2: Update root layout with header, footer, and responsive structure** - `2ce8eba` (feat)

## Files Created/Modified
- `apps/blakepetersen.io/src/components/mdx-content.tsx` - Client component rendering Velite MDX code strings
- `apps/blakepetersen.io/src/components/header.tsx` - Sticky terminal-styled header with site branding
- `apps/blakepetersen.io/src/components/footer.tsx` - Terminal-styled footer with command links
- `apps/blakepetersen.io/src/app/not-found.tsx` - Terminal-styled 404 page
- `apps/blakepetersen.io/src/app/layout.tsx` - Root layout with header, footer, responsive sizing
- `packages/artax-ui/src/mdx/components.tsx` - Fixed Props type for cross-element compatibility

## Decisions Made
- Used `createElement` instead of JSX for dynamic MDX component to satisfy `react-hooks/static-components` lint rule
- Changed MDX component `Props` type from `ComponentPropsWithoutRef<'div'>` to `HTMLAttributes<HTMLElement>` for cross-element compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed MDX component Props type incompatibility**
- **Found during:** Task 2 verification (build)
- **Issue:** `Props` type based on `ComponentPropsWithoutRef<'div'>` was incompatible with ul, ol, li, blockquote elements due to event handler type mismatches
- **Fix:** Changed Props to use `HTMLAttributes<HTMLElement>` which is compatible with all HTML elements
- **Files modified:** packages/artax-ui/src/mdx/components.tsx
- **Verification:** Build succeeds
- **Committed in:** `e85aa76`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Pre-existing type error that blocked builds. Fix is minimal and correct.

## Issues Encountered
- ESLint `react-hooks/static-components` rule rejected both direct and useMemo-based dynamic component creation - resolved by using `createElement` instead of JSX
- ESLint `react/jsx-no-comment-textnodes` flagged `//` inside JSX span text - resolved by using JSX expression `{'// '}`

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Site shell (header, footer, layout) ready for Plan 02 to add homepage and content routes
- MDXContent component ready to render any Velite-compiled MDX content
- Nav placeholder in header ready for Phase 6 navigation

---
*Phase: 05-site-shell*
*Completed: 2026-03-08*
