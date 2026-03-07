# Technology Stack

**Analysis Date:** 2026-03-07

## Languages

**Primary:**

- TypeScript 5.9.3 - All app and package source code
- TSX - React components across all apps

**Secondary:**

- JavaScript (CommonJS) - Next.js configs (`next.config.js`), ESLint configs
- SCSS/Sass - Styling in blakepetersen.io and ashleypetersenphoto.com

## Runtime

**Environment:**

- Node.js LTS (specified in `.tool-versions` as `nodejs lts`)

**Package Manager:**

- pnpm 9.0.0 (declared via `packageManager` field in root `package.json`)
- Lockfile: `pnpm-lock.yaml` present
- Workspace config: `pnpm-workspace.yaml`

## Frameworks

**Core:**

- Next.js 16.0.5 - All three apps use Next.js for SSR/SSG
- React 19.2.0 - UI framework across all apps

**UI Libraries:**

- Radix UI Themes 3.1.3 - Component library for blakepetersen.io
- Radix UI primitives (avatar, dropdown-menu, switch, icons, label) - Used in ashleypetersenphoto.com and artax-ui
- Stitches 1.2.8 - CSS-in-JS used across artax-ui and multiple apps
- styled-components 6.1.13 - CSS-in-JS in blakepetersen.io
- Framer Motion 12.23.24 - Animations in blakepetersen.io

**Testing:**

- Jest 30.2.0 - Test runner (root devDependency)
- jest-environment-jsdom 30.2.0 - Browser environment for tests
- @testing-library/react 16.3.0 - React component testing
- @testing-library/jest-dom 6.9.1 - DOM assertions
- @testing-library/user-event 14.6.1 - User interaction simulation

**Build/Dev:**

- Turborepo 2.6.1 - Monorepo build orchestration (`turbo.json`)
- ESLint 9.39.1 - Linting with flat config (`eslint.config.mjs`)
- Prettier 3.6.2 - Code formatting
- Husky 9.1.7 - Git hooks
- lint-staged 16.2.7 - Pre-commit lint on staged files
- Commitlint 20.1.0 - Conventional commit message enforcement

## Key Dependencies

**Critical:**

- `contentful` 10.15.1 - CMS client for blakepetersen.io blog content
- `@sanity/client` 6.21.3 - CMS client (in blakepetersen.io and ashleypetersenphoto.com deps)
- `@sanity/image-url` 1.0.2 - Sanity CDN image URL builder
- `groq` 3.57.3 - Sanity query language (blakepetersen.io, ashleypetersenphoto.com)
- `next-axiom` 1.5.1 - Logging/observability for all three apps
- `@vercel/analytics` ^1.3.1 - Analytics for all three apps

**Web3 (blakepetersen.io only):**

- `@rainbow-me/rainbowkit` 2.1.6 - Wallet connection UI
- `ethers` 6.13.2 - Ethereum library

**Data Fetching:**

- `swr` 2.2.5 - React data fetching hooks (blakepetersen.io)

**Email:**

- `@sendgrid/mail` 8.1.3 - Transactional email (blakepetersen.io devDeps)

**Content Processing:**

- `remark` 15.0.1 + plugins - Markdown processing (blakepetersen.io)
- `html-to-text` 9.0.5 - HTML to plaintext conversion for emails
- `moment` 2.30.1 / `react-moment` 1.1.3 - Date formatting

**Infrastructure:**

- `next-themes` 0.3.0 - Dark/light theme switching (all apps)
- `next-compose-plugins` 2.2.1 - Next.js plugin composition
- `sharp` 0.33.5 - Image optimization (ashleypetersenphoto.com)

## Monorepo Structure

**Workspace Layout:**

- `apps/*` - Three Next.js applications
- `packages/*` - Three shared packages

**Apps:**

- `apps/blakepetersen.io` - Personal site/blog with Web3 features
- `apps/ashleypetersenphoto.com` - Photography portfolio site
- `apps/dalebridges.com` - Business/personal site

**Shared Packages:**

- `packages/artax-ui` - Shared UI component library (Radix + Stitches based, pinned to Next 14.0.3)
- `packages/config` - Shared ESLint configurations (legacy, uses older ESLint deps)
- `packages/tsconfig` - Shared TypeScript configurations (`base.json`, `nextjs.json`, `react-library.json`)

## Configuration

**TypeScript:**

- Root `tsconfig.json` extends `packages/tsconfig/nextjs.json`
- Target: ES5, Module: ESNext, JSX: preserve
- Path alias: `@/*` maps to `src/*`
- Strict mode: disabled (`"strict": false`)

**ESLint:**

- Flat config at `eslint.config.mjs`
- Plugins: typescript-eslint, react, react-hooks, jsx-a11y
- `@typescript-eslint/no-explicit-any`: off
- `react/react-in-jsx-scope`: off (React 19 auto-import)

**Git Hooks:**

- Pre-commit: `pnpm lint-staged` (lints staged `.ts`/`.tsx` files, formats `.json`/`.md`)
- Commit-msg: commitlint with conventional commits (still references `yarn` - needs update)
- Pre-push: exists but content not checked

**Build:**

- Turborepo manages task dependencies via `turbo.json`
- Build outputs: `dist/**`, `.next/**`
- `dev` task has caching disabled

## Platform Requirements

**Development:**

- Node.js LTS
- pnpm 9.0.0+
- `.env.local` files per app for API keys

**Production:**

- Vercel (inferred from `@vercel/analytics`, `next-axiom`, and Next.js usage)
- No `vercel.json` config files present

---

_Stack analysis: 2026-03-07_
