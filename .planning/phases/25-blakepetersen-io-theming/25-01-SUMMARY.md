---
plan_id: 25-01
phase: 25
title: "Theming audit and cleanup for blakepetersen.io"
status: complete
commits:
  - 0dda6db chore(25-01): replace text-zinc-500 with text-muted-foreground in bp.io captions
  - 3ada04c docs(25-01): annotate theme-static color literals
gates:
  typecheck: pass
  test: pass (210/210 across 27 suites)
  lint: pass (0 errors; 29 pre-existing warnings unrelated)
  build: pass (production build green; 25 pages indexed by pagefind)
---

# Plan 25-01 Summary

## What shipped

**T1 — Real violations replaced (commit 0dda6db).** Two caption headings using the Tailwind palette utility `text-zinc-500` were swapped for the artax-ui semantic token `text-muted-foreground`:
- `apps/blakepetersen.io/src/components/dependency-graph.tsx:15` — `// dependency_graph` heading
- `apps/blakepetersen.io/src/components/dx-content-layout.tsx:71` — `// dependencies` heading

Same visual weight in dark mode; flips correctly in light mode now per the artax-ui dual-token contract.

**T2 — Theme-static cases annotated (commit 3ada04c).** Eight files keep hardcoded color values by design. Each occurrence carries a `// theme-static: <reason>` comment so future audits can distinguish intentional from drift:
- `components/command-palette.tsx`, `components/sidebar-drawer.tsx` — Radix Dialog overlay scrims (`bg-black/80`)
- `app/dev/components/page.tsx` — dev-only side-by-side preview wrapper
- `lib/og-image.tsx` — server-rendered Open Graph PNGs
- `lib/shiki-theme.ts` — single dark "terminal" syntax theme used in both modes
- `lib/graph.ts` — server-rendered SVG dependency graph
- `lib/collection-registry.ts`, `lib/navigation.ts` — per-collection brand accent dots in sidebar

## Audit triage table

| Category | Count | Examples |
|----------|-------|----------|
| Replaced (real violations) | 2 | `text-zinc-500` → `text-muted-foreground` |
| Annotated (theme-static, intentional) | 8 files | overlays, OG image, shiki theme, SVG graph, brand accents |
| False positives | 1 | `&#8599;` HTML entity for ↗ in `report-problem-link.tsx` |

## Static audit verification

```bash
$ grep -rn "text-zinc-500\|text-zinc-600\|text-neutral-200\|text-white\b" apps/blakepetersen.io/src --include='*.tsx'
apps/blakepetersen.io/src/app/dev/components/page.tsx:47:      <h1 className="mb-8 text-center font-mono text-2xl text-white">
```

Single remaining hit is the dev-only page wrapper (T2 annotated, dev-only gate via `NODE_ENV !== 'development'`).

## Build/test gates

- `pnpm --filter blakepetersen.io typecheck` — clean
- `pnpm --filter blakepetersen.io test` — 210/210 pass
- `pnpm --filter blakepetersen.io lint` — 0 errors (29 pre-existing warnings, none from this plan)
- `pnpm --filter blakepetersen.io build` — green; 25 pages built; pagefind indexed

## T3 — Visual smoke test (human verification required)

The static audit closes 100% of grep-detectable violations. Phase 25 success criterion #4 also requires visual confirmation that no untokenized backgrounds, low-contrast text, or broken borders surface in light mode. **A CLI agent cannot reliably perform that judgment** — visual artifact detection from screenshots is approximate and the cost of a false-pass is a public-facing regression.

The route enumeration for human walkthrough:

| Route | Source | Light mode | Dark mode | Notes |
|-------|--------|------------|-----------|-------|
| `/` | `app/page.tsx` | ☐ | ☐ | Home |
| `/about` | `app/about/page.tsx` | ☐ | ☐ | |
| `/changelog` | `app/changelog/page.tsx` | ☐ | ☐ | |
| `/configs` | `app/configs/page.tsx` | ☐ | ☐ | Collection listing |
| `/configs/<slug>` | `app/configs/[...slug]/page.tsx` | ☐ | ☐ | Pick any 1 detail page |
| `/contributors` | `app/contributors/page.tsx` | ☐ | ☐ | |
| `/dev/components` | `app/dev/components/page.tsx` | ☐ | ☐ | Dev-only; visible only in `pnpm dev` |
| `/guides` | `app/guides/page.tsx` | ☐ | ☐ | Collection listing |
| `/guides/<slug>` | `app/guides/[...slug]/page.tsx` | ☐ | ☐ | Pick any 1 detail page |
| `/hooks` | `app/hooks/page.tsx` | ☐ | ☐ | Collection listing |
| `/hooks/<slug>` | `app/hooks/[...slug]/page.tsx` | ☐ | ☐ | Pick any 1 detail page |
| `/posts` | `app/posts/page.tsx` | ☐ | ☐ | Collection listing |
| `/posts/<slug>` | `app/posts/[...slug]/page.tsx` | ☐ | ☐ | Pick any 1 detail page |
| `/roadmap` | `app/roadmap/page.tsx` | ☐ | ☐ | |
| `/skills` | `app/skills/page.tsx` | ☐ | ☐ | Collection listing |
| `/skills/<slug>` | `app/skills/[...slug]/page.tsx` | ☐ | ☐ | Pick any 1 detail page |
| `/start-here` | `app/start-here/page.tsx` | ☐ | ☐ | |

**To perform the walkthrough:**
1. `pnpm --filter blakepetersen.io dev`
2. Open `http://localhost:3000`
3. For each route: load → check default (dark) → click theme toggle → light → click again → system → look for any untokenized background, low-contrast text, broken border, or visible color artifact
4. If anything visible, capture (screenshot or note) and either fix-forward in this plan or open a follow-up

Findings can be appended to this SUMMARY under a new `## Smoke test results` section, or recorded in `25-VERIFICATION.md`.

## Out of scope (deferred per CONTEXT.md)

- Light-mode shiki syntax theme (terminal aesthetic intent — separate design discussion)
- Playwright visual regression infrastructure
- `useSyncExternalStore` mounted-flag retrofit across artax-ui
