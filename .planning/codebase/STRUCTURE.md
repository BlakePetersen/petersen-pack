# Codebase Structure

**Analysis Date:** 2026-03-07

## Directory Layout

```
petersen-group/
├── apps/                          # Individual website applications
│   ├── ashleypetersenphoto.com/   # Photography portfolio (App Router)
│   ├── blakepetersen.io/          # Personal blog/site (Pages Router)
│   └── dalebridges.com/           # Personal site (Pages Router)
├── packages/                      # Shared packages
│   ├── artax-ui/                  # Shared UI component library
│   ├── config/                    # Shared config (ESLint, Stitches, constants)
│   └── tsconfig/                  # Shared TypeScript configs
├── docs/                          # Documentation (contains plans/ dir)
├── .github/workflows/             # CI (CodeQL analysis only)
├── .husky/                        # Git hooks (commit-msg, pre-commit, pre-push)
├── .planning/                     # GSD planning documents
├── eslint.config.mjs              # Root ESLint flat config
├── turbo.json                     # Turborepo task configuration
├── pnpm-workspace.yaml            # pnpm workspace definition
├── package.json                   # Root package with workspace scripts
├── tsconfig.json                  # Root TypeScript config
└── .prettierrc.json               # Prettier formatting config
```

## Directory Purposes

**`apps/ashleypetersenphoto.com/`:**

- Purpose: Photography portfolio website
- Router: Next.js App Router
- Structure:
  - `src/app/` - Route segments (about, blog, book, contact, portfolio, services)
  - `src/components/` - PascalCase directories, each with `index.tsx`, `styles.ts`, optional `types.ts`
  - `src/config/` - App constants
  - `src/styles/` - Global SCSS
  - `public/images/` - Static images
- Key files: `src/app/layout.tsx` (root layout), `src/app/page.tsx` (homepage), `next.config.js`

**`apps/blakepetersen.io/`:**

- Purpose: Personal blog and portfolio
- Router: Next.js Pages Router
- Structure:
  - `src/pages/` - File-based routes (index, about, posts/[slug], tags/[tag])
  - `src/pages/api/` - API routes (contentful, transactional-email, twitter)
  - `src/components/` - kebab-case files, organized by feature (layout/, nav/, posts/, primitives/)
  - `src/config/` - App constants
  - `src/helpers/` - Utility JS files (store, util)
  - `src/lib/` - Library code (progress-bar, routes, twitter-bar)
  - `src/styles/` - SCSS partials, JS color/breakpoint exports, vendor styles, font files
- Key files: `src/pages/_app.tsx` (app wrapper), `src/pages/api/contentful.ts` (CMS client)

**`apps/dalebridges.com/`:**

- Purpose: Simple personal website
- Router: Next.js Pages Router
- Structure:
  - `src/pages/` - Minimal routes (index only)
  - `src/components/` - PascalCase directories with barrel files (Footer/, Frame/, Header/)
  - `src/styles/` - Global SCSS
- Key files: `src/pages/_app.tsx` (app wrapper), `src/pages/index.tsx` (homepage)

**`packages/artax-ui/`:**

- Purpose: Shared UI component library across all sites
- Structure:
  - `index.ts` - Barrel file re-exporting all components and utilities
  - `src/components/` - PascalCase component directories (Card, Grid, Hero, Menu, Page, Section, etc.)
  - `src/utilities/` - PascalCase utility directories (Environment, Io, Middleware, Numbers, Types)
- Key files: `index.ts` (public API), `src/components/SanityClient/index.ts` (shared CMS client)

**`packages/config/`:**

- Purpose: Shared configuration consumed by apps and packages
- Contains: `constants.ts` (GTM ID, Sanity API version), `stitches.config.ts` (theme), ESLint configs
- Key files: `stitches.config.ts` (design tokens, breakpoints, dark theme)

**`packages/tsconfig/`:**

- Purpose: Shared TypeScript compiler configurations
- Contains: `base.json`, `nextjs.json`, `react-library.json`
- Key files: `nextjs.json` (extended by root `tsconfig.json`)

## Key File Locations

**Entry Points:**

- `apps/ashleypetersenphoto.com/src/app/layout.tsx`: App Router root layout
- `apps/blakepetersen.io/src/pages/_app.tsx`: Pages Router app wrapper
- `apps/dalebridges.com/src/pages/_app.tsx`: Pages Router app wrapper

**Configuration:**

- `turbo.json`: Turborepo pipeline config
- `pnpm-workspace.yaml`: Workspace package locations
- `eslint.config.mjs`: Root ESLint 9 flat config
- `.prettierrc.json`: Prettier settings
- `.commitlintrc.json`: Conventional commits config
- `tsconfig.json`: Root TypeScript config (extends `packages/tsconfig/nextjs.json`)
- `apps/*/next.config.js`: Per-app Next.js configuration

**CMS Clients:**

- `packages/artax-ui/src/components/SanityClient/index.ts`: Shared Sanity client
- `apps/blakepetersen.io/src/pages/api/contentful.ts`: Contentful client (blakepetersen.io only)

**API Routes:**

- `apps/blakepetersen.io/src/pages/api/contentful.ts`: Content fetching
- `apps/blakepetersen.io/src/pages/api/transactional-email.ts`: SendGrid email
- `apps/blakepetersen.io/src/pages/api/twitter/profile/[screenName].ts`: Twitter profile proxy

**Styling:**

- `packages/config/stitches.config.ts`: Shared Stitches theme (tokens, breakpoints, dark mode)
- `apps/ashleypetersenphoto.com/src/config/stitches.config.ts`: App-specific Stitches config
- `apps/*/src/styles/`: Per-app global SCSS

**Git Hooks:**

- `.husky/commit-msg`: Runs commitlint (conventional commits)
- `.husky/pre-commit`: Runs lint-staged (ESLint + Prettier)
- `.husky/pre-push`: Runs tests

## Naming Conventions

**Files:**

- Components in ashleypetersenphoto.com and dalebridges.com: PascalCase directories with `index.tsx` barrel (`Card/index.tsx`, `Hero/index.tsx`)
- Components in blakepetersen.io: kebab-case files (`post-preview.tsx`, `page-progress.tsx`)
- Component styles: `styles.ts` (colocated) or `{name}.styles.ts` (dalebridges.com)
- Type definitions: `types.ts` (colocated in component directory)
- Config files: `constants.ts` for app constants
- Pages: kebab-case or `[param]` for dynamic routes

**Directories:**

- App components: PascalCase (`CallToAction/`, `CardImage/`) except blakepetersen.io (lowercase: `layout/`, `nav/`, `posts/`, `primitives/`)
- Shared package components: PascalCase (`Avatar/`, `Grid/`, `Section/`)
- Shared utilities: PascalCase (`Environment/`, `Middleware/`)

## Where to Add New Code

**New App:**

- Create directory: `apps/{domain}/`
- Include: `package.json`, `next.config.js`, `tsconfig.json` (extend root), `src/` directory
- Add workspace scripts to root `package.json` following existing pattern (`build:{alias}`, `dev:{alias}`, `start:{alias}`)
- Use `artax-ui` for shared components, `config` for shared theming

**New Shared Component:**

- Implementation: `packages/artax-ui/src/components/{ComponentName}/index.tsx`
- Styles: `packages/artax-ui/src/components/{ComponentName}/styles.ts`
- Types: `packages/artax-ui/src/components/{ComponentName}/types.ts`
- Export: Add `export * from './src/components/{ComponentName}'` to `packages/artax-ui/index.ts`

**New App-Specific Component:**

- ashleypetersenphoto.com: `apps/ashleypetersenphoto.com/src/components/{ComponentName}/index.tsx` + `styles.ts` + `types.ts`
- blakepetersen.io: `apps/blakepetersen.io/src/components/{feature}/{component-name}.tsx`
- dalebridges.com: `apps/dalebridges.com/src/components/{ComponentName}/index.ts` (barrel) + `{name}.tsx` + `{name}.styles.ts`

**New Page/Route:**

- ashleypetersenphoto.com (App Router): `apps/ashleypetersenphoto.com/src/app/{route}/page.tsx`
- blakepetersen.io (Pages Router): `apps/blakepetersen.io/src/pages/{route}.tsx`
- dalebridges.com (Pages Router): `apps/dalebridges.com/src/pages/{route}.tsx`

**New API Route:**

- Location: `apps/blakepetersen.io/src/pages/api/{endpoint}.ts`
- Only blakepetersen.io has API routes currently

**New Shared Utility:**

- Location: `packages/artax-ui/src/utilities/{UtilityName}/index.ts`
- Export: Add to `packages/artax-ui/index.ts`

## Special Directories

**`.next/`:**

- Purpose: Next.js build output
- Generated: Yes
- Committed: No

**`.turbo/`:**

- Purpose: Turborepo cache and daemon state
- Generated: Yes
- Committed: No

**`.trash/`:**

- Purpose: Archived/removed projects (contains old iriganggang.com subgraph code)
- Generated: No
- Committed: Partially (has untracked files)

**`docs/plans/`:**

- Purpose: Planning documents (gitignored)
- Generated: No
- Committed: No

---

_Structure analysis: 2026-03-07_
