---
phase: 11-ai-automation
plan: 01
subsystem: ci
tags: [anthropic, claude, github-actions, code-review, prompt-injection]

requires:
  - phase: 08-github-community
    provides: "GitHub issue templates and CI workflow patterns"
provides:
  - "Claude-powered PR review workflow (.github/workflows/ai-review.yml)"
  - "Shared AI library: Anthropic client, sanitize, labels (.github/scripts/lib/)"
  - "Review helpers: lockfile detection, prompt building, response parsing"
  - "Jest test infrastructure for .github/scripts/"
affects: [11-02-ai-triage]

tech-stack:
  added: ["@anthropic-ai/sdk", "@actions/core", "@actions/github", "@octokit/rest"]
  patterns: ["Standalone CI scripts in .github/scripts/ with shared lib/", "ESM mock strategy for @actions/* packages in Jest"]

key-files:
  created:
    - ".github/scripts/ai-review.ts"
    - ".github/scripts/lib/anthropic.ts"
    - ".github/scripts/lib/sanitize.ts"
    - ".github/scripts/lib/labels.ts"
    - ".github/scripts/lib/review-helpers.ts"
    - ".github/scripts/jest.config.ts"
    - ".github/scripts/__tests__/sanitize.test.ts"
    - ".github/scripts/__tests__/ai-review.test.ts"
    - ".github/scripts/__mocks__/@actions/core.ts"
    - ".github/scripts/__mocks__/@actions/github.ts"
    - ".github/workflows/ai-review.yml"
  modified:
    - "package.json"
    - "pnpm-lock.yaml"

key-decisions:
  - "Extracted pure helper functions into review-helpers.ts to enable Jest testing without ESM dependency issues"
  - "Used Jest manual mocks for @actions/core and @actions/github (ESM-only packages incompatible with ts-jest CJS mode)"
  - "Removed overly broad moduleNameMapper that was catching source-map internal imports"

patterns-established:
  - "CI script tests: pure logic in lib/, ESM deps mocked via __mocks__/"
  - "AI review: structured JSON response schema with APPROVE/REQUEST_CHANGES/COMMENT verdicts"

requirements-completed: [AI-01, AI-03, AI-04, AI-05]

duration: 7min
completed: 2026-03-12
---

# Phase 11 Plan 01: AI PR Review Summary

**Claude-powered PR review with Sonnet, prompt injection sanitization, fork skip, and lockfile-only detection**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-12T21:50:40Z
- **Completed:** 2026-03-12T21:57:21Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Shared AI library with Anthropic client factory, sanitize function, and label constants
- PR review script that fetches diffs, sends to Claude, and posts structured GitHub reviews
- GitHub Actions workflow with fork-notice job and pull_request trigger
- 19 passing unit tests covering sanitize patterns and review helper logic

## Task Commits

Each task was committed atomically:

1. **Task 1: Install deps, create shared library, and test scaffolding** - `24a7ae5` (feat)
2. **Task 2: TDD RED - Failing tests for ai-review helpers** - `486bdab` (test)
3. **Task 2: TDD GREEN - PR review script, workflow, and tests** - `4d3bb0c` (feat)

## Files Created/Modified
- `.github/scripts/lib/anthropic.ts` - Anthropic client factory with model and token constants
- `.github/scripts/lib/sanitize.ts` - Prompt injection sanitization (XML tags, impersonation, control chars)
- `.github/scripts/lib/labels.ts` - Label dimensions (type, priority, area, special) and auto-create helper
- `.github/scripts/lib/review-helpers.ts` - Pure helper functions (lockfile detection, prompt building, response parsing)
- `.github/scripts/ai-review.ts` - Main review script with Claude API and GitHub review posting
- `.github/scripts/jest.config.ts` - Jest config for scripts test suite
- `.github/scripts/__tests__/sanitize.test.ts` - 11 sanitize test cases
- `.github/scripts/__tests__/ai-review.test.ts` - 8 review helper test cases
- `.github/scripts/__mocks__/@actions/core.ts` - Manual mock for ESM-only package
- `.github/scripts/__mocks__/@actions/github.ts` - Manual mock for ESM-only package
- `.github/workflows/ai-review.yml` - AI Code Review workflow with fork-notice job
- `package.json` - Added deps and test:scripts script
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made
- Extracted pure helper functions (isLockfileOnlyPR, buildReviewPrompt, parseReviewResponse) into `review-helpers.ts` so tests can import them without triggering ESM-only `@actions/*` imports
- Used Jest `__mocks__/` directory with manual mocks for `@actions/core` and `@actions/github` since these packages are ESM-only and incompatible with ts-jest CJS transform
- Removed the `moduleNameMapper` for `./lib/*` that was too broad and interfered with `source-map` internal imports

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ESM-only @actions/* packages break Jest CJS transform**
- **Found during:** Task 2 (GREEN phase)
- **Issue:** `@actions/core` and `@actions/github` v3/v9 are ESM-only; ts-jest uses CJS transform causing `SyntaxError: Cannot use import statement outside a module`
- **Fix:** Created manual mocks in `__mocks__/@actions/` directory, extracted pure helpers to `lib/review-helpers.ts`, updated Jest config with `moduleNameMapper`
- **Files modified:** jest.config.ts, review-helpers.ts (new), __mocks__/@actions/core.ts (new), __mocks__/@actions/github.ts (new)
- **Verification:** All 19 tests pass
- **Committed in:** 4d3bb0c

**2. [Rule 1 - Bug] moduleNameMapper too broad, catching source-map internals**
- **Found during:** Task 1 (sanitize test run)
- **Issue:** `'^./lib/(.*)$'` mapper intercepted `./lib/source-map-generator` from `source-map` package
- **Fix:** Removed the overly broad mapper; tests use relative `../lib/` imports that resolve naturally
- **Verification:** sanitize.test.ts passes
- **Committed in:** 24a7ae5

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for test infrastructure to work. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required

**External services require manual configuration.**

To enable AI PR review, add the Anthropic API key as a GitHub repository secret:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/) -> API Keys -> Create Key
2. Go to GitHub repo -> Settings -> Secrets and variables -> Actions -> New repository secret
3. Name: `ANTHROPIC_API_KEY`, Value: your API key

**Verification:** Open a PR -- the AI Code Review workflow should trigger automatically.

## Next Phase Readiness
- Shared library (anthropic.ts, sanitize.ts, labels.ts) ready for ai-triage script (Plan 02)
- Jest test infrastructure established for .github/scripts/
- review-helpers.ts pattern established for extracting testable logic from CI scripts

---
*Phase: 11-ai-automation*
*Completed: 2026-03-12*
