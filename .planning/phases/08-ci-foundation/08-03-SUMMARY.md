---
phase: 08-ci-foundation
plan: 03
subsystem: infra
tags: [git, velite, freshness, sitemap, seo]

requires:
  - phase: 07-site-discovery
    provides: Velite content pipeline with prepare hook and graph.json pattern
provides:
  - Git history extraction at build time via Velite prepare hook
  - Content freshness display (relative date + frequency label)
  - Real git dates in sitemap for SEO accuracy
affects: [09-github-discussions, 10-roadmap-features]

tech-stack:
  added: []
  patterns: [git-history.json build artifact, ContentFreshness server component]

key-files:
  created:
    - apps/blakepetersen.io/src/lib/git-history.ts
    - apps/blakepetersen.io/src/components/content-freshness.tsx
    - apps/blakepetersen.io/tests/git-history.test.ts
  modified:
    - apps/blakepetersen.io/velite.config.ts
    - apps/blakepetersen.io/src/lib/content.ts
    - apps/blakepetersen.io/src/components/dx-content-layout.tsx
    - apps/blakepetersen.io/src/components/post-layout.tsx
    - apps/blakepetersen.io/src/app/sitemap.ts

key-decisions:
  - "child_process execSync for git history (no external dependency)"
  - "git log --follow --oneline | wc -l for commit counting (rev-list lacks --follow)"

patterns-established:
  - "git-history.json: build-time artifact written by Velite prepare hook, read by content.ts"
  - "ContentFreshness: server component pattern for git-derived metadata display"

requirements-completed: [CI-04, CI-05]

duration: 6min
completed: 2026-03-10
---

# Phase 8 Plan 3: Content Freshness Summary

**Git-derived content freshness display with relative dates, frequency labels, and real sitemap dates via Velite build-time extraction**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-10T18:20:16Z
- **Completed:** 2026-03-10T18:26:16Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Pure functions for freshness labels (New/Actively maintained/Recently updated/Stable) and relative date formatting with 12 passing tests
- Velite prepare hook extracts git history for all content items into git-history.json
- ContentFreshness server component renders freshness metadata on DX content and post pages
- Sitemap uses real git last-modified dates instead of new Date()

## Task Commits

Each task was committed atomically:

1. **Task 1: Create git history extraction and freshness logic with tests**
   - `b86ec56` (test: failing tests for freshness label and relative date)
   - `aa0234b` (feat: implement git history extraction and freshness logic)
2. **Task 2: Wire git history into Velite, layouts, and sitemap** - `61c4c6e` (feat)

## Files Created/Modified
- `src/lib/git-history.ts` - Git history extraction (execSync) and pure freshness/date functions
- `src/components/content-freshness.tsx` - Server component displaying freshness metadata
- `tests/git-history.test.ts` - 12 unit tests for getFreshnessLabel and formatRelativeDate
- `velite.config.ts` - Prepare hook extended to write git-history.json
- `src/lib/content.ts` - getGitHistory and getAllGitHistory accessors for git-history.json
- `src/components/dx-content-layout.tsx` - Renders ContentFreshness in metadata line
- `src/components/post-layout.tsx` - Renders ContentFreshness in metadata row
- `src/app/sitemap.ts` - Uses real git dates for content pages

## Decisions Made
- Used child_process execSync with git log/rev-list (no simple-git dependency needed)
- Used `git log --follow --oneline | wc -l` for commit counting because `git rev-list --count` does not support `--follow` flag

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed git rev-list --follow not supported**
- **Found during:** Task 2 (Velite integration)
- **Issue:** `git rev-list --count --follow` is not a valid combination; --follow only works with git log. All files were falling back to commitCount: 1 with current timestamps.
- **Fix:** Changed to `git log --follow --oneline | wc -l` for commit counting
- **Files modified:** apps/blakepetersen.io/src/lib/git-history.ts
- **Verification:** Build produces correct git dates and commit counts in git-history.json
- **Committed in:** 61c4c6e (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviation above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Content freshness infrastructure complete, ready for GitHub Discussions integration (Phase 9)
- git-history.json pattern can be extended for additional git-derived metadata if needed

---
*Phase: 08-ci-foundation*
*Completed: 2026-03-10*

## Self-Check: PASSED
All 4 files found. All 3 commits found.
