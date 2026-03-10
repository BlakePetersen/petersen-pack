---
phase: 7
slug: site-discovery
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-07
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.2.0 + ts-jest |
| **Config file** | `apps/blakepetersen.io/jest.config.ts` |
| **Quick run command** | `pnpm --filter blakepetersen.io test` |
| **Full suite command** | `pnpm --filter blakepetersen.io test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter blakepetersen.io test`
- **After every plan wave:** Run `pnpm --filter blakepetersen.io test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-T1 | 01 | 1 | SITE-05 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern sitemap` | ✅ | ✅ green |
| 07-01-T2 | 01 | 1 | SITE-06 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern feed` | ✅ | ✅ green |
| 07-02-T1 | 02 | 2 | SITE-05 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern "metadata\|structured-data"` | ✅ | ✅ green |
| 07-03-T1 | 03 | 2 | SITE-05 | build | `pnpm --filter blakepetersen.io build` | N/A | ✅ green |
| 07-03-T2 | 03 | 2 | SITE-05 | build | `pnpm --filter blakepetersen.io build` | N/A | ✅ green |
| 07-04-T1 | 04 | 1 | CONT-05 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern search` | ✅ | ✅ green |
| 07-04-T2 | 04 | 1 | CONT-05 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern "command-palette\|search"` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/sitemap.test.ts` — 6 tests for sitemap and metadata helpers (created in Plan 01)
- [x] `tests/feed.test.ts` — 7 tests for RSS feed generation (created in Plan 01)
- [x] `tests/metadata.test.ts` — unit tests for buildMetadata helper (created in Plan 02)
- [x] `tests/structured-data.test.ts` — unit tests for JSON-LD output (created in Plan 02)
- [x] `tests/search.test.ts` — tests for search fallback, shaping, and 20-result cap (created in Plan 04)
- [x] `tests/command-palette.test.tsx` — render tests for CommandPalette and SearchTrigger (created in Plan 04)

*Existing test infrastructure (Jest + ts-jest) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Pagefind search index generated post-build | CONT-05 | Requires full build + filesystem check | Build site, verify `public/pagefind/` exists with index files |
| Command palette renders and returns results | CONT-05 | Requires browser interaction | Open site, trigger Cmd+K, type query, verify results appear |
| OG images render with terminal aesthetic | SITE-05 | Visual verification | Build site, check generated OG images in .next output |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (retroactive — all Wave 0 tests created during execution)
