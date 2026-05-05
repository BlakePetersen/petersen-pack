// ABOUTME: Vitest configuration for unit testing
// ABOUTME: Configures test environment and path aliases
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: [
      '**/*.test.ts',
      '**/*.test.tsx',
      // TST-07 sweep is named .spec.ts per plan (D-15..D-17). Explicit include
      // routes it through vitest while every other tests/**/*.spec.ts remains
      // a Playwright suite (see playwright.config.ts testIgnore).
      'tests/api/admin-wrappers.spec.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // .worktrees holds parallel-execution checkouts; their tests already run
      // in their own worktree and would duplicate-collide here.
      '.worktrees/**',
      // Exclude Playwright suites — they live under tests/{admin,contact,faq,visual}
      // plus the per-resource tests/api/admin-*.spec.ts files. The TST-07 sweep
      // is included above and survives the negation pattern below.
      'tests/admin/**/*.spec.ts',
      'tests/contact/**/*.spec.ts',
      'tests/faq/**/*.spec.ts',
      'tests/visual/**/*.spec.ts',
      'tests/api/admin-faqs.spec.ts',
      'tests/api/admin-galleries.spec.ts',
      'tests/api/download.spec.ts',
    ],
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'next/server': path.resolve(
        __dirname,
        './node_modules/next/dist/server/web/exports/index.js'
      ),
    },
  },
})
