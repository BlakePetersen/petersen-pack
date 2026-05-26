// ABOUTME: Playwright configuration for E2E testing
// ABOUTME: Configured for Next.js dev server on port 3333

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  // tests/api/admin-wrappers.spec.ts is the TST-07 vitest sweep (D-15..D-17),
  // not a Playwright E2E. Exclude here so `pnpm test` doesn't double-run it.
  testIgnore: ['**/api/admin-wrappers.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
