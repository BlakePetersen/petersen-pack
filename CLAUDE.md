# petersen-group

Monorepo: pnpm workspaces + Turbo. Three Next.js 16 apps (two CI-gated; `apps/luna` is gate-exempt pending reintegration — backlog 999.4), four shared packages.

## Stack

- Node 24.14.0, pnpm 10.28.2 (pinned via `.tool-versions` / mise)
- Next.js 16.2.x, React 19.2.4, Tailwind v4
- Turbo 2.x, ESLint flat config, Jest, Husky + commitlint

## Commands (run from repo root)

- `pnpm dev` — run every app's dev server in parallel
- `pnpm build` — production build across workspaces
- `pnpm test` — Jest across workspaces (turbo builds dependencies first)
- `pnpm typecheck` — `tsc --noEmit` against each app's `tsconfig.typecheck.json`
- `pnpm lint` — ESLint flat config
- `pnpm lint:content` — `blink lint` over bp.io's MDX content (frontmatter schema, artifact pairs, voice primitives)
- `pnpm format` — Prettier on `**/*.{ts,tsx,md}`
- `pnpm test:scripts` — Jest for `.github/scripts/` (separate config)

## Layout

- `apps/blakepetersen.io` — personal site; Velite MDX pipeline, Pagefind search (`postbuild`), Shiki highlighting. See `apps/blakepetersen.io/CLAUDE.md`.
- `apps/artax` — live showcase/playground for `artax-ui` components (Next.js + `react-live` for in-browser code previews)
- `packages/artax-ui` — shared design system (Tailwind v4 theme, `mdx/components`, `lib/utils`)
- `packages/blink-registry` — Zod-schema content registry
- `packages/blink-cli` — CLI on top of `blink-registry` (built with `tsup`)
- `packages/tsconfig` — shared tsconfig presets (`base.json`, `nextjs.json`, `react-library.json`)
- `.github/scripts/` — repo automation (Octokit + Anthropic SDK); has its own Jest config, run via `pnpm test:scripts`
- `docs/` — long-form repo docs (not the GSD `.planning/` workflow)

## Gotchas

- `apps/blakepetersen.io` builds with `next build --webpack` (NOT Turbopack) — Velite/Shiki compatibility
- `postbuild` runs Pagefind against `.next/server/app` → writes `public/pagefind/`
- `.planning/` is the GSD workflow directory (ROADMAP/PHASE/PLAN artifacts) — not arbitrary docs
- Workspace imports use `workspace:*` (e.g. `"artax-ui": "workspace:*"`)
- Pre-commit: Husky runs commitlint; never bypass with `--no-verify`
- Typecheck config is separate from build config: `tsconfig.typecheck.json` per app
- `node-compile-cache/` at the repo root is a Node cache artifact — gitignored, safe to delete
- `pnpm.overrides` in root `package.json` pins security advisories (postcss, ajv, glob, etc.) — don't loosen without checking the advisory
- Node/pnpm versions are pinned via `.tool-versions`; install [mise](https://mise.jdx.dev/) and run `mise install` to match

## Design system reference

`artax-ui` components map to designs in the `bp.io.pen` Pencil file. Use `mcp__pencil__*` tools to inspect `.pen` files — never `Read`/`Grep`, contents are encrypted.
