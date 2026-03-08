---
phase: 06-site-navigation
plan: 01
subsystem: ui
tags: [sidebar, navigation, radix-dialog, rehype-slug, mdx, clipboard-api]

requires:
  - phase: 05-site-shell
    provides: "Content routes, DxContentLayout, PostLayout, Header, MDXContent"
provides:
  - "Three-column ContentShell layout (sidebar | content | TOC slot)"
  - "Sidebar with 5 collapsible sections and active page highlighting"
  - "Mobile drawer navigation via Radix Dialog"
  - "Heading anchor links with clipboard copy on h2/h3"
  - "Navigation data helpers (buildNavSections, getPrevNext)"
affects: [06-site-navigation, 07-search]

tech-stack:
  added: [rehype-slug]
  patterns: [server-client component split for sidebar, pathname-based state derivation for drawer close]

key-files:
  created:
    - apps/blakepetersen.io/src/lib/navigation.ts
    - apps/blakepetersen.io/src/components/content-shell.tsx
    - apps/blakepetersen.io/src/components/sidebar.tsx
    - apps/blakepetersen.io/src/components/sidebar-nav.tsx
    - apps/blakepetersen.io/src/components/sidebar-drawer.tsx
    - apps/blakepetersen.io/src/components/heading-anchor.tsx
    - apps/blakepetersen.io/tests/navigation.test.ts
  modified:
    - apps/blakepetersen.io/velite.config.ts
    - apps/blakepetersen.io/src/components/mdx-content.tsx
    - apps/blakepetersen.io/src/components/header.tsx
    - apps/blakepetersen.io/src/app/globals.css
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

key-decisions:
  - "Plain state with pathname comparison for drawer close instead of useEffect/useRef (React strict mode lint rules)"
  - "SidebarNav uses controlled state array for multi-expand instead of Radix AccordionInteractive"

patterns-established:
  - "Server/client split: Sidebar (server) builds data, SidebarNav (client) handles interactivity"
  - "ContentShell pattern: all content pages wrap in ContentShell with sidebar prop"
  - "Heading anchors: MDX h2/h3 overrides with HeadingAnchor for deep linking"

requirements-completed: [SITE-03, SITE-08]

duration: 8min
completed: 2026-03-08
---

# Phase 6 Plan 1: Site Navigation Summary

**Sidebar navigation with 5 collapsible sections, mobile drawer, three-column layout shell, and heading anchor links with clipboard copy**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-08T07:02:55Z
- **Completed:** 2026-03-08T07:11:00Z
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- Navigation lib with buildNavSections() and getPrevNext() with 8 passing tests
- Three-column ContentShell layout wrapping all 10 content route pages
- Sidebar with 5 collapsible sections, active page amber highlighting, auto-expand
- Mobile hamburger drawer using Radix Dialog with slide-in animation
- Heading anchors on h2/h3 with clipboard URL copy and visual confirmation
- rehype-slug for automatic heading ID generation

## Task Commits

Each task was committed atomically:

1. **Task 1: Navigation helpers, rehype-slug, and heading anchors** - `b96bf76` (feat + test)
2. **Task 2: Sidebar, mobile drawer, content shell, and route integration** - `aef44d5` (feat)

## Files Created/Modified
- `src/lib/navigation.ts` - NavItem/NavSection types, buildNavSections(), getPrevNext()
- `src/components/content-shell.tsx` - Three-column layout wrapper
- `src/components/sidebar.tsx` - Server component building sidebar data
- `src/components/sidebar-nav.tsx` - Client component with collapse/expand and active state
- `src/components/sidebar-drawer.tsx` - Mobile drawer with Radix Dialog
- `src/components/heading-anchor.tsx` - Anchor link with clipboard copy
- `src/components/mdx-content.tsx` - h2/h3 overrides with HeadingAnchor
- `src/components/header.tsx` - Added SidebarDrawer trigger
- `velite.config.ts` - Added rehype-slug before rehypeShiki
- `tests/navigation.test.ts` - 8 tests for navigation helpers
- All 10 route pages wrapped in ContentShell

## Decisions Made
- Used plain state with pathname comparison for drawer close-on-navigate instead of useEffect (React strict lint rules prohibit setState in effects) or useRef (strict lint prohibits ref access during render)
- Used controlled state array for sidebar sections instead of Radix AccordionInteractive, giving simpler multi-expand behavior with auto-expand on current section

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed sidebar drawer close-on-navigate pattern**
- **Found during:** Task 2 (Sidebar drawer)
- **Issue:** useEffect setState pattern rejected by react-hooks/set-state-in-effect lint rule; useRef pattern rejected by react-hooks/refs lint rule
- **Fix:** Used derived state pattern comparing previous pathname via useState
- **Files modified:** apps/blakepetersen.io/src/components/sidebar-drawer.tsx
- **Verification:** ESLint passes, build succeeds

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Lint-compliant pattern achieves same behavior. No scope creep.

## Issues Encountered
- Jest 30 replaced `--testPathPattern` with `--testPathPatterns` (plural). Updated test command accordingly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ContentShell has TOC slot reserved (currently unused) for Plan 02
- Navigation helpers ready for prev/next links
- All content pages have sidebar integration

---
*Phase: 06-site-navigation*
*Completed: 2026-03-08*
