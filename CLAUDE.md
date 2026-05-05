# Luna Photography Website

Photography portfolio + client management for Ashley Petersen Photography.
Next.js 16 (App Router) · React 19 · Prisma · PostgreSQL · Tailwind · NextAuth v5 (beta) · Sentry · pino.

## Quick Start

```bash
docker compose up -d        # Postgres on :5432 (luna/postgres/postgres)
cp .env.example .env.local  # then fill required vars (see lib/env.ts)
pnpm install
pnpm db:generate && pnpm db:migrate
pnpm dev                    # Next dev on :3333
```

## Commands

| Command           | What it does                                     |
| ----------------- | ------------------------------------------------ |
| `pnpm dev`        | Next dev server on port **3333** (not 3000)      |
| `pnpm build`      | Production build                                 |
| `pnpm lint`       | ESLint                                           |
| `pnpm type-check` | `tsc --noEmit`                                   |
| `pnpm lint:all`   | lint + type-check + prettier check (pre-PR gate) |
| `pnpm test`       | **Playwright E2E** (not unit)                    |
| `pnpm test:unit`  | Vitest unit tests                                |
| `pnpm db:studio`  | Prisma Studio (sets local DATABASE_URL inline)   |
| `pnpm db:seed`    | Seed via `prisma/seed.ts`                        |
| `pnpm storybook`  | Storybook on :6006                               |

## Layout

- `app/` — App Router. `app/admin/**` (staff), `app/client-portal/**` (PIN-gated), `app/api/**` (route handlers).
- `components/luna/` — public-site components. `components/sol/` — admin/internal components. `components/commons/` — shared primitives.
- `lib/` — server utilities (auth, env, logger, prisma, request-context, validations).
- `prisma/` — schema, migrations, seeds.
- `proxy.ts` — **this is the Next 16 rename of `middleware.ts`**. Gates `/admin` and `/client-portal/dashboard` for session presence; **does not** protect `/api/**` (those use `withAdminAuth` wrappers).
- `auth.ts` — NextAuth v5 config (Credentials provider, JWT sessions, role on token).
- `tools/scripts/` — one-off TS scripts run via `tsx` (image scraping, seeding, perf checks).

## Conventions (non-obvious)

- **Every code file starts with a 2-line `// ABOUTME:` header** describing purpose. Match the surrounding pattern.
- **Never `console.*` in `app/**`, `components/{luna,sol}/**`, or `lib/**`** — ESLint blocks it. Use `lib/logger.ts`(pino, Node) or`lib/logger.edge.ts` (Edge runtime). PII redaction is configured at logger init; don't bypass it.
- **Env vars are validated at build time** via `@t3-oss/env-nextjs` + Zod in `lib/env.ts`. Add new vars there (server vs client) — don't read `process.env` directly in app code.
- **Pre-commit hook** runs `lint-staged` (eslint --fix + prettier) on staged TS/TSX. Never bypass with `--no-verify`.
- Path alias: `@/*` → repo root (e.g. `@/lib/prisma`, `@/auth`).
- Package manager: **pnpm 10.x** (see `.tool-versions`); Node 24 LTS.

## Planning artifacts

`.planning/` holds GSD phase docs (PROJECT.md, ROADMAP.md, REQUIREMENTS.md, phases/). Read these for context on in-flight initiatives; never commit to `.planning/` from a feature branch destined for PR — use `/gsd-pr-branch`.
