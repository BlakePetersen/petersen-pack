---
phase: 26
slug: blakepetersen-io-page-updates
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-19
updated: 2026-04-19
---

# Phase 26 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 30.x (monorepo) + ts-jest + @testing-library/react 16.x |
| **Config file** | `packages/artax-ui/jest.config.ts` (primitive tests); `apps/blakepetersen.io/jest.config.ts` (page + lib tests) |
| **Quick run command** | `pnpm --filter artax-ui test -- --watchAll=false` |
| **Full suite command** | `pnpm test` (monorepo turbo pipeline, no watch) |
| **Estimated runtime** | ~45s (artax-ui only) / ~180s (full monorepo) |

**Test path convention:** Tests live in the flat `<package>/tests/` tree alongside source, NOT co-located with source files. Convention matches existing artax-ui + bp.io packages (Phase 22/23/24 precedent).

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter artax-ui test -- --watchAll=false` for primitive-scoped commits; `pnpm --filter blakepetersen.io test -- --watchAll=false` for page-scoped commits
- **After every plan wave:** Run `pnpm test` (monorepo full suite)
- **Before `/gsd-verify-work`:** Full suite green + light/dark smoke check per page (D-07)
- **Max feedback latency:** 60 seconds for primitive plans; 120 seconds for page plans

---

## Nyquist Compliance Note

Plan 01/01b tasks are single-task write-test-and-impl-together commits — NOT a "Wave 0 stubs first, impl Wave 1 later" two-phase approach. This is compliant with Nyquist because each primitive ships its test in the same atomic commit that introduces the implementation, which means feedback sampling fires immediately on every commit (no sampling gap, no stub-only interval). The `<automated>` verify in every code-producing task is the Nyquist checkpoint.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Test File | Status |
|---------|------|------|-------------|-----------|-------------------|-----------|--------|
| 26-01-01 | 01 | 1 | ARTAX-primitive (Badge) | unit | `pnpm --filter artax-ui test -- --watchAll=false --testPathPattern=badge` | `packages/artax-ui/tests/components/badge.test.tsx` | ⬜ pending |
| 26-01-02 | 01 | 1 | ARTAX-primitive (Modal — render + SSR assertion in same file) | unit+ssr | `pnpm --filter artax-ui test -- --watchAll=false --testPathPattern=modal` | `packages/artax-ui/tests/components/modal.test.tsx` | ⬜ pending |
| 26-01-03 | 01 | 1 | ARTAX-primitive (PrevNextNav) | unit | `pnpm --filter artax-ui test -- --watchAll=false --testPathPattern=prev-next-nav` | `packages/artax-ui/tests/components/prev-next-nav.test.tsx` | ⬜ pending |
| 26-01-04 | 01 | 1 | barrel exports + full suite | integration | `pnpm --filter artax-ui test -- --watchAll=false && pnpm --filter artax-ui typecheck` | (all existing + new above) | ⬜ pending |
| 26-01b-01 | 01b | 1 | D-05 editorial-voice gate | checkpoint:decision | (human checkpoint, no automated) | n/a | ⬜ pending |
| 26-01b-02 | 01b | 1 | ARTAX-primitive (AuthorNote + DecisionRationale) | unit + source-grep | `pnpm --filter artax-ui test -- --watchAll=false --testPathPattern='(author-note\|decision-rationale)'` | `packages/artax-ui/tests/components/author-note.test.tsx`, `packages/artax-ui/tests/components/decision-rationale.test.tsx` | ⬜ pending |
| 26-01b-03 | 01b | 1 | barrel exports + mdx reconciliation + full suite | integration | `pnpm --filter artax-ui test -- --watchAll=false && pnpm --filter artax-ui typecheck` | (all existing + new) | ⬜ pending |
| 26-02-01 | 02 | 2 | SITE-03 | typecheck+build | `pnpm --filter blakepetersen.io typecheck && pnpm --filter blakepetersen.io build` | (Next SSR build) | ⬜ pending |
| 26-02-02 | 02 | 2 | SITE-03 | checkpoint:human-verify (D-07) | manual light/dark toggle | n/a | ⬜ pending |
| 26-03-01 | 03 | 2 | SITE-04 | typecheck+test+build | `pnpm --filter blakepetersen.io typecheck && pnpm --filter blakepetersen.io test -- --watchAll=false && pnpm --filter blakepetersen.io build` | (navigation tests + Next SSR build) | ⬜ pending |
| 26-03-02 | 03 | 2 | SITE-04 | checkpoint:human-verify (D-07) | manual light/dark toggle | n/a | ⬜ pending |
| 26-04-01 | 04 | 2 | SITE-05 | typecheck+build | `pnpm --filter blakepetersen.io typecheck && pnpm --filter blakepetersen.io build` | (Next SSR build) | ⬜ pending |
| 26-04-02 | 04 | 2 | SITE-05 | checkpoint:human-verify (D-07) | manual light/dark toggle | n/a | ⬜ pending |
| 26-05-01 | 05 | 2 | SITE-06 | typecheck+build | `pnpm --filter blakepetersen.io typecheck && pnpm --filter blakepetersen.io build` | (Next SSR build) | ⬜ pending |
| 26-05-02 | 05 | 2 | SITE-06 | checkpoint:human-verify (D-07) | manual light/dark toggle | n/a | ⬜ pending |
| 26-06-01 | 06 | 2 | SITE-07 (factory + empty-state unit test) | typecheck+test+build | `pnpm --filter blakepetersen.io typecheck && pnpm --filter blakepetersen.io test -- --watchAll=false --testPathPattern=collection-pages && pnpm --filter blakepetersen.io build` | `apps/blakepetersen.io/tests/lib/collection-pages.test.tsx` | ⬜ pending |
| 26-06-02 | 06 | 2 | SITE-07 | checkpoint:human-verify (D-07) | manual light/dark toggle across 5 routes | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements (COMPLETE)

Wave 0 is satisfied in-line: every primitive ships its test in the same atomic commit as its implementation (Plan 01 + 01b tasks). No separate stub phase. Test files to be created (flat `tests/` convention, not co-located):

- [x] `packages/artax-ui/tests/components/badge.test.tsx` — **extend** existing file with 4 new variant cases (info, success, warning, destructive)
- [x] `packages/artax-ui/tests/components/modal.test.tsx` — render, open/close, Esc, focus-trap via real Radix, **AND** SSR `renderToString` assertion `.not.toMatch(/aria-controls="radix-/)` in the same file (NOT a separate hydration test file)
- [x] `packages/artax-ui/tests/components/prev-next-nav.test.tsx` — 4 slot combinations (prev-only, next-only, both, neither→null), aria-label wiring, arrow glyphs
- [x] `packages/artax-ui/tests/components/author-note.test.tsx` — role="note", `// author_note` caption, children pass-through, byline when `author` prop set, **source-grep D-05 guard** (source file does NOT match `/Blake'?s note/i`)
- [x] `packages/artax-ui/tests/components/decision-rationale.test.tsx` — `// decision` caption, headline, alternatives list, `collapsed`→`<details>` vs default→`<section>` branches
- [x] `apps/blakepetersen.io/tests/lib/collection-pages.test.tsx` — factory empty-state branch renders `// empty_collection` + contribute copy when getter returns `[]` (replaces destructive manual empty-content step in Plan 06)
- [x] No new framework install — Jest 30 already configured in both packages (Phase 24/25 precedent)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Light-mode visual parity with Pencil frame (Homepage) | SITE-03 | Pixel-level visual parity; no automated visual-regression harness (deferred from Phase 25) | `pnpm --filter blakepetersen.io dev` → open `/` → toggle to light → compare against Pencil `Homepage` frame (via `mcp__pencil__get_screenshot`) → flag mismatches before marking plan complete |
| Dark-mode visual parity with Pencil frame (Homepage) | SITE-03 | Same as above; dark mode | Same flow, dark theme |
| Light + dark for Skills Detail | SITE-04 | Visual parity | `/skills/<representative-slug>` in both modes |
| Light + dark for About | SITE-05 | Visual parity | `/about` in both modes |
| Light + dark for Start Here | SITE-06 | Visual parity | `/start-here` in both modes |
| Light + dark for Collection Listing | SITE-07 | Visual parity across all 5 collection index routes | `/configs`, `/hooks`, `/guides`, `/skills`, `/posts` in both modes |
| No FOUT on page navigation | SITE-03..07 | Timing-dependent visual check | Click through pages in both modes; watch for flash |
| Theme toggle still works after rewrite | Regression | Ensures Phase 22/25 theming infra intact | Toggle on each rewritten page; localStorage persists across route changes |
| Editorial-voice gate for AuthorNote/DecisionRationale | D-05 | Judgment call requiring human read of Pencil frame copy | Plan 01b opening checkpoint — executor presents Pencil frame text, asks Blake whether the primitive is generic or editorial before committing to artax-ui |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify OR a `checkpoint:human-verify` / `checkpoint:decision` for judgment-required work
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (checkpoints immediately follow code-producing tasks)
- [x] Wave 0 satisfied via single-task write-test-and-impl-together commits (no separate stub phase)
- [x] No watch-mode flags (`--watchAll=false` enforced everywhere)
- [x] Feedback latency < 60s (primitive) / 120s (page)
- [x] `nyquist_compliant: true` set in frontmatter
- [x] Modal SSR assertion collapsed into `modal.test.tsx` (no separate hydration test file)
- [x] Plan 06 destructive empty-state step replaced with `collection-pages.test.tsx` unit test
- [x] Test paths reconciled to match Plan 01/01b `files_modified` (flat `tests/` tree, not co-located)

**Approval:** locked
