# Phase 25: blakepetersen.io Theming - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-18
**Phase:** 25-blakepetersen-io-theming
**Mode:** Autonomous (`/gsd-autonomous --from 25`) → reframed mid-discuss when codebase scout revealed theming infrastructure already shipped
**Areas discussed:** Phase reframing, Audit scope, Hardcoded color detection, Replacement mapping, Verification approach

---

## Phase Reframing (pre-discuss decision)

| Option | Description | Selected |
|--------|-------------|----------|
| Audit-only Phase 25 | Verify existing wiring + scan src/ for hardcoded literals + visual smoke test | ✓ |
| Fold into Phase 26 | Skip Phase 25; let the page-rewrite work in Phase 26 catch any drift organically | |
| Run Phase 25 as written | Treat as greenfield even though theming infra exists; full discuss/plan/execute | |

**User's choice:** Audit-only Phase 25
**Notes:** Codebase scout (apps/blakepetersen.io/src/app/layout.tsx, theme-toggle.tsx, globals.css) confirmed criteria 1–3 of Phase 25 are functionally complete — ThemeProvider wired with `attribute="data-theme"`, defaultTheme="dark", `enableSystem`, `suppressHydrationWarning`; theme-toggle uses `useSyncExternalStore` for SSR-safe mounted check; bp.io globals.css imports artax-ui token CSS. Only criterion #4 ("no hardcoded color artifacts") needs verification. Blake chose the audit path so Phase 26 starts from a known-clean token foundation.

---

## Audit Scope

| Option | Description | Selected |
|--------|-------------|----------|
| `apps/blakepetersen.io/src/**` only | Trust artax-ui (already verified in Phases 21/24); audit only the consumer | ✓ |
| Full monorepo color audit | Re-scan packages/artax-ui as well | |

**User's choice:** bp.io only (auto-recommended)
**Notes:** artax-ui token system was the deliverable of Phase 21; Phase 24 exercised it under live preview. Re-auditing would be redundant. Recorded as D-01.

---

## Hardcoded Color Detection — definition

| Option | Description | Selected |
|--------|-------------|----------|
| Hex + rgb/hsl + named CSS colors + Tailwind palette utilities | Strict — Tailwind utilities like `bg-amber-500` count as drift | ✓ |
| Hex + rgb/hsl only | Loose — Tailwind palette utilities allowed | |

**User's choice:** Strict definition (auto-recommended)
**Notes:** Tailwind palette utilities used for surfaces/text/borders bypass the semantic token system and break the theming contract — they must be replaced. Brand-static cases (logo amber, syntax highlighter overrides) get a `// theme-static: <reason>` opt-out comment. Recorded as D-02 — D-04.

---

## Replacement Mapping

| Option | Description | Selected |
|--------|-------------|----------|
| Standard shadcn-aligned semantic tokens from artax-ui globals.css | Use `bg-background`, `text-foreground`, `text-muted-foreground`, etc. | ✓ |
| Inline CSS variables | Drop down to `var(--background)` directly | |

**User's choice:** Tailwind utility classes generated from artax-ui `@theme inline` (auto-recommended)
**Notes:** Token system already exposes utilities — no need to bypass to raw CSS variables. Recorded as D-05.

---

## Verification Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Static audit + manual surgical edits + dev-server visual smoke | Grep, review each hit, fix in place; manual click-through both modes | ✓ |
| Codemod (jscodeshift) | Scripted rewrite of color literals | |
| Playwright visual regression suite | Screenshot diff across all routes both modes | |

**User's choice:** Static + manual + visual smoke (auto-recommended)
**Notes:** bp.io codebase is small enough that human review of grep hits is faster and safer than codemod. VRT is real value but belongs in its own infrastructure phase — deferred. Recorded as D-06 — D-08.

---

## Pattern Promotion

| Option | Description | Selected |
|--------|-------------|----------|
| Adopt `useSyncExternalStore` mounted-flag pattern from theme-toggle as canonical | Going forward, theme-aware client islands use this; SidebarDrawer (24.1) retrofit deferred | ✓ |
| Keep both patterns | `useState + useEffect` (24.1 SidebarDrawer) AND `useSyncExternalStore` (theme-toggle) coexist | |

**User's choice:** Promote `useSyncExternalStore` (auto-recommended)
**Notes:** Cleaner React 18+ idiom; no double render on mount. Retrofit of existing artax-ui components deferred to a future hardening phase to keep Phase 25 scope tight. Recorded as D-09.

---

## Claude's Discretion

- Exact route enumeration for visual smoke test (D-07) — derived from `apps/blakepetersen.io/src/app/**/page.tsx` at planning time.
- Per-occurrence judgment on `// theme-static` opt-out vs replacement.
- Whether audit findings warrant 1 consolidated plan or N targeted plans — planner decides based on volume.

## Deferred Ideas

- Retrofit `useSyncExternalStore` mounted-flag across artax-ui (SidebarDrawer + future Radix subtree wrappers)
- Playwright visual regression testing for both themes across all routes
- Storybook-equivalent theme preview page for bp.io
- Theme transition cross-fade animation
