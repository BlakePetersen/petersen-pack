# artax-ui

Shared design system. shadcn/ui-derived primitives organized by atomic design, Tailwind v4 theme, MDX renderer bundle, theme provider.

## Commands (from `packages/artax-ui/`)

- `pnpm test` — Jest (jsdom)
- No build step — package is consumed via TS source (`"main": "./src/index.ts"`)

## Multi-entry exports

Subpath imports are real and load-bearing:

- `artax-ui` → component primitives, `cn`, `tokens`, `mdxComponents`, `ThemeProvider`
- `artax-ui/styles/theme.css` — design tokens (CSS variables)
- `artax-ui/styles/globals.css` — base + reset
- `artax-ui/mdx` — `mdxComponents` mapping for MDX rendering
- `artax-ui/lib/utils` — `cn` helper only (lighter import surface)

`sideEffects: ["**/*.css"]` keeps tree-shaking working while preserving CSS imports.

## Layout

- `src/components/atoms/` — Button, Input, Badge, Separator, CopyButton, Toggle
- `src/components/molecules/` — Card, Table, Callout, CodeBlock, Tabs, Tooltip, PrevNextNav, AuthorNote, DecisionRationale
- `src/components/organisms/` — Accordion, Dialog, Modal, Dropdown
- `src/lib/utils.ts` — `cn` (clsx + tailwind-merge)
- `src/mdx/components.tsx` — MDX → component mapping (consumed by `apps/blakepetersen.io`)
- `src/providers/theme-provider.tsx` — `next-themes` wrapper, exports `useTheme` and `Theme` type
- `src/styles/` — `theme.css` (tokens), `globals.css`, `tokens.ts` (typed token names)

## Gotchas

- **shadcn-style, not vanilla shadcn** — `components.json` aliases point at `artax-ui/components`, `artax-ui/lib`, etc. Re-running `npx shadcn add` would scaffold into the consuming app; this package re-exports its own variants.
- **RSC-aware** (`rsc: true` in `components.json`) — components that need client behavior must declare `'use client'` explicitly; many radix-backed organisms do.
- **Adding a new component** = create under the right atomic-design tier, then export from `src/index.ts` (it's the single public-API source of truth).
- **Tokens are typed** — `BgToken`, `TextToken`, `BorderToken`, `RingToken`, `FontToken` come from `src/styles/tokens.ts`; prefer these over hardcoded class strings in primitives.
- **Peer deps**: `react`, `react-dom`, `next-themes` — consumers must provide them.
- **Designs live in `bp.io.pen`** — use `mcp__pencil__*` tools to inspect, never `Read`/`Grep` (encrypted).
