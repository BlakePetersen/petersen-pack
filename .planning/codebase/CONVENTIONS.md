# Coding Conventions

**Analysis Date:** 2026-03-07

## Naming Patterns

**Files:**

- Components use PascalCase directories with `index.tsx` entry point: `src/components/CardImage/index.tsx`
- Styles use `styles.ts` co-located in component directory: `src/components/Card/styles.ts`
- Types use `types.ts` co-located in component directory: `src/components/Card/types.ts`
- Exception: `dalebridges.com` uses `{name}.tsx` / `{name}.styles.ts` pattern with barrel `index.ts`: `src/components/Footer/footer.tsx`, `src/components/Footer/footer.styles.ts`, `src/components/Footer/index.ts`
- Exception: `blakepetersen.io` uses lowercase kebab-case files without directories: `src/components/primitives/post-preview.tsx`, `src/components/layout/header.tsx`
- Pages use lowercase: `src/pages/index.tsx`, `src/app/page.tsx`
- Utility/lib files use lowercase: `src/lib/routes.ts`, `src/config/constants.ts`

**Components:**

- PascalCase for component names: `Gallery`, `Header`, `MainNav`
- Arrow function components (not function declarations): `const Header = () => { ... }`
- Default exports for page-level and standalone components: `export default Header`
- Named exports for shared library components in `artax-ui`: `export const Card: CardTypes = ...`

**Styled Components (Private):**

- Prefixed with underscore: `_Card`, `_Hero`, `_Gallery`, `_StickyHeader`
- This convention distinguishes styled primitives from logical components

**Variables:**

- Local/private variables prefixed with underscore: `_posts`, `_routes`, `_tags`, `_canvasHeight`
- Constants use PascalCase objects with UPPER_CASE nested keys: `Constants.GTM.ID`, `Constants.SANITY.API.VERSION`

**Types:**

- Type aliases use PascalCase: `CardTypes`, `HeroTypes`, `Types`
- Interfaces use PascalCase with descriptive suffix: `StickyHeaderProps`, `TrianglesProps`
- Component types defined as `FC<Props>` pattern

## Code Style

**Formatting:**

- Prettier with config at `.prettierrc.json`
- Key settings:
  - `tabWidth: 2`
  - `semi: false` (no semicolons)
  - `trailingComma: "none"` (no trailing commas)
  - `printWidth: 80`
  - `arrowParens: "avoid"` (omit parens for single-param arrows)
  - `singleQuote: true`

**Linting:**

- ESLint 9 with flat config at `eslint.config.mjs`
- TypeScript-ESLint recommended rules
- React, React Hooks, and jsx-a11y plugins
- Key rule overrides:
  - `@typescript-eslint/no-explicit-any: off` (any is allowed)
  - `@typescript-eslint/no-unused-vars: warn` with `_` prefix ignore pattern
  - `react/react-in-jsx-scope: off` (React 17+ JSX transform)
  - `react/prop-types: off` (TypeScript handles prop validation)
  - `no-console: off` (console usage is allowed)

**TypeScript:**

- `strict: false` in Next.js tsconfig (`packages/tsconfig/nextjs.json`)
- `strict: true` in base tsconfig (`packages/tsconfig/base.json`)
- `skipLibCheck: true` across all configs
- Path alias `@/*` maps to `src/*` (root `tsconfig.json`)

## Import Organization

**Order (observed pattern):**

1. Third-party packages (`react`, `next`, `styled-components`, `@radix-ui/*`)
2. Internal packages (`artax-ui`, `config`)
3. Local path-aliased imports (`@/components/*`, `@/config/*`, `@/lib/*`)
4. Relative imports (`./styles`, `./types`)

**Path Aliases:**

- `@/*` -> `src/*` (configured in root `tsconfig.json`)

**Style Imports:**

- Styled components imported from co-located `./styles`: `import { _Card } from './styles'`
- Types imported from co-located `./types`: `import { CardTypes } from './types'`

## Component Structure

**Three-file pattern (primary in `artax-ui` and `ashleypetersenphoto.com`):**

- `index.tsx` - Component logic and JSX
- `styles.ts` - Styled components (Stitches or styled-components)
- `types.ts` - TypeScript type definitions

**Example (`packages/artax-ui/src/components/Card/`):**

```typescript
// types.ts
import React, { FC } from 'react'
export type CardTypes = FC<{
  children: JSX.Element
}>

// styles.ts
import { styled } from '@stitches/react'
export const _Card = styled('div', { ... })

// index.tsx
import { _Card } from './styles'
import { CardTypes } from './types'
export const Card: CardTypes = ({ children }) => {
  return <_Card>{children}</_Card>
}
```

**Single-file pattern (used in `blakepetersen.io`):**

- Styled components, interfaces, and logic co-located in one file
- Example: `apps/blakepetersen.io/src/components/layout/header.tsx`

## Styling Approaches

**Two CSS-in-JS libraries coexist:**

- **Stitches** (`@stitches/react`): Used in `artax-ui` package and `ashleypetersenphoto.com`
  - Config at `packages/config/stitches.config.ts` and `apps/ashleypetersenphoto.com/src/config/stitches.config.ts`
  - Uses `styled()` API with object syntax
- **styled-components**: Used in `blakepetersen.io`
  - Uses tagged template literals
  - Transient props prefixed with `$`: `$isTop`, `$trianglesPattern`

**SCSS:** Used for global styles only (`global-styles.scss`)

## Error Handling

**Patterns:**

- Promise `.catch()` chains with `console.error()`: `apps/blakepetersen.io/src/pages/api/transactional-email.ts`
- No centralized error handling or error boundary pattern observed
- API routes return HTTP status codes with JSON messages: `res.status(500).json({ message: ... })`

## Logging

**Framework:** Console (`console.log`, `console.error`)

- `next-axiom` is installed as a dependency in all apps but usage is not prominent in source files

## Comments

**ABOUTME Convention:**

- Only present in `eslint.config.mjs`
- Not yet adopted across the codebase

**General:**

- Minimal commenting throughout
- Some commented-out code exists (e.g., `packages/artax-ui/index.ts` has commented exports)

## Module Design

**Exports:**

- Default exports for app-level components and pages
- Named exports for shared library components in `artax-ui`
- Barrel file at `packages/artax-ui/index.ts` re-exports all public components and utilities

**Client/Server Directives:**

- `'use client'` directive used in interactive components: `apps/ashleypetersenphoto.com/src/components/Gallery/index.tsx`, `apps/ashleypetersenphoto.com/src/components/Header/index.tsx`
- Server components are the default in `ashleypetersenphoto.com` (Next.js App Router)

## Git Conventions

**Commit Messages:**

- Conventional Commits enforced via `@commitlint/config-conventional`
- Commitlint config at `.commitlintrc.json`
- Husky hooks:
  - `pre-commit`: runs `pnpm lint-staged`
  - `commit-msg`: validates commit message format (currently calls `yarn` - should be `pnpm`)
  - `pre-push`: runs tests (currently calls `yarn` - should be `pnpm`)

**Lint-Staged:**

- Runs ESLint with `--quiet --fix` on `apps/**/*.{js,jsx,ts,tsx}`
- Runs Prettier on `*.{json,md}`

---

_Convention analysis: 2026-03-07_
