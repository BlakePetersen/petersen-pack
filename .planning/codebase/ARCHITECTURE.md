# Architecture

**Analysis Date:** 2026-03-07

## Pattern Overview

**Overall:** Turborepo monorepo containing multiple independent Next.js websites with a shared UI component library.

**Key Characteristics:**

- Multi-site monorepo: three personal/family websites sharing infrastructure
- Shared UI component library (`artax-ui`) consumed by apps
- Shared configuration packages for TypeScript, ESLint, and Stitches theming
- Each app is a standalone Next.js deployment with its own CMS integration
- No shared backend or API layer -- each app handles its own data fetching

## Apps

**ashleypetersenphoto.com** (Photography portfolio):

- Router: Next.js App Router (`src/app/`)
- CMS: Sanity (via `artax-ui` SanityClient)
- Styling: Stitches + SCSS
- Entry: `apps/ashleypetersenphoto.com/src/app/layout.tsx`

**blakepetersen.io** (Personal blog/site):

- Router: Next.js Pages Router (`src/pages/`)
- CMS: Contentful (via `contentful` SDK)
- Styling: Radix UI Themes + styled-components + SCSS
- Entry: `apps/blakepetersen.io/src/pages/_app.tsx`

**dalebridges.com** (Personal site):

- Router: Next.js Pages Router (`src/pages/`)
- CMS: None (static content)
- Styling: Stitches + SCSS
- Entry: `apps/dalebridges.com/src/pages/_app.tsx`

## Layers

**Shared Packages (`packages/`):**

- Purpose: Reusable code shared across all apps
- Location: `packages/`
- Contains:
  - `artax-ui`: UI component library (Card, Grid, Hero, Section, Page, ThemeSelector, etc.) and utilities (Environment, Io, Middleware, Numbers, Types)
  - `config`: Shared constants, ESLint configs, Stitches theme config
  - `tsconfig`: Shared TypeScript configurations (base, nextjs, react-library)
- Used by: All apps via workspace references

**App Pages/Routes:**

- Purpose: Route definitions and page-level data fetching
- Location: `apps/*/src/pages/` (Pages Router) or `apps/*/src/app/` (App Router)
- Contains: Page components, `getServerSideProps` data fetching, API routes
- Depends on: Components, CMS clients, shared packages

**App Components (`src/components/`):**

- Purpose: UI components specific to each app
- Location: `apps/*/src/components/`
- Contains: Layout components, feature-specific components
- Depends on: `artax-ui`, styling utilities

**API Routes:**

- Purpose: Server-side API endpoints
- Location: `apps/blakepetersen.io/src/pages/api/`
- Contains: Contentful data fetching, SendGrid email, Twitter profile proxy
- Only blakepetersen.io has API routes

**Configuration:**

- Purpose: App-specific and shared config
- Location: `apps/*/src/config/constants.ts`, `packages/config/constants.ts`
- Contains: Site titles, API versions, GTM IDs

## Data Flow

**Content Delivery (ashleypetersenphoto.com - App Router):**

1. Server Component calls `SanityClient.fetch()` with a GROQ query directly in the page component
2. Sanity CDN returns content data
3. Page component renders with data (no client-side fetching needed)
4. Example: `apps/ashleypetersenphoto.com/src/app/page.tsx`

**Content Delivery (blakepetersen.io - Pages Router):**

1. `getServerSideProps` calls Contentful client functions from `src/pages/api/contentful.ts`
2. Contentful API returns content entries
3. Data passed as props to page component
4. Example: `apps/blakepetersen.io/src/pages/index.tsx`

**Transactional Email (blakepetersen.io):**

1. Client sends POST to `/api/transactional-email`
2. CORS middleware wraps handler
3. Handler calls SendGrid API to send email
4. Response returned to client
5. File: `apps/blakepetersen.io/src/pages/api/transactional-email.ts`

**State Management:**

- No global state management library
- `next-themes` ThemeProvider for dark/light mode (all apps)
- `framer-motion` AnimatePresence for page transitions (blakepetersen.io)
- Server-side data fetching via `getServerSideProps` or React Server Components

## Key Abstractions

**SanityClient:**

- Purpose: Configured Sanity CMS client shared across apps
- Location: `packages/artax-ui/src/components/SanityClient/index.ts`
- Pattern: Reads `NEXT_PUBLIC_SANITY_PROJECT_ID` env var, connects to `production` dataset
- Used by: ashleypetersenphoto.com for all CMS content

**Contentful Client:**

- Purpose: Contentful CMS client for blog content
- Location: `apps/blakepetersen.io/src/pages/api/contentful.ts`
- Pattern: Exports query functions (`getPosts`, `getPost`, `getPostsByTag`, etc.)
- Used by: blakepetersen.io pages via `getServerSideProps`

**Stitches Theme System:**

- Purpose: CSS-in-JS theming with Radix color scales
- Location: `packages/config/stitches.config.ts`
- Pattern: Exports `styled`, `css`, `theme`, `createTheme` from configured Stitches instance
- Provides: Semantic color tokens (success, warning, danger), responsive breakpoints (bp1-bp4), dark theme colors

**Layout Components:**

- Purpose: Page-level layout wrappers (header, footer, content area)
- Locations:
  - `apps/blakepetersen.io/src/components/layout.tsx` (with framer-motion transitions)
  - `apps/ashleypetersenphoto.com/src/app/layout.tsx` (App Router root layout)
  - `apps/dalebridges.com/src/components/Frame/` (simple frame wrapper)

## Entry Points

**ashleypetersenphoto.com:**

- Location: `apps/ashleypetersenphoto.com/src/app/layout.tsx`
- Triggers: Next.js App Router
- Responsibilities: HTML shell, Header/Footer, Google Fonts (Lora), Vercel Analytics

**blakepetersen.io:**

- Location: `apps/blakepetersen.io/src/pages/_app.tsx`
- Triggers: Next.js Pages Router
- Responsibilities: ThemeProvider, Radix Theme, Layout wrapper, AnimatePresence transitions

**dalebridges.com:**

- Location: `apps/dalebridges.com/src/pages/_app.tsx`
- Triggers: Next.js Pages Router
- Responsibilities: ThemeProvider, Frame wrapper

**Build Orchestration:**

- Location: `turbo.json` + root `package.json`
- Triggers: `pnpm build`, `pnpm dev`, etc.
- Responsibilities: Parallel builds, dependency-aware task ordering, per-app scope commands

## Error Handling

**Strategy:** Minimal -- no centralized error handling or error boundaries detected.

**Patterns:**

- API routes use try/catch with `.catch()` on promises (e.g., `transactional-email.ts`)
- No React Error Boundaries detected
- No structured error logging beyond `console.error`

## Cross-Cutting Concerns

**Logging:** `next-axiom` integrated via `withAxiom` Next.js plugin in all apps. Console logging used in API routes.

**Validation:** No schema validation library detected. Form handling via Formik in ashleypetersenphoto.com.

**Authentication:** None. All sites are public-facing with no auth.

**Analytics:** Vercel Analytics (`@vercel/analytics`) in all apps. Google Tag Manager in blakepetersen.io (`src/components/gtm.tsx`).

**Theming:** `next-themes` for system/dark/light mode switching in all apps.

---

_Architecture analysis: 2026-03-07_
