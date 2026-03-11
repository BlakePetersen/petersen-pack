# Deferred Items - Phase 09

## Pre-existing Test Failures

**sitemap.test.ts** - 4 tests failing due to `getAllGitHistory is not a function`
- Root cause: Phase 08-03 added git history to sitemap but the test mock doesn't include `getAllGitHistory`
- Not caused by Phase 09 changes
- Needs fix in sitemap test mocks
