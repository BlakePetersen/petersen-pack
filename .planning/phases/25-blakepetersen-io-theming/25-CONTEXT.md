# Phase 25: blakepetersen.io Theming - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning
**Mode:** Audit-only (scope reframed after codebase scout)

<domain>
## Phase Boundary

blakepetersen.io supports light/dark mode switching with no visual regressions. Per the ROADMAP, success criteria 1-3 (ThemeProvider wrapped, theme toggle in header, FOUT prevention) are already satisfied by code that landed during/after Phase 22 scaffolding. This phase audits and gap-closes only — it does NOT re-implement the theming infrastructure.

**In scope:**
- Verify ThemeProvider, theme-toggle, FOUT prevention are correctly wired (smoke check)
- Audit `apps/blakepetersen.io/src/**` for hardcoded color literals that would cause light-mode artifacts
- Fix any drift by replacing literals with semantic token utilities (`bg-background`, `text-foreground`, `text-muted-foreground`, etc.)
- Visually verify both light and dark modes render correctly across all current pages

**Out of scope:**
- New ThemeProvider construction (already shipped)
- New theme toggle UI (already shipped, uses `useSyncExternalStore` mounted-flag pattern)
- Redesigning pages to match Pencil mockups — that's Phase 26
- Server-rendered shiki/giscus theme switching beyond what's already configured

</domain>

<decisions>
## Implementation Decisions

### Audit Scope (D-01)
- **D-01:** Audit limited to `apps/blakepetersen.io/src/**` (TS/TSX/CSS/MD files). Does NOT re-audit `packages/artax-ui/**` — Phase 21 already established the token system there and Phase 24 verified it under playground use.

### Hardcoded Color Detection (D-02 — D-04)
- **D-02:** "Hardcoded color literal" means any of: `#[0-9a-f]{3,8}` hex literals, `rgb(` / `rgba(` / `hsl(` / `hsla(` calls, named CSS colors used as text/bg/border (`black`, `white`, `red`, etc.) — when they appear in `className`, inline `style`, or CSS-in-JS in a way that breaks dark mode.
- **D-03:** Tailwind palette utilities (e.g., `bg-amber-500`, `text-neutral-200`) ARE hardcoded for theming purposes — they must be replaced with semantic tokens (`bg-primary`, `text-foreground`, etc.) when they're used for surfaces/text/borders. Exception: utility classes inside content components that intentionally render the same color in both modes (e.g., logo brand color, syntax-highlighting overrides) are allowed but must be commented `// theme-static: <reason>`.
- **D-04:** Color literals inside MDX content files, image alt text, or copy strings are NOT violations.

### Replacement Mapping (D-05)
- **D-05:** Use the semantic token surface from `packages/artax-ui/src/styles/globals.css` as the migration target. Standard map:
  - Page bg → `bg-background`
  - Body text → `text-foreground`
  - Subdued text → `text-muted-foreground`
  - Card/panel bg → `bg-card text-card-foreground`
  - Borders → `border-border`
  - Inputs → `bg-input border-border`
  - Brand accent (the amber) → `text-primary` / `bg-primary` / `ring-ring`
  - Status colors → `text-success` / `text-info` / `text-warning` / `text-destructive`

### Verification Approach (D-06 — D-08)
- **D-06:** Static audit via grep + manual review — no codemod. The bp.io codebase is small enough that Claude Code reviewing each grep hit and proposing surgical edits is faster and safer than scripted rewrites.
- **D-07:** Visual verification: run `pnpm --filter blakepetersen.io dev`, open in browser, click through every route in `apps/blakepetersen.io/src/app/**/page.tsx`, toggle light↔dark↔system on each, check for visible artifacts. Capture nothing — this is a smoke test, not a screenshot diff suite.
- **D-08:** No automated visual regression testing introduced in this phase. Phase 26 (Pencil-matched page rewrites) is a better trigger for that conversation.

### Existing Pattern Reuse (D-09)
- **D-09:** Adopt the `useSyncExternalStore` mounted-flag pattern from `apps/blakepetersen.io/src/components/theme-toggle.tsx` as the canonical SSR-safe theme-aware client component pattern going forward — supersedes the `useState + useEffect` mounted-flag approach used in `packages/artax-ui/src/components/.../sidebar-drawer.tsx` (Phase 24.1). No retroactive refactor — flagged in deferred ideas for a future cleanup phase.

### Claude's Discretion
- Exact list of routes to walk during visual verification (D-07) — Claude enumerates from `apps/blakepetersen.io/src/app/**/page.tsx`.
- Whether a given Tailwind palette utility hit warrants a `// theme-static` comment vs replacement — judgment call per occurrence; default to replacement.
- Whether to file the discovered drift items as separate plans or one consolidated plan — Claude decides during planning based on volume.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Token System (artax-ui)
- `packages/artax-ui/src/styles/globals.css` — Light/dark CSS custom properties (`:root` + `[data-theme=dark]`); semantic surface contract that bp.io must conform to
- `packages/artax-ui/src/styles/theme.css` — `@theme` and `@theme inline` blocks; defines which utilities Tailwind v4 generates from the tokens

### Existing Theming Wiring (bp.io — already shipped)
- `apps/blakepetersen.io/src/app/layout.tsx` — `<ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem>` + `suppressHydrationWarning`; criteria 1 + 3
- `apps/blakepetersen.io/src/components/theme-toggle.tsx` — `useSyncExternalStore`-based mounted check; criterion 2 (cycle: light → system → dark)
- `apps/blakepetersen.io/src/components/header.tsx` — toggle mount point (line 27)
- `apps/blakepetersen.io/src/app/globals.css` — `@import "artax-ui/styles/globals.css"`; bp.io is a strict consumer of artax-ui tokens

### Prior Phase Decisions (relevant)
- `.planning/phases/22-artax-reference-site-scaffold/22-CONTEXT.md` — `next-themes` as peerDependency, ThemeProvider wrapper pre-configures `attribute="data-theme"` (decisions 22-01, 22-02)
- `.planning/phases/24.1-editable-previews-polish/24.1-03-SUMMARY.md` — mounted-flag pattern for Radix subtrees (now superseded by `useSyncExternalStore` for theme-aware clients per D-09)

### Roadmap source
- `.planning/ROADMAP.md` §"Phase 25: blakepetersen.io Theming" — original 4 success criteria; phase boundary anchor

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ThemeProvider` from `next-themes`: already imported and configured correctly in `apps/blakepetersen.io/src/app/layout.tsx` — no wrapper needed (bp.io intentionally uses `next-themes` directly rather than dogfooding the artax-ui ThemeProvider, since bp.io has no nested package consumers).
- `theme-toggle.tsx`: complete, accessible (aria-label per resolved theme), keyboard-friendly, SSR-safe via `useSyncExternalStore`.
- artax-ui semantic token surface: every shadcn-aligned token (`background`, `foreground`, `card`, `popover`, `muted`, `accent`, `primary`, `border`, `input`, `ring`, `destructive`, `success`, `info`, `warning`) is light/dark dual-defined.

### Established Patterns
- bp.io is a downstream consumer of artax-ui's CSS — `globals.css` imports the artax-ui bundle, so any token the audit needs already exists.
- Components in bp.io that need theme-resolved values at render time use the `useTheme()` hook and gate output behind a mounted flag (see `theme-toggle.tsx`, `shiki-theme.ts`, `giscus-theme.css` integration).
- Header is a server component; theme toggle is a client island (`'use client'`).

### Integration Points
- Routes to audit: enumerate from `apps/blakepetersen.io/src/app/**/page.tsx` during planning. Includes home, about, skills, collections, posts, etc.
- Component tree to audit: `apps/blakepetersen.io/src/components/**/*.tsx` — Header, Footer, page-specific components, MDX renderers.
- Configuration files (`tailwind.config.*`, `next.config.ts`, `postcss.config.mjs`) are out of scope unless they emit color literals.

### Anti-patterns to avoid
- Don't introduce theme-detection logic outside `useTheme()` (e.g., reading `document.documentElement.dataset.theme` directly) — the next-themes hook is the single source of truth.
- Don't add new CSS custom properties at the bp.io level — extend `packages/artax-ui/src/styles/globals.css` if a new semantic surface is needed.

</code_context>

<specifics>
## Specific Ideas

- The audit's primary deliverable is a list of replaced/justified color literals plus a one-page light-mode walkthrough confirmation (text checklist, not screenshots).
- If the audit surfaces missing semantic tokens (e.g., bp.io needs a token that artax-ui doesn't provide), planner should propose adding it to artax-ui rather than hardcoding at the bp.io level — preserves single source of truth.
- shiki (code syntax highlighting) and giscus (comments) are special cases: they have their own theme integration paths via `apps/blakepetersen.io/src/lib/shiki-theme.ts` and `apps/blakepetersen.io/public/giscus-theme.css`. The audit verifies these still react to theme changes correctly but does NOT modify their internal color schemes.

</specifics>

<deferred>
## Deferred Ideas

- **Retrofit `useSyncExternalStore` mounted-flag pattern across artax-ui** — `SidebarDrawer` (Phase 24.1) and any future theme-aware client component in artax-ui should adopt the same pattern. Belongs in a future hardening pass after v1.3 ships.
- **Visual regression testing** — Playwright screenshot diffs across both themes for every route. Defer to a future testing-infrastructure phase; Phase 26 is a better trigger.
- **Storybook-style theme preview for bp.io** — bp.io intentionally has no storybook (per Phase 21 decision). If we later want a single-page theme preview, that's its own scope.
- **Theme transition animation** — currently theme switch is instant. A cross-fade transition would be a polish item; not scoped here.

</deferred>

---

*Phase: 25-blakepetersen-io-theming*
*Context gathered: 2026-04-18*
