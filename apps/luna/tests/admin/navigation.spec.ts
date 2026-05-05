// ABOUTME: E2E tests for admin navigation
// ABOUTME: Tests sidebar navigation and routing

import { test, expect } from '../fixtures'

test.describe('Admin Navigation', () => {
  test('displays sidebar with all main sections', async ({
    authenticatedPage,
  }) => {
    const nav = authenticatedPage.getByRole('navigation')
    await expect(nav).toBeVisible()

    // Verify main navigation items within the sidebar
    await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(
      nav.getByRole('link', { name: 'Galleries', exact: true })
    ).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Blog Posts' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Testimonials' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Inquiries' })).toBeVisible()
  })

  test('navigates to galleries page', async ({ authenticatedPage }) => {
    const nav = authenticatedPage.getByRole('navigation')
    await nav.getByRole('link', { name: 'Galleries', exact: true }).click()

    await expect(authenticatedPage).toHaveURL('/admin/galleries')
    await expect(
      authenticatedPage.getByRole('heading', { name: /galleries/i })
    ).toBeVisible()
  })

  test('navigates to blog page', async ({ authenticatedPage }) => {
    const nav = authenticatedPage.getByRole('navigation')
    await nav.getByRole('link', { name: 'Blog Posts', exact: true }).click()

    await expect(authenticatedPage).toHaveURL('/admin/blog')
    await expect(
      authenticatedPage.getByRole('heading', { name: /blog/i })
    ).toBeVisible()
  })

  test('highlights active navigation item', async ({ authenticatedPage }) => {
    const nav = authenticatedPage.getByRole('navigation')
    await nav.getByRole('link', { name: 'Galleries', exact: true }).click()
    await authenticatedPage.waitForURL('/admin/galleries')

    // Active nav item should have special styling (aria-current or specific class)
    const galleriesLink = nav.getByRole('link', {
      name: 'Galleries',
      exact: true,
    })
    const classes = await galleriesLink.getAttribute('class')

    // Should have active state styling
    expect(classes).toContain('bg-')
  })

  test('shows logout button', async ({ authenticatedPage }) => {
    await expect(
      authenticatedPage.getByRole('button', { name: 'Sign Out' })
    ).toBeVisible()
  })
})
