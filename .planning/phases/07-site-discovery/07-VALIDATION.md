---
phase: 7
slug: site-discovery
status: draft
nyquist_compliant: true
wave_0_complete: false
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
| 07-01-T1 | 01 | 1 | SITE-05 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern sitemap` | ❌ W0 | ⬜ pending |
| 07-01-T2 | 01 | 1 | SITE-06 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern feed` | ❌ W0 | ⬜ pending |
| 07-02-T1 | 02 | 2 | SITE-05 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern "metadata\|structured-data"` | ❌ W0 | ⬜ pending |
| 07-03-T1 | 03 | 2 | SITE-05 | build | `pnpm --filter blakepetersen.io build` | N/A | ⬜ pending |
| 07-03-T2 | 03 | 2 | SITE-05 | build | `pnpm --filter blakepetersen.io build` | N/A | ⬜ pending |
| 07-04-T1 | 04 | 1 | CONT-05 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern search` | ❌ W0 | ⬜ pending |
| 07-04-T2 | 04 | 1 | CONT-05 | unit | `pnpm --filter blakepetersen.io test -- --testPathPattern "command-palette\|search"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/sitemap.test.ts` — stubs for SITE-05 sitemap completeness (created in Plan 01)
- [ ] `tests/feed.test.ts` — stubs for SITE-06 RSS feed generation (created in Plan 01)
- [ ] `tests/metadata.test.ts` — stubs for SITE-05 metadata generation (created in Plan 02)
- [ ] `tests/structured-data.test.ts` — stubs for SITE-05 JSON-LD output (created in Plan 02)
- [ ] `tests/search.test.ts` — stubs for CONT-05 search wrapper (created in Plan 04)
- [ ] `tests/command-palette.test.tsx` — stubs for CONT-05 palette rendering (created in Plan 04)

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

**Approval:** pending
