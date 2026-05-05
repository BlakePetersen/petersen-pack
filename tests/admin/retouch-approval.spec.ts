import { test, expect } from '@playwright/test'

test.describe('Admin Retouch Approval', () => {
  test('admin can view pending retouch requests', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Navigate to gallery with retouch requests
    await page.goto('/admin/clients/test-gallery-id')

    // Verify retouch requests table exists
    await expect(page.locator('h2:has-text("Retouch Requests")')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify pending request is shown
    await expect(page.locator('tr:has-text("PENDING")')).toBeVisible()
  })

  test('admin can approve retouch request', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Navigate to gallery with retouch requests
    await page.goto('/admin/clients/test-gallery-id')

    // Verify pending request is shown
    await expect(page.locator('tr:has-text("PENDING")')).toBeVisible()

    // Click approve button
    await page.click('button:has-text("Approve")')

    // Wait for the page to reload/update
    await page.waitForLoadState('networkidle')

    // Verify the request is no longer showing as PENDING
    // (it should be COMPLETED and filtered out of the pending requests table)
    await expect(page.locator('tr:has-text("PENDING")')).not.toBeVisible()
  })

  test('admin can decline retouch request', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Navigate to gallery with retouch requests
    await page.goto('/admin/clients/test-gallery-id')

    // Verify pending request is shown
    await expect(page.locator('tr:has-text("PENDING")')).toBeVisible()

    // Click decline button
    await page.click('button:has-text("Decline")')

    // Wait for the page to reload/update
    await page.waitForLoadState('networkidle')

    // Verify the request is no longer showing as PENDING
    // (it should be DECLINED and filtered out of the pending requests table)
    await expect(page.locator('tr:has-text("PENDING")')).not.toBeVisible()
  })
})
