// ABOUTME: E2E tests for admin form submissions
// ABOUTME: Tests form validation, submission, and success states

import { test, expect } from '../fixtures'

test.describe('Admin Forms', () => {
  test.describe('Testimonial Form', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/testimonials/new')
    })

    test('displays form fields', async ({ authenticatedPage }) => {
      await expect(authenticatedPage.getByLabel(/client name/i)).toBeVisible()
      await expect(authenticatedPage.getByLabel(/project type/i)).toBeVisible()
      await expect(authenticatedPage.getByLabel(/quote/i)).toBeVisible()
      await expect(authenticatedPage.getByLabel(/rating/i)).toBeVisible()
    })

    test('validates required fields', async ({ authenticatedPage }) => {
      // Try to submit empty form
      await authenticatedPage
        .getByRole('button', { name: /save|create/i })
        .click()

      // Should show validation or stay on page
      await expect(authenticatedPage).toHaveURL('/admin/testimonials/new')
    })

    test('successfully creates testimonial', async ({ authenticatedPage }) => {
      await authenticatedPage.getByLabel(/client name/i).fill('Test Client')
      await authenticatedPage.getByLabel(/project type/i).fill('Wedding')
      await authenticatedPage.getByLabel(/quote/i).fill('Great photographer!')
      await authenticatedPage.getByLabel(/rating/i).fill('5')

      await authenticatedPage
        .getByRole('button', { name: /save|create/i })
        .click()

      // Should redirect to testimonials list
      await expect(authenticatedPage).toHaveURL('/admin/testimonials')

      // Should show success message or new testimonial
      await expect(
        authenticatedPage.getByText(/test client/i).first()
      ).toBeVisible()
    })
  })

  test.describe('Gallery Form', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/galleries/new')
    })

    test('displays gallery form', async ({ authenticatedPage }) => {
      await expect(
        authenticatedPage.getByPlaceholder('Summer Wedding 2024')
      ).toBeVisible()
      await expect(
        authenticatedPage.getByPlaceholder('summer-wedding-2024')
      ).toBeVisible()
      await expect(authenticatedPage.getByRole('combobox')).toBeVisible()
    })

    test('auto-generates slug from title', async ({ authenticatedPage }) => {
      const titleInput = authenticatedPage.getByPlaceholder(
        'Summer Wedding 2024'
      )
      const slugInput = authenticatedPage.getByPlaceholder(
        'summer-wedding-2024'
      )

      await titleInput.fill('Test Gallery')

      // Trigger blur to auto-generate slug
      await titleInput.blur()

      const slugValue = await slugInput.inputValue()
      expect(slugValue).toBe('test-gallery')
    })
  })
})
