// ABOUTME: E2E tests for public FAQ page functionality
// ABOUTME: Tests category filtering, accordion interaction, and content display

import { test, expect } from '../fixtures'
import { prisma } from '@/lib/prisma'

test.describe('Public FAQ Page', () => {
  let generalFaq1: { id: string }
  let generalFaq2: { id: string }
  let bookingFaq: { id: string }
  let pricingFaq: { id: string }
  let inactiveFaq: { id: string }

  test.beforeAll(async () => {
    // Create test FAQs
    ;[generalFaq1, generalFaq2, bookingFaq, pricingFaq, inactiveFaq] =
      await Promise.all([
        prisma.faq.create({
          data: {
            question: 'What should I bring to my session?',
            answer: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Bring comfortable clothes and any props you want to include.',
                    },
                  ],
                },
              ],
            },
            category: 'GENERAL',
            serviceId: null,
            sortOrder: 1,
            isActive: true,
          },
        }),
        prisma.faq.create({
          data: {
            question: 'How do I prepare for my session?',
            answer: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Get plenty of rest and arrive on time.',
                    },
                  ],
                },
              ],
            },
            category: 'GENERAL',
            serviceId: null,
            sortOrder: 2,
            isActive: true,
          },
        }),
        prisma.faq.create({
          data: {
            question: 'How do I book a session?',
            answer: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Visit our contact page to book.' },
                  ],
                },
              ],
            },
            category: 'BOOKING',
            serviceId: null,
            sortOrder: 3,
            isActive: true,
          },
        }),
        prisma.faq.create({
          data: {
            question: 'What are your rates?',
            answer: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Rates start at $200 per session.' },
                  ],
                },
              ],
            },
            category: 'PRICING',
            serviceId: null,
            sortOrder: 4,
            isActive: true,
          },
        }),
        prisma.faq.create({
          data: {
            question: 'This FAQ is inactive',
            answer: { type: 'doc', content: [] },
            category: 'GENERAL',
            serviceId: null,
            sortOrder: 99,
            isActive: false,
          },
        }),
      ])
  })

  test.afterAll(async () => {
    // Cleanup
    await Promise.all([
      prisma.faq.delete({ where: { id: generalFaq1.id } }).catch(() => {}),
      prisma.faq.delete({ where: { id: generalFaq2.id } }).catch(() => {}),
      prisma.faq.delete({ where: { id: bookingFaq.id } }).catch(() => {}),
      prisma.faq.delete({ where: { id: pricingFaq.id } }).catch(() => {}),
      prisma.faq.delete({ where: { id: inactiveFaq.id } }).catch(() => {}),
    ])
  })

  test('displays FAQ page with heading and description', async ({ page }) => {
    await page.goto('/faq')

    await expect(
      page.getByRole('heading', { name: 'Frequently Asked Questions' })
    ).toBeVisible()

    await expect(
      page.getByText('Find answers to common questions about our services')
    ).toBeVisible()
  })

  test('displays all active general FAQs by default', async ({ page }) => {
    await page.goto('/faq')

    // Should show general FAQs
    await expect(
      page.getByText('What should I bring to my session?')
    ).toBeVisible()
    await expect(
      page.getByText('How do I prepare for my session?')
    ).toBeVisible()

    // Should not show inactive FAQ
    await expect(page.getByText('This FAQ is inactive')).not.toBeVisible()
  })

  test('filters FAQs by category - desktop tabs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/faq')

    // Click Booking tab (desktop)
    await page.getByRole('button', { name: 'Booking' }).click()

    // Should show only booking FAQs
    await expect(page.getByText('How do I book a session?')).toBeVisible()

    // Should not show general FAQs
    await expect(
      page.getByText('What should I bring to my session?')
    ).not.toBeVisible()

    // Click Pricing tab
    await page.getByRole('button', { name: 'Pricing' }).click()

    // Should show only pricing FAQs
    await expect(page.getByText('What are your rates?')).toBeVisible()
    await expect(page.getByText('How do I book a session?')).not.toBeVisible()
  })

  test('filters FAQs by category - mobile dropdown', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/faq')

    // Select Booking from dropdown (mobile)
    await page.selectOption('select#category-select', 'BOOKING')

    // Should show only booking FAQs
    await expect(page.getByText('How do I book a session?')).toBeVisible()

    // Should not show general FAQs
    await expect(
      page.getByText('What should I bring to my session?')
    ).not.toBeVisible()
  })

  test('expands and collapses FAQ accordion', async ({ page }) => {
    await page.goto('/faq')

    // Initially, answer should not be visible
    await expect(
      page.getByText('Bring comfortable clothes and any props')
    ).not.toBeVisible()

    // Click to expand
    await page
      .getByRole('button', { name: 'What should I bring to my session?' })
      .click()

    // Answer should now be visible
    await expect(
      page.getByText('Bring comfortable clothes and any props')
    ).toBeVisible()

    // Click again to collapse
    await page
      .getByRole('button', { name: 'What should I bring to my session?' })
      .click()

    // Answer should be hidden again
    await expect(
      page.getByText('Bring comfortable clothes and any props')
    ).not.toBeVisible()
  })

  test('allows multiple FAQs to be expanded simultaneously', async ({
    page,
  }) => {
    await page.goto('/faq')

    // Expand first FAQ
    await page
      .getByRole('button', { name: 'What should I bring to my session?' })
      .click()

    // Expand second FAQ
    await page
      .getByRole('button', { name: 'How do I prepare for my session?' })
      .click()

    // Both answers should be visible
    await expect(
      page.getByText('Bring comfortable clothes and any props')
    ).toBeVisible()
    await expect(
      page.getByText('Get plenty of rest and arrive on time')
    ).toBeVisible()
  })

  test('shows empty state when no FAQs in category', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/faq')

    // Click Policies tab (assuming no policies FAQs)
    await page.getByRole('button', { name: 'Policies' }).click()

    // Should show empty message
    await expect(page.getByText('No FAQs in this category yet.')).toBeVisible()
  })

  test('displays chevron icon that rotates on expand', async ({ page }) => {
    await page.goto('/faq')

    const faqButton = page.getByRole('button', {
      name: 'What should I bring to my session?',
    })

    // Get the chevron icon
    const chevron = faqButton.locator('svg')

    // Check initial state (not rotated)
    await expect(chevron).not.toHaveClass(/rotate-180/)

    // Click to expand
    await faqButton.click()

    // Chevron should be rotated
    await expect(chevron).toHaveClass(/rotate-180/)
  })

  test('returns to All category when clicking All tab', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/faq')

    // Filter to Booking
    await page.getByRole('button', { name: 'Booking' }).click()
    await expect(page.getByText('How do I book a session?')).toBeVisible()

    // Click All tab
    await page.getByRole('button', { name: 'All' }).click()

    // Should show all FAQs again
    await expect(
      page.getByText('What should I bring to my session?')
    ).toBeVisible()
    await expect(page.getByText('How do I book a session?')).toBeVisible()
    await expect(page.getByText('What are your rates?')).toBeVisible()
  })
})
