# External Integrations

**Analysis Date:** 2026-03-07

## APIs & External Services

**Content Management:**

- Contentful - Blog content and person profiles for blakepetersen.io
  - SDK/Client: `contentful` 10.15.1
  - Client setup: `apps/blakepetersen.io/src/pages/api/contentful.ts`
  - Auth: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`
  - Content types: `person`, `blogPost`
  - Access pattern: Server-side via `getStaticProps` / API routes

- Sanity - CMS for ashleypetersenphoto.com (and blakepetersen.io has deps installed)
  - SDK/Client: `@sanity/client` 6.21.3, `@sanity/image-url` 1.0.2
  - Query language: `groq` 3.57.3
  - Image CDN: `cdn.sanity.io` (whitelisted in Next.js image domains for ashleypetersenphoto.com and dalebridges.com)
  - Note: Sanity studio apps referenced in root `package.json` scripts (`start:studio:*`) but no studio apps exist in the current workspace

**Email:**

- SendGrid - Transactional email from blakepetersen.io
  - SDK/Client: `@sendgrid/mail` 8.1.3
  - Implementation: `apps/blakepetersen.io/src/pages/api/transactional-email.ts`
  - Auth: `SENDGRID_API_KEY`
  - Pattern: API route with CORS middleware, accepts `to`, `from`, `subject`, `body` fields

**Social Media:**

- Twitter/X API v1.1 - User timeline fetching for blakepetersen.io
  - Implementation: `apps/blakepetersen.io/src/pages/api/twitter/profile/[screenName].ts`
  - Auth: `TWITTER_TOKEN` (Bearer token)
  - Endpoint: `statuses/user_timeline.json`
  - Note: Uses deprecated v1.1 API; may stop working or already be non-functional

**Web3/Blockchain:**

- Ethereum via ethers.js + RainbowKit (blakepetersen.io only)
  - Packages: `@rainbow-me/rainbowkit` 2.1.6, `ethers` 6.13.2
  - Purpose: Wallet connection UI and Ethereum interaction

## Data Storage

**Databases:**

- No direct database connections. All content stored in external CMS platforms (Contentful, Sanity).

**File Storage:**

- Sanity CDN (`cdn.sanity.io`) - Image hosting for photography and site content
- No other file storage integrations

**Caching:**

- None (beyond Next.js built-in caching and Turborepo build cache)
- Twitter API route uses `s-maxage=1, stale-while-revalidate` cache header

## Authentication & Identity

**Auth Provider:**

- None for end users. These are public-facing sites with no user authentication.
- API keys are used server-side only for CMS and service integrations.

## Monitoring & Observability

**Logging:**

- Axiom via `next-axiom` 1.5.1 - Structured logging for all three apps
  - Configured via `withAxiom` plugin wrapper in each `next.config.js`

**Analytics:**

- Vercel Analytics via `@vercel/analytics` ^1.3.1 - All three apps
  - Client component in ashleypetersenphoto.com: `apps/ashleypetersenphoto.com/src/app/layout.tsx`

**Security Scanning:**

- GitHub CodeQL - JavaScript analysis
  - Config: `.github/workflows/codeql-analysis.yml`
  - Triggers: push to main, PRs to main, weekly schedule (Thursday 03:23 UTC)

**Error Tracking:**

- None dedicated (relies on Axiom logs and Vercel dashboard)

## CI/CD & Deployment

**Hosting:**

- Vercel (inferred from Vercel Analytics, Next.js framework, Axiom integration)

**CI Pipeline:**

- GitHub Actions - CodeQL security scanning only
- No build/test/deploy CI pipeline configured in `.github/workflows/`

**Git Hooks (local):**

- Pre-commit: `pnpm lint-staged` (ESLint + Prettier on staged files)
- Commit-msg: commitlint conventional commits (still references `yarn` instead of `pnpm`)

## Environment Configuration

**Required env vars per app:**

blakepetersen.io:

- `CONTENTFUL_SPACE_ID` - Contentful space identifier
- `CONTENTFUL_ACCESS_TOKEN` - Contentful delivery API key
- `SENDGRID_API_KEY` - SendGrid email service key
- `TWITTER_TOKEN` - Twitter API bearer token

ashleypetersenphoto.com:

- Sanity project credentials (specific var names not found in source)

dalebridges.com:

- Sanity project credentials (specific var names not found in source)

**Secrets location:**

- `.env.local` files in each app directory (gitignored)

## Webhooks & Callbacks

**Incoming:**

- None detected

**Outgoing:**

- None detected

---

_Integration audit: 2026-03-07_
