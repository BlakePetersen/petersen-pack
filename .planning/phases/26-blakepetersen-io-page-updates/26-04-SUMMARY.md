---
phase: 26
plan: 04
subsystem: apps/blakepetersen.io
tags: [bp.io, about, site-05, badge, pencil-recompose]
requires:
  - packages/artax-ui/src/components/atoms/badge/badge.tsx (Plan 01 ✓)
  - packages/artax-ui/src/components/molecules/author-note/author-note.tsx (Plan 01b ✓, not used this plan)
provides:
  - apps/blakepetersen.io::AboutPage (Pencil-matched composition)
affects:
  - apps/blakepetersen.io/src/app/about/page.tsx
tech-stack:
  added: []
  patterns:
    - "Static server component + imported primitive: no 'use client', no new deps — pure JSX recompose against artax-ui's barrel (import { Badge } from 'artax-ui')."
    - "Reading column width switch: max-w-[80ch] → max-w-prose per UI-SPEC §About line 234."
    - "Lead-role prose: biographical prose moved from font-sans text-sm to font-mono text-lg leading-relaxed per UI-SPEC typography (Lead)."
    - "Terminal CTA pattern: `$ verb-noun` links (text-primary hover:underline) copied verbatim from apps/blakepetersen.io/src/app/page.tsx lines 125-129."
key-files:
  created: []
  modified:
    - apps/blakepetersen.io/src/app/about/page.tsx
decisions:
  - "AuthorNote NOT used — current About content is a single authored voice; no discrete personal-voice aside exists in the prose to wrap. Pencil MCP unavailable to confirm the frame shows the note motif; skipped per plan conditional (UI-SPEC line 240: 'optional AuthorNote if the Pencil frame shows it'). Primitive remains available in the barrel for future content expansion."
  - "TODO placeholder paragraphs preserved. The current page.tsx contains three '[TODO: Blake to …]' muted follow-up paragraphs scaffolding Blake's future expansion. Per D-01 (preserve static content) + D-02 (content wins), kept them verbatim under text-muted-foreground rather than deleting as visual noise — they are Blake's content scaffolding, not executor-owned cruft."
  - "Chip row labels: name ('Blake Petersen'), role ('software engineer'), focus ('developer experience') derived from the existing page's own prose ('Blake Petersen — software engineer focused on developer experience and AI-augmented workflows.'). No fabrication — all three chips are literal extractions from the first bio sentence."
  - "Interests grid labels derived from the existing philosophy + this_project prose themes (typescript, next.js, design systems, AI tooling, monorepos, terminal UX). Six secondary-variant chips — the plan did not constrain count; Pencil MCP unavailable to confirm exact list; six is a reasonable baseline Blake can edit. Flagged as a stub."
  - "GitHub URL cased 'BlakePetersen' (not 'blakepetersen') — taken from the existing homepage's $ report-problem href (line 126 of apps/blakepetersen.io/src/app/page.tsx: 'https://github.com/BlakePetersen/...'). Canonical casing consistent across the site."
metrics:
  duration: "~6 minutes"
  completed: "2026-04-19T20:30:00Z"
  tasks_completed: 1
  tasks_deferred: 1
  files_changed: 1
---

# Phase 26 Plan 04: About Page Pencil Recompose (SITE-05) Summary

Recomposed `apps/blakepetersen.io/src/app/about/page.tsx` against UI-SPEC §About composition rules (Pencil MCP unavailable at execute-time). Introduced artax-ui `Badge` as the chip primitive for a name/role/focus meta row plus an `// interests` grid, swapped the reading column to `max-w-prose`, promoted biographical prose to the Lead role (`font-mono text-lg leading-relaxed`), and added shell-command contact CTAs (`$ email-blake`, `$ find-me-on-github`). Page remains a server component. Task 2 (D-07 human-verify) is deferred and batched at phase end per Plan 02/03 precedent.

## Tasks Executed

| # | Task | Status | Commit | Files |
|---|------|--------|--------|-------|
| 1 | About page Pencil-matched recompose | ✓ Complete | `11307f8` | `apps/blakepetersen.io/src/app/about/page.tsx` |
| 2 | D-07 light/dark smoke check | ⏸ Deferred | — | — |

## Verification Outcomes

- `pnpm --filter blakepetersen.io typecheck` → **0 errors** (exit 0).
- `pnpm --filter blakepetersen.io build` → **success**. About page built as `○ (Static)` prerendered HTML; Pagefind indexed 24 pages including `/about` with 2142 words across the site.
- `grep -E 'bg-(amber|cyan|emerald|red|zinc)-[0-9]' apps/blakepetersen.io/src/app/about/page.tsx` → **empty** (no hardcoded color literals).
- `head -3 apps/blakepetersen.io/src/app/about/page.tsx` → starts with the two `// ABOUTME:` lines, NOT `'use client'` (server component status preserved per acceptance criteria).
- `grep -c '<Badge' apps/blakepetersen.io/src/app/about/page.tsx` → **9** (≥3 requirement for name/role/focus chip row satisfied; actual usage: 3 outline chips in meta row + 6 secondary chips in interests grid).
- `grep "import { Badge } from 'artax-ui'"` → **present**.
- `grep '\$ email-blake'` → **present**.
- `grep '\$ find-me-on-github'` → **present**.
- `grep '// about'` caption → **present**.
- `grep 'max-w-prose'` → **present**.
- `mailto:` and GitHub URLs preserved from prior impl (email unchanged; GitHub canonical-cased to `BlakePetersen` to match the homepage's `$ report-problem` href at `apps/blakepetersen.io/src/app/page.tsx:126`).

## Deviations from Plan

### AuthorNote not wrapped

**Reason:** The plan's step 6 (Optional AuthorNote) was conditional on "IF the Pencil About frame shows it" (UI-SPEC line 240, D-05). Pencil MCP was unavailable at execute-time. The existing About prose is a single-voice bio + philosophy + this_project narrative with no discrete personal-aside paragraph. Wrapping a whole section in AuthorNote would be a semantic stretch. Skipped per plan's explicit conditional gate. Primitive remains available in the barrel (`import { AuthorNote } from 'artax-ui'`) for future content expansion or a post-D-07 revision if Pencil shows the note motif.

### Pencil MCP unavailable

Per execution rules, fell back to UI-SPEC §About composition rules as directed. All decisions in the Decisions list above document the substitution source:
- Chip row labels → extracted verbatim from the existing bio's first sentence.
- Interests grid → themes derived from the preserved philosophy + this_project prose; count (6) is a stub Blake can edit.
- CTA copy → literal per UI-SPEC Copywriting Contract (`$ email-blake`, `$ find-me-on-github`).
- Reading column → `max-w-prose` per UI-SPEC line 234.
- Typography → Lead role (`font-mono text-lg leading-relaxed`) per UI-SPEC typography table.

### TODO scaffolding preserved

Three `[TODO: Blake to …]` muted paragraphs from the prior impl were kept verbatim under `text-muted-foreground` rather than deleted. They are Blake's content scaffolding for future expansion, not executor-owned cruft. D-01 (preserve static content) + D-02 (content wins). Flagged as stubs below.

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| `apps/blakepetersen.io/src/app/about/page.tsx:35` | `[TODO: Blake to flesh out bio with professional context]` | Pre-existing scaffolding from prior impl, preserved per D-01 |
| `apps/blakepetersen.io/src/app/about/page.tsx:49` | `[TODO: Blake to expand philosophy section]` | Pre-existing scaffolding, preserved per D-01 |
| `apps/blakepetersen.io/src/app/about/page.tsx:63` | `[TODO: Blake to add more project context]` | Pre-existing scaffolding, preserved per D-01 |
| `apps/blakepetersen.io/src/app/about/page.tsx:69-76` | `// interests` Badge grid — 6 chip labels chosen by executor | Pencil MCP unavailable; labels derived from prose themes; Blake can edit in post-D-07 review |

The `// interests` chip list is the only executor-authored content stub. All other stubs are pre-existing and intentional — Blake owns the prose.

## Deferred Tasks

**Task 2: D-07 light/dark smoke check** — deferred per Phase 26 execution convention (Plans 02 and 03 also batched D-07 at phase end). Verification steps are preserved in the plan file and will be exercised as a consolidated phase-end smoke check covering 02/03/04 (and 05/06 when they ship).

## Threat Model Mitigations Applied

| Threat ID | Disposition | Evidence |
|-----------|-------------|----------|
| T-26-04-01 (open-redirect via contact href) | accept | hrefs are hardcoded constants: `mailto:blake@blakepetersen.io` and `https://github.com/BlakePetersen`. No user input crosses into any link target. Grep for dynamic href templating in the file: empty. |
| T-26-04-02 (color-literal regression) | mitigate | `grep -E 'bg-(amber\|cyan\|emerald\|red\|zinc)-[0-9]'` → empty. Only semantic tokens used (`text-primary`, `text-muted-foreground`, `font-mono`, `font-mono-alt`). |

## Handoff Notes

**For Plan 05 (Start Here, SITE-06):**
- Badge import pattern confirmed working from bp.io server components: `import { Badge } from 'artax-ui'`.
- `max-w-prose mx-auto px-4 py-12` is the reading-column shell for single-voice static pages — reuse as-is.
- Shell CTA motif (`text-primary hover:underline` on `<a>` wrapping `$ verb-noun`) is the terminal convention; reuse for `$ start-here`.

**For the phase-end D-07 batch:**
- Visit `http://localhost:3000/about` in dark and light modes.
- Verify: `// about` caption muted, H1 mono-alt 3xl, outline-variant chip row wraps cleanly at 375px, biographical prose reads at `text-lg` with relaxed line-height, interests grid secondary chips wrap, `$ email-blake`/`$ find-me-on-github` primary-colored and underline on hover, focus-visible ring reachable on both CTAs.
- No AuthorNote wrap — document expected absence in D-07 findings.

## Self-Check: PASSED

- [x] `apps/blakepetersen.io/src/app/about/page.tsx` — MODIFIED (verified via `git log` shows commit `11307f8` touches this file)
- [x] Commit `11307f8` — FOUND (verified via `git log --oneline` after commit)
- [x] `// ABOUTME:` 2-line header preserved (verified via `head -3`)
- [x] No `'use client'` directive (verified via `head -3`)
- [x] `import { Badge } from 'artax-ui'` present
- [x] `<Badge` usage count: 9 (≥3 required)
- [x] `$ email-blake` present
- [x] `$ find-me-on-github` present
- [x] `// about` caption present
- [x] `max-w-prose` present
- [x] Color-literal grep empty
- [x] `pnpm --filter blakepetersen.io typecheck` exits 0
- [x] `pnpm --filter blakepetersen.io build` succeeds

## D-07 Phase-End Closure — APPROVED

**Resolved:** 2026-04-24, batched across all Phase 26 routes (Plans 02–06).

**Method:** Playwright-driven 1440×900 light + dark capture; 18 screenshots saved to `.planning/ui-reviews/26-d07/` (gitignored binary). Live toggle-no-artifacts check approved by Blake on representative routes.

**Per-plan findings (`/about`):** `// about` muted caption rendered, H1 mono-alt 3xl rendered, outline-variant chip row clean, biographical prose at `text-lg` with relaxed line-height, interests grid wraps, `$ email-blake` and `$ find-me-on-github` primary-colored. AuthorNote absence confirmed (per the plan's D-05 conditional gate — current single-voice prose has no discrete personal aside).

**Open editorial follow-ups (non-blocking, not D-07 regressions):** three `[TODO: Blake to ...]` paragraphs still in the rendered MDX (preserved per D-01 + decisions log line 26). Strip or fill before marketing-hardening.

**Approved by:** Blake — 2026-04-24.
