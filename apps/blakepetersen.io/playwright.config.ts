// ABOUTME: Playwright configuration for visual regression tests
// ABOUTME: Serves the Next.js production build on port 3000 (CONTENT-06 torture test)

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Keep the on-disk snapshot name exactly as the spec passes it (e.g.
  // `skill-detail-desktop-light.png`). Default template adds project + platform
  // suffixes which doubles up when the spec already embeds project.name.
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2
    }
  },

  projects: [
    {
      name: 'desktop-light',
      use: { ...devices['Desktop Chrome'], colorScheme: 'light' }
    },
    {
      name: 'desktop-dark',
      use: { ...devices['Desktop Chrome'], colorScheme: 'dark' }
    },
    {
      name: 'mobile-light',
      use: { ...devices['Pixel 5'], colorScheme: 'light' }
    }
  ],

  // Baselines are captured against the production build: dev-server output
  // (unminified CSS, dev overlays) renders differently from what ships.
  // Run `pnpm build` before `pnpm test:visual`.
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
