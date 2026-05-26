// ABOUTME: E2E tests for admin gallery management API endpoints
// ABOUTME: Tests authentication and authorization for featured status and reordering

import { test, expect } from '../fixtures'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

test.describe('Admin Gallery API - Authentication & Authorization', () => {
  let gallery1: { id: string; featured: boolean }
  let gallery2: { id: string; featured: boolean }
  let clientUser: { id: string; email: string }

  test.beforeEach(async () => {
    // Create test galleries
    ;[gallery1, gallery2] = await Promise.all([
      prisma.gallery.create({
        data: {
          title: 'Test Gallery 1',
          slug: `test-gallery-1-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          description: 'Test description 1',
          featured: false,
          sortOrder: 1,
        },
      }),
      prisma.gallery.create({
        data: {
          title: 'Test Gallery 2',
          slug: `test-gallery-2-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          description: 'Test description 2',
          featured: false,
          sortOrder: 2,
        },
      }),
    ])

    // Create a client user for authorization tests
    const clientEmail = `client-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`
    clientUser = await prisma.user.create({
      data: {
        email: clientEmail,
        password: await hash('password123', 10),
        name: 'Test Client',
        role: 'CLIENT',
      },
    })
  })

  test.afterEach(async () => {
    // Cleanup in reverse order
    if (gallery1) {
      await prisma.gallery
        .delete({ where: { id: gallery1.id } })
        .catch(() => {})
    }
    if (gallery2) {
      await prisma.gallery
        .delete({ where: { id: gallery2.id } })
        .catch(() => {})
    }
    if (clientUser) {
      await prisma.user.delete({ where: { id: clientUser.id } }).catch(() => {})
    }
  })

  test.describe('PATCH /api/admin/galleries/[id]/featured', () => {
    test('blocks unauthenticated requests', async ({ page }) => {
      // Don't login - use unauthenticated page
      const response = await page.request.patch(
        `/api/admin/galleries/${gallery1.id}/featured`,
        {
          data: { featured: true },
        }
      )

      expect(response.status()).toBe(401)

      const error = await response.json()
      expect(error.error).toBe('Unauthorized')

      // Verify gallery was not modified
      const unchangedGallery = await prisma.gallery.findUnique({
        where: { id: gallery1.id },
      })
      expect(unchangedGallery?.featured).toBe(false)
    })

    test('blocks non-admin authenticated requests', async ({ page }) => {
      // Login as client (non-admin)
      await page.goto('/login')
      await page.getByLabel('Email Address').fill(clientUser.email)
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Sign In' }).click()
      await page.waitForURL('/admin')

      const response = await page.request.patch(
        `/api/admin/galleries/${gallery1.id}/featured`,
        {
          data: { featured: true },
        }
      )

      expect(response.status()).toBe(401)

      const error = await response.json()
      expect(error.error).toBe('Unauthorized')

      // Verify gallery was not modified
      const unchangedGallery = await prisma.gallery.findUnique({
        where: { id: gallery1.id },
      })
      expect(unchangedGallery?.featured).toBe(false)
    })

    test('allows admin to toggle featured status to true', async ({
      authenticatedPage,
    }) => {
      const response = await authenticatedPage.request.patch(
        `/api/admin/galleries/${gallery1.id}/featured`,
        {
          data: { featured: true },
        }
      )

      expect(response.status()).toBe(200)

      const updatedGallery = await response.json()
      expect(updatedGallery.id).toBe(gallery1.id)
      expect(updatedGallery.featured).toBe(true)

      // Verify in database
      const dbGallery = await prisma.gallery.findUnique({
        where: { id: gallery1.id },
      })
      expect(dbGallery?.featured).toBe(true)
    })

    test('allows admin to toggle featured status to false', async ({
      authenticatedPage,
    }) => {
      // First set to true
      await prisma.gallery.update({
        where: { id: gallery1.id },
        data: { featured: true },
      })

      const response = await authenticatedPage.request.patch(
        `/api/admin/galleries/${gallery1.id}/featured`,
        {
          data: { featured: false },
        }
      )

      expect(response.status()).toBe(200)

      const updatedGallery = await response.json()
      expect(updatedGallery.featured).toBe(false)

      // Verify in database
      const dbGallery = await prisma.gallery.findUnique({
        where: { id: gallery1.id },
      })
      expect(dbGallery?.featured).toBe(false)
    })

    test('validates featured must be boolean', async ({
      authenticatedPage,
    }) => {
      const response = await authenticatedPage.request.patch(
        `/api/admin/galleries/${gallery1.id}/featured`,
        {
          data: { featured: 'not-a-boolean' },
        }
      )

      expect(response.status()).toBe(400)

      const error = await response.json()
      expect(error.error).toContain('boolean')
    })
  })

  test.describe('POST /api/admin/galleries/reorder', () => {
    test('blocks unauthenticated requests', async ({ page }) => {
      // Don't login - use unauthenticated page
      const response = await page.request.post(`/api/admin/galleries/reorder`, {
        data: {
          galleryOrders: [
            { id: gallery1.id, sortOrder: 10 },
            { id: gallery2.id, sortOrder: 20 },
          ],
        },
      })

      expect(response.status()).toBe(401)

      const error = await response.json()
      expect(error.error).toBe('Unauthorized')

      // Verify galleries were not modified
      const [unchangedGallery1, unchangedGallery2] = await Promise.all([
        prisma.gallery.findUnique({ where: { id: gallery1.id } }),
        prisma.gallery.findUnique({ where: { id: gallery2.id } }),
      ])
      expect(unchangedGallery1?.sortOrder).toBe(1)
      expect(unchangedGallery2?.sortOrder).toBe(2)
    })

    test('blocks non-admin authenticated requests', async ({ page }) => {
      // Login as client (non-admin)
      await page.goto('/login')
      await page.getByLabel('Email Address').fill(clientUser.email)
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Sign In' }).click()
      await page.waitForURL('/admin')

      const response = await page.request.post(`/api/admin/galleries/reorder`, {
        data: {
          galleryOrders: [
            { id: gallery1.id, sortOrder: 10 },
            { id: gallery2.id, sortOrder: 20 },
          ],
        },
      })

      expect(response.status()).toBe(401)

      const error = await response.json()
      expect(error.error).toBe('Unauthorized')

      // Verify galleries were not modified
      const [unchangedGallery1, unchangedGallery2] = await Promise.all([
        prisma.gallery.findUnique({ where: { id: gallery1.id } }),
        prisma.gallery.findUnique({ where: { id: gallery2.id } }),
      ])
      expect(unchangedGallery1?.sortOrder).toBe(1)
      expect(unchangedGallery2?.sortOrder).toBe(2)
    })

    test('allows admin to reorder galleries', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.post(
        `/api/admin/galleries/reorder`,
        {
          data: {
            galleryOrders: [
              { id: gallery1.id, sortOrder: 100 },
              { id: gallery2.id, sortOrder: 50 },
            ],
          },
        }
      )

      expect(response.status()).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)

      // Verify in database
      const [updatedGallery1, updatedGallery2] = await Promise.all([
        prisma.gallery.findUnique({ where: { id: gallery1.id } }),
        prisma.gallery.findUnique({ where: { id: gallery2.id } }),
      ])
      expect(updatedGallery1?.sortOrder).toBe(100)
      expect(updatedGallery2?.sortOrder).toBe(50)
    })

    test('validates galleryOrders must be array', async ({
      authenticatedPage,
    }) => {
      const response = await authenticatedPage.request.post(
        `/api/admin/galleries/reorder`,
        {
          data: {
            galleryOrders: 'not-an-array',
          },
        }
      )

      expect(response.status()).toBe(400)

      const error = await response.json()
      expect(error.error).toContain('Invalid gallery orders format')
    })

    test('handles empty array', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.post(
        `/api/admin/galleries/reorder`,
        {
          data: {
            galleryOrders: [],
          },
        }
      )

      // Empty array is valid - just does nothing
      expect(response.status()).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)
    })

    test('handles single gallery reorder', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.post(
        `/api/admin/galleries/reorder`,
        {
          data: {
            galleryOrders: [{ id: gallery1.id, sortOrder: 999 }],
          },
        }
      )

      expect(response.status()).toBe(200)

      // Verify only the specified gallery was updated
      const updatedGallery1 = await prisma.gallery.findUnique({
        where: { id: gallery1.id },
      })
      expect(updatedGallery1?.sortOrder).toBe(999)

      // Gallery 2 should be unchanged
      const unchangedGallery2 = await prisma.gallery.findUnique({
        where: { id: gallery2.id },
      })
      expect(unchangedGallery2?.sortOrder).toBe(2)
    })
  })
})
