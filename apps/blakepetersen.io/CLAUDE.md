# blakepetersen.io

Personal site. Next.js 16 + React 19, MDX content via Velite, Pagefind for search, Shiki for code highlighting.

## Commands (from `apps/blakepetersen.io/`)

- `pnpm dev` — Next dev server (`next dev --webpack` — the VeliteWebpackPlugin only fires in the webpack hook, so Turbopack dev serves stale `.velite/` content)
- `pnpm build` — `next build --webpack` (see gotcha below) + `pagefind` postbuild
- `pnpm velite` — rebuild Velite collections only (`.velite/`)
- `pnpm typecheck` — uses `tsconfig.typecheck.json` (stricter than build config)
- `pnpm test` — Jest (via turbo it builds this app first — registry-endpoint tests read `public/r/`)

## Key files

- `velite.config.ts` — MDX collection definitions; input is `content/**`, output is `.velite/`
- `next.config.ts` — Next config; wraps Velite build step
- `src/app/` — App Router routes
- `src/components/` — site-specific components (shared ones live in `artax-ui`)
- `src/lib/` — site-specific helpers (content loaders, formatters)
- `src/hooks/` — React hooks
- `src/types/` — site-local TypeScript types
- `content/` — source MDX (`posts/`, `guides/`, `configs/`, `hooks/`, `skills/`)

## Cross-package usage

- Consumes `artax-ui` (design system) via `workspace:*`
- Imports types only from `blink-registry` (e.g. `ArtifactMetadata` in `src/lib/artifacts.ts`); the registry's runtime/Zod usage lives in `@blink/cli`, not here

## Gotchas

- **Build uses webpack, not Turbopack** — Velite's transformer pipeline isn't Turbopack-compatible yet. Do not switch to `next build --turbo`.
- **Pagefind runs in `postbuild`** against `.next/server/app` → writes `public/pagefind/`. Search breaks if `.next/` is cleaned after build without a rebuild.
- **MDX articles can reference `.artifact.md` / `.artifact/` siblings** — these are inputs to the build (turbo hashes all tracked package files by default).
- **`stitches.config.ts` is legacy** — styling is now Tailwind v4 (`@tailwindcss/postcss`). Don't add new Stitches usage.
- **Shiki via `@shikijs/rehype`** — changes to code block rendering go through Velite's rehype pipeline, not Next's.

## Workflow notes

- Adding a new content type = new Velite collection in `velite.config.ts` (turbo picks up new content files automatically — no input glob needed).
- The GSD workflow artifacts for this app live at the repo root (`.planning/`), not here.
