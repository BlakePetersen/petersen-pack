# Testing Patterns

**Analysis Date:** 2026-03-07

## Test Framework

**Runner:**

- Jest 30.2.0
- Config: No dedicated config file found; configured via `package.json` scripts
- `jest-environment-jsdom` 30.2.0 installed for DOM testing

**Assertion Library:**

- `@testing-library/jest-dom` 6.9.1 (custom matchers like `toBeInTheDocument`)
- `@testing-library/react` 16.3.0 (component rendering)
- `@testing-library/user-event` 14.6.1 (user interaction simulation)

**Run Commands:**

```bash
pnpm test                # Run all tests via Turbo (turbo run test)
pnpm test:watch          # Watch mode via Turbo (turbo run test:watch)
```

Per-app commands:

```bash
# Each app runs jest directly:
cd apps/blakepetersen.io && jest --passWithNoTests
cd apps/ashleypetersenphoto.com && jest --passWithNoTests
cd apps/dalebridges.com && jest --passWithNoTests
```

## Test File Organization

**Location:**

- No test files exist in the codebase. Zero `.test.*` or `.spec.*` files found.

**Expected Naming (from framework setup):**

- `*.test.ts` / `*.test.tsx` (Jest default pattern)
- Co-located with source files or in `__tests__/` directories

## Current State

**No tests have been written.** All apps use `--passWithNoTests` flag to avoid build failures:

- `apps/blakepetersen.io/package.json`: `"test": "jest --passWithNoTests"`
- `apps/ashleypetersenphoto.com/package.json`: `"test": "jest --passWithNoTests"`
- `apps/dalebridges.com/package.json`: `"test": "jest --passWithNoTests"`

The testing infrastructure is fully installed but unused.

## Pre-Push Hook

The `pre-push` hook at `.husky/pre-push` runs `yarn run test` before push. Note: this references `yarn` instead of `pnpm`, which is the current package manager. Tests would pass regardless due to `--passWithNoTests`.

## Available Testing Libraries

**Installed and ready to use:**

- `jest` 30.2.0 - Test runner
- `jest-environment-jsdom` 30.2.0 - Browser-like DOM environment
- `@testing-library/react` 16.3.0 - React component testing
- `@testing-library/jest-dom` 6.9.1 - DOM assertion matchers
- `@testing-library/user-event` 14.6.1 - User event simulation

## Recommended Test Structure

Based on the installed tooling and codebase patterns, new tests should follow this structure:

**Component Tests (React Testing Library):**

```typescript
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Card } from './index'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><span>content</span></Card>)
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})
```

**Utility Tests:**

```typescript
import { runMiddleware } from './index'

describe('runMiddleware', () => {
  it('resolves on success', async () => {
    const fn = (_req, _res, next) => next()
    await expect(runMiddleware({}, {}, fn)).resolves.toBeUndefined()
  })
})
```

## Mocking

**Framework:** Jest built-in mocking (`jest.fn()`, `jest.mock()`)

**No established mocking patterns exist** - no test files to reference.

## Coverage

**Requirements:** None enforced
**No coverage configuration found.**

## Test Types

**Unit Tests:**

- Infrastructure ready via Jest + jsdom
- Target: `packages/artax-ui` components and utilities

**Integration Tests:**

- Not set up

**E2E Tests:**

- Not set up (no Cypress, Playwright, or similar framework installed)

## Missing Jest Configuration

No `jest.config.*` file exists at root or app level. Jest likely relies on defaults. For the monorepo structure with path aliases (`@/*`), a Jest config with `moduleNameMapper` will be needed before tests can import properly:

```javascript
// jest.config.js (needed per app)
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterSetup: ['@testing-library/jest-dom']
}
```

---

_Testing analysis: 2026-03-07_
