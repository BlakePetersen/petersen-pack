// ABOUTME: E2E tests for admin FAQ management pages
// ABOUTME: Tests FAQ list, create, edit, delete, and filter functionality

import { test, expect } from '../fixtures'
import { prisma } from '@/lib/prisma'

test.describe('Admin FAQ Management', () => {
  let service: { id: string; name: string }
  let testFaq: { id: string }

  test.beforeEach(async () => {
    // Create test service
    service = await prisma.service.create({
      data: {
        name: 'Headshot Photography',
        slug: `headshots-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        description: 'Professional headshot photography',
        isActive: true,
        sortOrder: 1,
      },
    })

    // Create a test FAQ
    testFaq = await prisma.faq.create({
      data: {
        question: 'What should clients wear?',
        answer: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Wear solid colors' }],
            },
          ],
        },
        category: 'GENERAL',
        serviceId: service.id,
        sortOrder: 1,
        isActive: true,
      },
    })
  })

  test.afterEach(async () => {
    // Cleanup
    if (testFaq) {
      await prisma.faq.delete({ where: { id: testFaq.id } }).catch(() => {})
    }
    if (service) {
      await prisma.service.delete({ where: { id: service.id } }).catch(() => {})
    }
  })

  test.describe('FAQ List Page', () => {
    test('displays FAQ list page with header and actions', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/admin/faqs')

      await expect(
        authenticatedPage.getByRole('heading', { name: 'FAQs' })
      ).toBeVisible()

      await expect(
        authenticatedPage.getByText('Manage frequently asked questions')
      ).toBeVisible()

      await expect(
        authenticatedPage.getByRole('link', { name: 'Preview FAQs' })
      ).toBeVisible()

      await expect(
        authenticatedPage.getByRole('link', { name: 'New FAQ' })
      ).toBeVisible()
    })

    test('displays existing FAQs in the list', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto('/admin/faqs')

      await expect(
        authenticatedPage.getByText('What should clients wear?')
      ).toBeVisible()

      await expect(authenticatedPage.getByText('GENERAL')).toBeVisible()
      await expect(authenticatedPage.getByText(service.name)).toBeVisible()
      await expect(authenticatedPage.getByText('Active')).toBeVisible()
    })

    test('filters FAQs by service', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs')

      // Select the test service from dropdown
      await authenticatedPage.selectOption('select', service.id)

      // Should show the FAQ for this service
      await expect(
        authenticatedPage.getByText('What should clients wear?')
      ).toBeVisible()

      // Select "General FAQ"
      await authenticatedPage.selectOption('select', 'general')

      // Should not show service-specific FAQs
      await expect(
        authenticatedPage.getByText('What should clients wear?')
      ).not.toBeVisible()
    })

    test('searches FAQs by question text', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs')

      // Type in search box
      await authenticatedPage
        .getByPlaceholder('Search questions...')
        .fill('wear')

      // Should show matching FAQ
      await expect(
        authenticatedPage.getByText('What should clients wear?')
      ).toBeVisible()

      // Search for non-matching text
      await authenticatedPage
        .getByPlaceholder('Search questions...')
        .fill('nonexistent')

      // Should show no results message
      await expect(
        authenticatedPage.getByText('No FAQs match your filters')
      ).toBeVisible()
    })

    test('toggles FAQ active status', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs')

      // Click the Active button to toggle
      await authenticatedPage
        .getByRole('button', { name: 'Active' })
        .first()
        .click()

      // Wait for update
      await authenticatedPage.waitForTimeout(1000)

      // Button should now say Inactive
      await expect(
        authenticatedPage.getByRole('button', { name: 'Inactive' }).first()
      ).toBeVisible()

      // Verify in database
      const updatedFaq = await prisma.faq.findUnique({
        where: { id: testFaq.id },
      })
      expect(updatedFaq?.isActive).toBe(false)
    })

    test('duplicates FAQ', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs')

      // Click duplicate button (Copy icon)
      await authenticatedPage
        .locator('button[title="Duplicate"]')
        .first()
        .click()

      // Wait for page reload
      await authenticatedPage.waitForTimeout(2000)

      // Should show duplicated FAQ with (Copy) suffix
      await expect(
        authenticatedPage.getByText('What should clients wear? (Copy)')
      ).toBeVisible()

      // Clean up duplicated FAQ
      const duplicatedFaq = await prisma.faq.findFirst({
        where: { question: 'What should clients wear? (Copy)' },
      })
      if (duplicatedFaq) {
        await prisma.faq.delete({ where: { id: duplicatedFaq.id } })
      }
    })

    test('deletes FAQ with confirmation', async ({ authenticatedPage }) => {
      // Create a FAQ to delete
      const faqToDelete = await prisma.faq.create({
        data: {
          question: 'FAQ to delete',
          answer: { type: 'doc', content: [] },
          category: 'GENERAL',
          serviceId: null,
          sortOrder: 999,
          isActive: true,
        },
      })

      await authenticatedPage.goto('/admin/faqs')

      // Set up dialog handler to accept deletion
      authenticatedPage.on('dialog', (dialog) => dialog.accept())

      // Click delete button for the FAQ
      const faqCard = authenticatedPage
        .locator('div', { hasText: 'FAQ to delete' })
        .first()
      await faqCard.locator('button[title="Delete"]').click()

      // Wait for deletion
      await authenticatedPage.waitForTimeout(1000)

      // FAQ should be removed from list
      await expect(
        authenticatedPage.getByText('FAQ to delete')
      ).not.toBeVisible()

      // Verify deleted from database
      const deletedFaq = await prisma.faq.findUnique({
        where: { id: faqToDelete.id },
      })
      expect(deletedFaq).toBeNull()
    })
  })

  test.describe('Create FAQ Page', () => {
    test('displays create FAQ form', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs/new')

      await expect(
        authenticatedPage.getByRole('heading', { name: 'Create FAQ' })
      ).toBeVisible()

      await expect(authenticatedPage.getByLabel('Question')).toBeVisible()
      await expect(authenticatedPage.getByLabel('Answer')).toBeVisible()
      await expect(authenticatedPage.getByLabel('Category')).toBeVisible()
      await expect(authenticatedPage.getByLabel('Service')).toBeVisible()
    })

    test('creates a new general FAQ', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs/new')

      // Fill in form
      await authenticatedPage
        .getByLabel('Question')
        .fill('What is your turnaround time?')

      // Type in the rich text editor
      await authenticatedPage
        .locator('.ProseMirror')
        .fill('Typically 2-3 weeks for final delivery')

      await authenticatedPage.selectOption('select#category', 'PROCESS')
      await authenticatedPage.selectOption('select#service', 'null')
      await authenticatedPage.getByLabel('Sort Order').fill('10')

      // Submit form
      await authenticatedPage
        .getByRole('button', { name: 'Create FAQ' })
        .click()

      // Should redirect to list page
      await authenticatedPage.waitForURL('/admin/faqs')

      // Verify FAQ was created
      const newFaq = await prisma.faq.findFirst({
        where: { question: 'What is your turnaround time?' },
      })
      expect(newFaq).toBeDefined()
      expect(newFaq?.category).toBe('PROCESS')
      expect(newFaq?.serviceId).toBeNull()

      // Cleanup
      if (newFaq) {
        await prisma.faq.delete({ where: { id: newFaq.id } })
      }
    })

    test('creates a service-specific FAQ', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs/new')

      // Fill in form
      await authenticatedPage
        .getByLabel('Question')
        .fill('How long does a headshot session take?')

      await authenticatedPage.locator('.ProseMirror').fill('About 30 minutes')

      await authenticatedPage.selectOption('select#category', 'BOOKING')
      await authenticatedPage.selectOption('select#service', service.id)

      // Submit form
      await authenticatedPage
        .getByRole('button', { name: 'Create FAQ' })
        .click()

      await authenticatedPage.waitForURL('/admin/faqs')

      // Verify FAQ was created with service
      const newFaq = await prisma.faq.findFirst({
        where: { question: 'How long does a headshot session take?' },
      })
      expect(newFaq).toBeDefined()
      expect(newFaq?.serviceId).toBe(service.id)

      // Cleanup
      if (newFaq) {
        await prisma.faq.delete({ where: { id: newFaq.id } })
      }
    })

    test('validates required fields', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs/new')

      // Try to submit without filling required fields
      await authenticatedPage
        .getByRole('button', { name: 'Create FAQ' })
        .click()

      // Form should not submit (browser validation)
      await expect(authenticatedPage).toHaveURL('/admin/faqs/new')
    })
  })

  test.describe('Edit FAQ Page', () => {
    test('displays edit FAQ form with existing data', async ({
      authenticatedPage,
    }) => {
      await authenticatedPage.goto(`/admin/faqs/${testFaq.id}`)

      await expect(
        authenticatedPage.getByRole('heading', { name: 'Edit FAQ' })
      ).toBeVisible()

      // Should show existing question
      await expect(authenticatedPage.getByLabel('Question')).toHaveValue(
        'What should clients wear?'
      )

      // Category should be selected
      const categorySelect = authenticatedPage.locator('select#category')
      await expect(categorySelect).toHaveValue('GENERAL')
    })

    test('updates FAQ successfully', async ({ authenticatedPage }) => {
      await authenticatedPage.goto(`/admin/faqs/${testFaq.id}`)

      // Update question
      await authenticatedPage
        .getByLabel('Question')
        .fill('What should clients wear for headshots?')

      // Update category
      await authenticatedPage.selectOption('select#category', 'PROCESS')

      // Uncheck active status
      await authenticatedPage.getByLabel('Active (visible to public)').uncheck()

      // Submit form
      await authenticatedPage
        .getByRole('button', { name: 'Update FAQ' })
        .click()

      await authenticatedPage.waitForURL('/admin/faqs')

      // Verify updates in database
      const updatedFaq = await prisma.faq.findUnique({
        where: { id: testFaq.id },
      })
      expect(updatedFaq?.question).toBe(
        'What should clients wear for headshots?'
      )
      expect(updatedFaq?.category).toBe('PROCESS')
      expect(updatedFaq?.isActive).toBe(false)
    })

    test('cancels edit and returns to list', async ({ authenticatedPage }) => {
      await authenticatedPage.goto(`/admin/faqs/${testFaq.id}`)

      // Click cancel button
      await authenticatedPage.getByRole('button', { name: 'Cancel' }).click()

      // Should navigate back to list
      await expect(authenticatedPage).toHaveURL('/admin/faqs')
    })
  })

  test.describe('Rich Text Editor', () => {
    test('formats text with bold', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs/new')

      // Focus the editor
      const editor = authenticatedPage.locator('.ProseMirror')
      await editor.click()
      await editor.fill('This is bold text')

      // Select all text
      await authenticatedPage.keyboard.press('Control+a')

      // Click bold button
      await authenticatedPage.locator('button[title="Bold"]').click()

      // Verify bold is applied (button should be active)
      const boldButton = authenticatedPage.locator('button[title="Bold"]')
      await expect(boldButton).toHaveClass(/bg-gray-300/)
    })

    test('creates bullet list', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs/new')

      const editor = authenticatedPage.locator('.ProseMirror')
      await editor.click()
      await editor.fill('List item 1')

      // Click bullet list button
      await authenticatedPage.locator('button[title="Bullet List"]').click()

      // Verify list is created (button should be active)
      const listButton = authenticatedPage.locator(
        'button[title="Bullet List"]'
      )
      await expect(listButton).toHaveClass(/bg-gray-300/)
    })

    test('adds link', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/admin/faqs/new')

      const editor = authenticatedPage.locator('.ProseMirror')
      await editor.click()
      await editor.fill('Click here')

      // Select text
      await authenticatedPage.keyboard.press('Control+a')

      // Set up dialog handler for link URL prompt
      authenticatedPage.on('dialog', async (dialog) => {
        await dialog.accept('https://example.com')
      })

      // Click link button
      await authenticatedPage.locator('button[title="Add Link"]').click()

      // Wait a moment for dialog
      await authenticatedPage.waitForTimeout(500)

      // Verify link button is active
      const linkButton = authenticatedPage.locator('button[title="Add Link"]')
      await expect(linkButton).toHaveClass(/bg-gray-300/)
    })
  })
})
