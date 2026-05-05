// ABOUTME: E2E tests for admin login flow
// ABOUTME: Tests authentication and navigation after login

import { test, expect } from '@playwright/test'

test.describe('Admin Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    // Wait for React hydration to complete
    await page.waitForLoadState('networkidle')
  })

  test('displays login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
    await expect(page.getByLabel('Email Address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('shows validation for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /sign in/i }).click()

    // Form should not submit
    await expect(page).toHaveURL('/login')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email Address').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show error message
    await expect(page.getByText(/invalid/i)).toBeVisible()
  })

  test('logs in with valid credentials and redirects to admin', async ({
    page,
  }) => {
    await page.getByLabel('Email Address').fill('admin@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin')
    await expect(
      page.getByRole('heading', { name: /dashboard/i })
    ).toBeVisible()
  })

  test('persists login across page navigation', async ({ page }) => {
    // Login
    await page.getByLabel('Email Address').fill('admin@example.com')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL('/admin')

    // Navigate to galleries (use exact text to avoid ambiguity with "Client Galleries")
    await page
      .getByRole('link', { name: 'Galleries', exact: true })
      .first()
      .click()
    await expect(page).toHaveURL(/\/admin\/galleries/)

    // Should still be logged in (not redirected to login)
    await expect(page.getByRole('navigation')).toBeVisible()
  })
})
