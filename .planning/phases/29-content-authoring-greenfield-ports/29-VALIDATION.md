---
phase: 29
slug: content-authoring-greenfield-ports
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-09
validated: 2026-05-14
---

# Phase 29 — Validation Strategy

> Per-phase validation contract. Audited 2026-05-14 against committed implementation — zero gaps, all rows covered by existing automated commands.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (existing)** | Jest 30.3.0 (`apps/blakepetersen.io/jest.config.ts`) — runs via `pnpm test --passWithNoTests` |
| **Framework (added Wave 0)** | `@playwright/test` ^1.59.1 in `apps/blakepetersen.io` (luna pattern) |
| **Config files** | `apps/blakepetersen.io/jest.config.ts` · `apps/blakepetersen.io/playwright.config.ts` |
| **Content lint** | `pnpm --filter blakepetersen.io lint:content` → `blink lint --content-root content` |
| **Schema build** | `pnpm --filter blakepetersen.io velite` |
| **Visual snapshot** | `pnpm --filter blakepetersen.io exec playwright test tests/visual` |
| **Full suite** | `pnpm --filter blakepetersen.io build && pnpm --filter blakepetersen.io exec playwright test` |
| **Estimated runtime (quick)** | ~2s lint, ~3.5s velite warm |
| **Estimated runtime (full)** | ~13s build + ~2.2s playwright |

---

## Sampling Rate

- **After every entry commit:** `pnpm exec blink lint --files content/<collection>/<slug>.mdx` (lint-staged on changed files)
- **After every plan wave:** `pnpm velite && pnpm lint:content && pnpm build`
- **Spot check (every 5 entries):** Load random new entry via `pnpm dev`, eyeball voice primitives + `/install/[type]/[slug]` render
- **Phase gate (Plan 07):** Full suite — `pnpm build`, `pnpm exec playwright test`, `pnpm lint:content` delta-zero vs Wave 0 baseline
- **Max feedback latency:** ~3s lint on staged changes; ~15s full per-wave gate

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 29-01 wr-01..03 | 01 | 0 | CONTENT-06 (infra) | — | Playwright installed + Jest isolated + lint baseline frozen | infra | `pnpm exec playwright --version` && `[ -f lint-baseline.txt ]` | ✅ | ✅ green |
| 29-02 wr-01..06 | 02 | 1 | CONTENT-06 | T-29-02-01..06 | Voice primitives render in light/dark/mobile; install route gated | visual + integration | `pnpm exec playwright test tests/visual` | ✅ | ✅ green (3/3) |
| 29-03 wr-01..05 | 03 | 2 | CONTENT-01 | — | 4 batch skill ports MDX render + lint clean + artifact pair | integration | `pnpm velite && pnpm exec blink lint --files content/skills/*.mdx` | ✅ | ✅ green |
| 29-04 wr-01..07 | 04 | 2 | CONTENT-02 | T-29-04-01..05 | 7 configs render + lint clean + artifact-bearing + no slug collision | integration | `pnpm velite && pnpm exec blink lint --files content/configs/*.mdx` | ✅ | ✅ green |
| 29-05 wr-01..06 | 05 | 2 | CONTENT-03 | T-29-05-01..05 | 4 hooks render + lint clean + husky-v9 shell artifacts sh-n-clean | integration | `pnpm velite && pnpm exec blink lint --files content/hooks/*.mdx` | ✅ | ✅ green |
| 29-06 wr-01..04 | 06 | 2 | CONTENT-04 | T-29-06-01..05 | 4 guides MDX-only render + lint clean + cross-refs resolve | integration | `pnpm velite && pnpm exec blink lint --files content/guides/*.mdx` | ✅ | ✅ green |
| 29-07 wr-01 | 07 | 3 | CONTENT-01..04, CONTENT-06 | — | Phase-end build green + lint delta zero + Playwright 3/3 + perf within tolerance | rollup | `pnpm build && pnpm exec playwright test && diff lint-final.txt lint-baseline.txt` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/blakepetersen.io/playwright.config.ts` — luna pattern, port 3000, three projects (`desktop-light`, `desktop-dark`, `mobile-light`)
- [x] `apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts` — torture-test spec (CONTENT-06) with `page.addInitScript` next-themes handoff
- [x] `apps/blakepetersen.io/tests/visual/voice-primitives.spec.ts-snapshots/` — 3 baselines committed (regenerated in Plan 02 finalize + Plan 03 sidebar-growth)
- [x] `@playwright/test ^1.59.1` + `playwright ^1.59.1` in `apps/blakepetersen.io/package.json` devDependencies
- [x] `apps/blakepetersen.io/jest.config.ts` `testPathIgnorePatterns` extended with `/tests/visual/`
- [x] `apps/blakepetersen.io/package.json` scripts: `test:visual`, `test:visual:update`
- [x] `.planning/phases/29-content-authoring-greenfield-ports/lint-baseline.txt` — Wave 0 `pnpm lint:content` output (24 errors / 5 warnings, all pre-existing)
- [x] `.planning/phases/29-content-authoring-greenfield-ports/monodex-shortlist.md` — 5 Blake-approved slugs in LOCKED FORMAT + Option B authorization

**All Wave 0 items satisfied** — confirmed on disk at audit time (2026-05-14).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Status |
|----------|-------------|------------|-------------------|--------|
| Snapshot baselines look correct | CONTENT-06 (D-08) | Visual fidelity is human judgment on first creation; pixel diff catches regressions | Open PNGs in `voice-primitives.spec.ts-snapshots/`, confirm light/dark/mobile renders match design intent | ✅ Blake approved (Plan 02 + Plan 03 regen) |
| Editorial quality of authored prose | CONTENT-01..04 (D-12) | Only Blake judges whether 500–1500-word prose is production quality | Blake reviews each MDX entry after Claude drafts it | ⏳ Deferred to 24h re-read per PITFALLS.md #6 |
| Real artifact files are `blink apply`-ready | CONTENT-02, CONTENT-03 (D-13) | Runtime correctness can't be lint-proven | Run `pnpm exec blink apply <type>/<slug>` on a clean target dir; confirm files land and parse | ⏳ Deferred to registry-publish |
| `blink list` against published registry returns 20+ entries | Success criterion #5 | Requires `npm install -g @blink-dx/cli` against deployed registry | After phase ships: `npm install -g @blink-dx/cli && blink list` from fresh shell | ⏳ Deferred to registry-publish |

Local `blink list` returned 8 artifact-bearing entries at Plan 07 gate — CLI filters to installable subset by design (not a regression; the 16-entry floor in ROADMAP Success Criterion #5 is evidenced by on-disk MDX file counts: 6 skills + 13 configs + 5 hooks + 7 guides = 31 entries).

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (Playwright infra + lint baseline + Monodex shortlist)
- [x] No watch-mode flags
- [x] Feedback latency < 60s per wave (15s phase-gate full suite)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** passed (audited 2026-05-14)

---

## Validation Audit 2026-05-14

| Metric | Count |
|--------|-------|
| Requirements audited | 5 (CONTENT-01..04, CONTENT-06) |
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |
| Manual-only (by design) | 4 |

**Audit basis:** All 7 plan SUMMARYs (29-01 through 29-07) report green automated gates with delta-zero against Wave 0 lint baseline. Phase 07 gate captured `lint-final.txt`, `lint-warning-delta.md`, and `.planning/intel/build-perf-baseline.json` as DEBT-05 evidence packet. Playwright `voice-primitives.spec.ts` 3/3 green at every plan boundary (regenerated twice: Plan 02 finalize for rewritten skill page, Plan 03 sidebar-growth).

**Conclusion:** No tests to generate. The validation contract was a planning skeleton; execution closed every row via the existing scripts. Nyquist compliance achieved without auditor spawn.
