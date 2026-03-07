# Codebase Concerns

**Analysis Date:** 2026-03-07

## Tech Debt

**Zero Test Coverage:**

- Issue: Every app uses `--passWithNoTests` flag. No test files exist anywhere in the monorepo.
- Files: `apps/*/package.json` (all three apps declare `"test": "jest --passWithNoTests"`)
- Impact: No regression protection. Any change can silently break functionality. Pre-push hook (`yarn run test`) passes vacuously.
- Fix approach: Add tests incrementally starting with API routes (`apps/blakepetersen.io/src/pages/api/transactional-email.ts`, `apps/blakepetersen.io/src/pages/api/contentful.ts`) and core components.

**Redux Store in blakepetersen.io:**

- Issue: Plain JavaScript Redux store with `redux-thunk` and `redux-devtools-extension` -- none of which are listed as dependencies in `apps/blakepetersen.io/package.json`. The store uses the classic `switch/case` pattern with `Object.assign` instead of modern Redux Toolkit or React state management.
- Files: `apps/blakepetersen.io/src/helpers/store.js`
- Impact: Phantom dependency (relies on hoisting). Unnecessary complexity for simple UI toggle state (nav menu, search menu, header height). The store is a plain `.js` file in a TypeScript project.
- Fix approach: Replace with React Context or Zustand. The state shape is trivial (6 boolean/string fields) and does not warrant a Redux store.

**Abandoned `artax-ui` Shared Package:**

- Issue: `artax-ui` depends on `next@14.0.3`, `@types/react@18.2.38`, `typescript@5.3.2` while apps use `next@16.0.5`, `@types/react@19.2.7`, `typescript@5.9.3`. The package has no entry point file (`src/index.ts` does not exist). All apps `transpilePackages: ['artax-ui']` but it is unclear if any components are actually imported from it.
- Files: `packages/artax-ui/package.json`, `packages/artax-ui/src/`
- Impact: Stale shared package with major version mismatches. May cause type conflicts or runtime issues. Dead code if unused.
- Fix approach: Audit imports of `artax-ui` across apps. Either update to match current app versions or remove if unused.

**Stale `config` Package (ESLint v5 era):**

- Issue: `packages/config/package.json` depends on `@typescript-eslint/*@^5`, `eslint-config-airbnb`, and other ESLint 8-era packages. The root now uses ESLint 9 flat config (`eslint.config.mjs`). The `config` package is likely unused after the migration.
- Files: `packages/config/package.json`, `packages/config/eslint-default.js`
- Impact: Dead dependency tree. Confusing for contributors who see two ESLint configs.
- Fix approach: Verify no app references `config` package, then remove it.

**Inconsistent Next.js Router Usage:**

- Issue: `ashleypetersenphoto.com` uses App Router (`src/app/`), while `blakepetersen.io` and `dalebridges.com` use Pages Router (`src/pages/`).
- Files: `apps/ashleypetersenphoto.com/src/app/`, `apps/blakepetersen.io/src/pages/`, `apps/dalebridges.com/src/pages/`
- Impact: Different patterns, different data fetching approaches, harder to share code and conventions across apps.
- Fix approach: Migrate `blakepetersen.io` and `dalebridges.com` to App Router when feasible. Not urgent but worth planning.

**@stitches/react is Unmaintained:**

- Issue: `@stitches/react` is used across all apps and `artax-ui`. The library has been officially abandoned (no updates since 2022, repo archived).
- Files: `apps/ashleypetersenphoto.com/package.json`, `apps/blakepetersen.io/package.json`, `apps/dalebridges.com/package.json`, `packages/artax-ui/package.json`
- Impact: No bug fixes, no React 19 compatibility guarantees, no security patches. Risk increases with each React/Next.js upgrade.
- Fix approach: Migrate to a maintained CSS-in-JS solution (e.g., vanilla-extract, Tailwind CSS, or Radix Themes which `blakepetersen.io` already uses).

**Multiple Conflicting Styling Solutions:**

- Issue: The codebase uses `@stitches/react`, `styled-components`, `@radix-ui/themes`, SCSS, and inline styles simultaneously across different apps and even within the same app.
- Files: `apps/blakepetersen.io/package.json` (styled-components + @stitches/react + @radix-ui/themes + SCSS), `packages/artax-ui/package.json` (styled-components + @stitches/react)
- Impact: Increased bundle size, inconsistent styling patterns, harder onboarding.
- Fix approach: Standardize on one primary approach per app.

**`next-compose-plugins` is Abandoned:**

- Issue: `next-compose-plugins` (last published 2021) is used in all three app configs. Next.js 12+ has built-in plugin composition.
- Files: `apps/ashleypetersenphoto.com/next.config.js`, `apps/blakepetersen.io/next.config.js`, `apps/dalebridges.com/next.config.js`
- Impact: Unnecessary dependency. May conflict with newer Next.js features.
- Fix approach: Replace with native Next.js config composition or simple function wrapping: `module.exports = withAxiom(nextConfig)`.

**Husky Hooks Reference `yarn` After pnpm Migration:**

- Issue: `commit-msg` and `pre-push` hooks use `yarn commitlint` and `yarn run test` instead of `pnpm`.
- Files: `.husky/commit-msg`, `.husky/pre-push`
- Impact: Hooks fail or behave unexpectedly since the project migrated to pnpm. Only `.husky/pre-commit` (which runs `pnpm lint-staged`) is correct.
- Fix approach: Update hooks to use `pnpm commitlint --edit $1` and `pnpm run test`.

**`yarn-error.log` Committed to Repo:**

- Issue: A 92-line `yarn-error.log` file exists in the project root. Should have been removed during the yarn-to-pnpm migration.
- Files: `yarn-error.log`
- Impact: Clutter. Signals incomplete migration cleanup.
- Fix approach: Delete the file and optionally add it to `.gitignore`.

## Security Considerations

**Open Email Relay in Transactional Email API:**

- Risk: The `/api/transactional-email` endpoint accepts arbitrary `to`, `from`, `subject`, and `body` fields with no authentication, no rate limiting, and no input validation. Anyone can send emails through this endpoint as any sender.
- Files: `apps/blakepetersen.io/src/pages/api/transactional-email.ts`
- Current mitigation: CORS headers set to `*` (no restriction). No auth check.
- Recommendations: Add authentication, restrict `to`/`from` to known addresses, add rate limiting, validate/sanitize input, remove wildcard CORS.

**Wildcard CORS on All API Routes:**

- Risk: `Access-Control-Allow-Origin: *` is set on all `/api/*` routes via both `next.config.js` headers AND inline in the email handler.
- Files: `apps/blakepetersen.io/next.config.js`, `apps/blakepetersen.io/src/pages/api/transactional-email.ts`
- Current mitigation: None.
- Recommendations: Restrict CORS to known domains (e.g., `blakepetersen.io`).

**Twitter API v1.1 Endpoint (Deprecated):**

- Risk: Uses Twitter API v1.1 (`/1.1/statuses/user_timeline.json`) which has been shut down. The endpoint will fail at runtime.
- Files: `apps/blakepetersen.io/src/pages/api/twitter/profile/[screenName].ts`
- Current mitigation: None. No error handling for API failures.
- Recommendations: Remove or migrate to X API v2 if still needed. Add error handling.

**`@typescript-eslint/no-explicit-any` Disabled:**

- Risk: Allows `any` types throughout the codebase, reducing TypeScript's safety guarantees.
- Files: `eslint.config.mjs` (line 34)
- Current mitigation: None.
- Recommendations: Enable as `warn` and incrementally fix violations.

## Performance Bottlenecks

**`moment.js` in blakepetersen.io:**

- Problem: `moment` (330KB gzipped with locales) is a dependency for date formatting.
- Files: `apps/blakepetersen.io/package.json`, `apps/blakepetersen.io/src/components/posts/meta.tsx`
- Cause: Large bundle size for simple date formatting.
- Improvement path: Replace with `date-fns` (tree-shakeable) or native `Intl.DateTimeFormat`.

**`lodash` Full Package:**

- Problem: Full `lodash` package (72KB gzipped) imported rather than individual functions.
- Files: `apps/blakepetersen.io/package.json`
- Cause: Bundle includes all lodash functions even if only a few are used.
- Improvement path: Switch to `lodash-es` or individual imports (`lodash/get`, etc.) for tree-shaking.

## Fragile Areas

**Contentful API Client:**

- Files: `apps/blakepetersen.io/src/pages/api/contentful.ts`
- Why fragile: No TypeScript types on function parameters (`slug`, `tag` are untyped). No error handling. Client is created at module scope (cold start issues possible).
- Safe modification: Add types and error handling before extending.
- Test coverage: None.

**`next.config.js` Files (CJS in ESM World):**

- Files: `apps/*/next.config.js`
- Why fragile: All three configs use CommonJS `require()`. Next.js 16 prefers ESM (`next.config.mjs` or `next.config.ts`). `next-compose-plugins` adds another layer of fragility.
- Safe modification: Convert to `next.config.mjs` or `next.config.ts` one app at a time.
- Test coverage: None.

## Dependencies at Risk

**`@stitches/react@1.2.8`:**

- Risk: Archived/abandoned project. No React 19 support.
- Impact: Core styling dependency across all apps. Breakage would require touching every styled component.
- Migration plan: Evaluate vanilla-extract, Panda CSS, or Tailwind CSS.

**`next-compose-plugins@2.2.1`:**

- Risk: Abandoned (2021). May break with Next.js updates.
- Impact: All three app configs depend on it.
- Migration plan: Use direct function composition.

**`react-is@18.3.1` (in ashleypetersenphoto.com):**

- Risk: Pinned to React 18 while the app uses React 19.
- Impact: Potential runtime incompatibilities.
- Migration plan: Remove if unused, or update to React 19 version.

**`@next/font@14.2.11` (in ashleypetersenphoto.com):**

- Risk: `@next/font` was deprecated in Next.js 13.2 and replaced by `next/font`.
- Impact: May not work correctly with Next.js 16.
- Migration plan: Replace imports with `next/font/google`.

**`eslint-config-next@14.2.11` (in all apps):**

- Risk: ESLint config pinned to Next.js 14 while apps run Next.js 16.
- Impact: May miss new lint rules or produce false positives.
- Migration plan: Update to match Next.js 16 or integrate into root flat config.

## Missing Critical Features

**No CI/CD Pipeline:**

- Problem: No GitHub Actions, Vercel config, or CI pipeline configuration files detected.
- Blocks: Automated testing, linting, and deployment verification.

**No Error Boundaries:**

- Problem: No React error boundaries detected in any app.
- Blocks: Graceful error recovery in production. Unhandled component errors crash the entire page.

## Test Coverage Gaps

**Everything:**

- What's not tested: The entire codebase. Zero test files exist.
- Files: All `apps/*/src/**` and `packages/*/src/**`
- Risk: Any change can introduce regressions with zero detection.
- Priority: High. Start with API routes (security-sensitive) and shared `artax-ui` components.

## @types/react Version Conflict

**React 18 vs 19 Types:**

- Issue: `apps/ashleypetersenphoto.com/package.json` and `apps/dalebridges.com/package.json` declare `@types/react@^18.3.5` as a dependency, while the root `package.json` declares `@types/react@19.2.7` as a devDependency. Apps use `react@19.2.0`.
- Files: `apps/ashleypetersenphoto.com/package.json`, `apps/dalebridges.com/package.json`, `package.json`
- Impact: Type resolution may pick up React 18 types for React 19 code, causing subtle type errors or missing new API types.
- Fix approach: Remove `@types/react` from individual app `package.json` files and rely on the root devDependency, or update all to `@types/react@19`.

## Node.js Version Inconsistency

**Different `.tool-versions` Files:**

- Issue: Root `.tool-versions` specifies `nodejs lts` while `apps/dalebridges.com/.tool-versions` specifies `nodejs 20.17.0`.
- Files: `.tool-versions`, `apps/dalebridges.com/.tool-versions`
- Impact: Different Node.js versions may be used depending on which directory `asdf` resolves from.
- Fix approach: Use a single root `.tool-versions` for the entire monorepo.

---

_Concerns audit: 2026-03-07_
