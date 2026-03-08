---
phase: 04-content-rendering
plan: 02
subsystem: content
tags: [dagre, svg, dependency-graph, velite]

requires:
  - phase: 03-content-engine
    provides: "Velite pipeline with DX schemas and prepare hook"
provides:
  - "Graph computation library (buildGraph, getLocalGraph, computeLayout, renderGraphSvg)"
  - "DependencyGraph server component for rendering SVG graphs"
  - "Velite prepare hook generates graph.json with full and per-page SVGs"
  - "Content query helpers for graph data access"
affects: [05-site-shell]

tech-stack:
  added: ["@dagrejs/dagre"]
  patterns: ["Build-time SVG generation via Velite prepare hook", "Map.forEach for iterator compatibility with ts-jest"]

key-files:
  created:
    - "apps/blakepetersen.io/src/lib/graph.ts"
    - "apps/blakepetersen.io/src/components/dependency-graph.tsx"
    - "apps/blakepetersen.io/tests/graph.test.ts"
  modified:
    - "apps/blakepetersen.io/velite.config.ts"
    - "apps/blakepetersen.io/src/lib/content.ts"
    - "apps/blakepetersen.io/jest.config.ts"

key-decisions:
  - "Used Map.forEach instead of for...of iteration due to ts-jest Map iterator incompatibility"
  - "Graph data written to .velite/graph.json as side-effect in prepare hook using process.cwd()"
  - "Local graphs only generated for content with at least one edge (no empty graphs)"

patterns-established:
  - "Build-time graph computation: dependency relationships computed at Velite build time, not runtime"
  - "SVG string generation: graphs rendered as static SVG strings, no client-side rendering needed"

requirements-completed: [CONT-07]

duration: 12min
completed: 2026-03-08
---

# Phase 04 Plan 02: Dependency Graph Summary

**Static SVG dependency graph from content frontmatter using dagre layout with per-page local graphs and terminal aesthetic**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-08T04:14:14Z
- **Completed:** 2026-03-08T04:26:38Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Graph computation library with adjacency building, reverse edges, cycle detection, dagre layout, and SVG rendering
- DependencyGraph server component rendering pre-built SVG with terminal-styled labels
- Velite prepare hook generates full and per-page dependency graphs at build time
- Content query helpers for consuming graph data in pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Graph computation library** - `ca4cbee` (test) + `9c9a745` (feat) [TDD]
2. **Task 2: DependencyGraph component and Velite integration** - `dfc1eed` (feat)

## Files Created/Modified
- `apps/blakepetersen.io/src/lib/graph.ts` - Graph computation: buildGraph, getLocalGraph, computeLayout, renderGraphSvg
- `apps/blakepetersen.io/src/components/dependency-graph.tsx` - Server component for SVG dependency graph rendering
- `apps/blakepetersen.io/tests/graph.test.ts` - 18 unit tests for graph computation and SVG output
- `apps/blakepetersen.io/velite.config.ts` - Extended prepare hook with graph generation
- `apps/blakepetersen.io/src/lib/content.ts` - Added getGraphData, getLocalGraphSvg, getFullGraphSvg helpers
- `apps/blakepetersen.io/jest.config.ts` - Added esModuleInterop for dagre import compatibility

## Decisions Made
- Used `Map.forEach` instead of `for...of` iteration because ts-jest + Jest 30 has a broken Map iterator (spread and for...of return empty, but forEach works correctly)
- Graph data written to `.velite/graph.json` using `process.cwd()` since `__dirname` and `import.meta.url` resolve incorrectly in Velite's bundled config context
- Local graphs only generated for content items that have at least one dependency edge

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Map iterator incompatibility in ts-jest**
- **Found during:** Task 1 (Graph computation library)
- **Issue:** `for (const [k, v] of map)` and `[...map.keys()]` return empty arrays in Jest 30 + ts-jest environment, despite Map having entries
- **Fix:** Replaced all Map/Set `for...of` iteration with `.forEach()` callbacks
- **Files modified:** apps/blakepetersen.io/src/lib/graph.ts
- **Verification:** All 18 graph tests pass
- **Committed in:** 9c9a745

**2. [Rule 3 - Blocking] ESM/CJS import incompatibility for dagre**
- **Found during:** Task 2 (Velite integration)
- **Issue:** `require('@dagrejs/dagre')` fails in Velite ESM context with "Dynamic require not supported"
- **Fix:** Changed to `import dagre from '@dagrejs/dagre'` and added `esModuleInterop: true` to jest tsconfig
- **Files modified:** apps/blakepetersen.io/src/lib/graph.ts, apps/blakepetersen.io/jest.config.ts
- **Verification:** Both jest tests and velite build pass
- **Committed in:** dfc1eed

**3. [Rule 1 - Bug] JSX comment text node lint error**
- **Found during:** Task 2 (DependencyGraph component)
- **Issue:** `// {label}` in JSX interpreted as comment by react/jsx-no-comment-textnodes
- **Fix:** Changed to `{'// '}{label}` to use JSX expressions
- **Files modified:** apps/blakepetersen.io/src/components/dependency-graph.tsx
- **Verification:** ESLint passes
- **Committed in:** dfc1eed

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All fixes necessary for cross-environment compatibility. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Graph computation and rendering ready for page integration in Phase 5
- DependencyGraph component available for DX content pages
- Full graph SVG available for /graph route
- Content with no dependencies correctly excluded from graph display

---
*Phase: 04-content-rendering*
*Completed: 2026-03-08*
