# artax (app)

Live playground for the `artax-ui` design system. Next.js 16 + `react-live` for in-browser component previews and prop tweaking.

## Commands (from `apps/artax/`)

- `pnpm dev` — Next dev server
- `pnpm build` — `next build` (no `--webpack` flag needed here; unlike `blakepetersen.io`, this app has no Velite pipeline)
- `pnpm typecheck` — `tsc --noEmit -p tsconfig.typecheck.json`
- `pnpm test` — Jest, `--passWithNoTests`

## Layout

- `src/app/page.tsx` — landing
- `src/app/getting-started/` — install/usage guide
- `src/app/tokens/` — design token gallery
- `src/app/components/` — per-component preview pages
- `src/components/` — playground machinery (NOT design-system primitives — those live in `artax-ui`):
  - `component-playground.tsx` + `playground-jsx-editor.tsx` — `react-live` editor wrapping a preview
  - `playground-props-form.tsx`, `props-table.tsx` — runtime prop editor + reflection table
  - `component-preview.tsx`, `code-examples.tsx` — render + source views
  - `sidebar-nav.tsx`, `sidebar-drawer.tsx`, `header.tsx`, `theme-toggle.tsx` — chrome
  - `token-swatch.tsx`, `typography-specimen.tsx` — token preview surfaces

## Gotchas

- Consumes `artax-ui` via `workspace:*`; design-system primitives (Button, Card, etc.) come from there, not from `src/components/`
- `next.config.ts` declares `transpilePackages: ['artax-ui']` — required because `artax-ui` is consumed as TS source (no build step). Don't remove it. Turbopack is enabled via `turbopack: {}`.
- `react-live` evaluates JSX strings client-side — don't import server-only modules into playground scopes
- Tailwind v4 + `tw-animate-css`; Tailwind config is implicit (CSS-first via `@tailwindcss/postcss`)
- Uses `next-themes`; theme provider is re-exported from `artax-ui`
