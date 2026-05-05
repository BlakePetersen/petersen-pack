// ABOUTME: Playwright test fixtures
// ABOUTME: Provides authenticated page fixture for admin tests

/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, type Page } from '@playwright/test'

type Fixtures = {
  authenticatedPage: Page
}

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto('/login')
    await page.getByLabel('Email Address').fill('admin@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/admin')

    await use(page)
  },
})

export { expect } from '@playwright/test'
