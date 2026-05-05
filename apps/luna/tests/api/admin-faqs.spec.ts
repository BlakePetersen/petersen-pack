// ABOUTME: E2E tests for admin FAQ management API endpoints
// ABOUTME: Tests CRUD operations, authentication, and authorization for FAQs

import { test, expect } from '../fixtures'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

test.describe('Admin FAQ API - Authentication & CRUD Operations', () => {
  let faq1: { id: string; question: string }
  let faq2: { id: string; question: string }
  let service: { id: string; name: string }
  let clientUser: { id: string; email: string }

  test.beforeEach(async () => {
    // Create a test service
    service = await prisma.service.create({
      data: {
        name: 'Test Photography Service',
        slug: `test-service-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        description: 'Test service description',
        isActive: true,
        sortOrder: 1,
      },
    })

    // Create test FAQs
    ;[faq1, faq2] = await Promise.all([
      prisma.faq.create({
        data: {
          question: 'What should I bring?',
          answer: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Bring comfortable clothes' }],
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
          question: 'How long is the session?',
          answer: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Sessions last 1-2 hours' }],
              },
            ],
          },
          category: 'BOOKING',
          serviceId: service.id,
          sortOrder: 2,
          isActive: true,
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
    if (faq1) {
      await prisma.faq.delete({ where: { id: faq1.id } }).catch(() => {})
    }
    if (faq2) {
      await prisma.faq.delete({ where: { id: faq2.id } }).catch(() => {})
    }
    if (service) {
      await prisma.service.delete({ where: { id: service.id } }).catch(() => {})
    }
    if (clientUser) {
      await prisma.user.delete({ where: { id: clientUser.id } }).catch(() => {})
    }
  })

  test.describe('GET /api/admin/faqs', () => {
    test('blocks unauthenticated requests', async ({ page }) => {
      const response = await page.request.get('/api/admin/faqs')
      expect(response.status()).toBe(401)

      const error = await response.json()
      expect(error.error).toBe('Unauthorized')
    })

    test('blocks non-admin authenticated requests', async ({ page }) => {
      await page.goto('/login')
      await page.getByLabel('Email Address').fill(clientUser.email)
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Sign In' }).click()
      await page.waitForURL('/admin')

      const response = await page.request.get('/api/admin/faqs')
      expect(response.status()).toBe(401)

      const error = await response.json()
      expect(error.error).toBe('Unauthorized')
    })

    test('allows admin to list all FAQs', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.get('/api/admin/faqs')
      expect(response.status()).toBe(200)

      const faqs = await response.json()
      expect(Array.isArray(faqs)).toBe(true)
      expect(faqs.length).toBeGreaterThanOrEqual(2)

      const faq1Data = faqs.find((f: any) => f.id === faq1.id)
      expect(faq1Data.question).toBe('What should I bring?')
      expect(faq1Data.category).toBe('GENERAL')
      expect(faq1Data.serviceId).toBeNull()
    })

    test('filters FAQs by service', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.get(
        `/api/admin/faqs?serviceId=${service.id}`
      )
      expect(response.status()).toBe(200)

      const faqs = await response.json()
      expect(faqs.length).toBe(1)
      expect(faqs[0].id).toBe(faq2.id)
      expect(faqs[0].service.id).toBe(service.id)
    })

    test('filters FAQs by category', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.get(
        '/api/admin/faqs?category=GENERAL'
      )
      expect(response.status()).toBe(200)

      const faqs = await response.json()
      const generalFaqs = faqs.filter((f: any) => f.category === 'GENERAL')
      expect(generalFaqs.length).toBeGreaterThanOrEqual(1)
    })

    test('searches FAQs by question text', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.get(
        '/api/admin/faqs?search=bring'
      )
      expect(response.status()).toBe(200)

      const faqs = await response.json()
      const matchingFaq = faqs.find((f: any) => f.id === faq1.id)
      expect(matchingFaq).toBeDefined()
    })
  })

  test.describe('POST /api/admin/faqs', () => {
    test('blocks unauthenticated requests', async ({ page }) => {
      const response = await page.request.post('/api/admin/faqs', {
        data: {
          question: 'Test FAQ',
          answer: JSON.stringify({ type: 'doc', content: [] }),
          category: 'GENERAL',
          serviceId: null,
          sortOrder: 0,
          isActive: true,
        },
      })

      expect(response.status()).toBe(401)
    })

    test('blocks non-admin authenticated requests', async ({ page }) => {
      await page.goto('/login')
      await page.getByLabel('Email Address').fill(clientUser.email)
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Sign In' }).click()
      await page.waitForURL('/admin')

      const response = await page.request.post('/api/admin/faqs', {
        data: {
          question: 'Test FAQ',
          answer: JSON.stringify({ type: 'doc', content: [] }),
          category: 'GENERAL',
          serviceId: null,
          sortOrder: 0,
          isActive: true,
        },
      })

      expect(response.status()).toBe(401)
    })

    test('allows admin to create a general FAQ', async ({
      authenticatedPage,
    }) => {
      const response = await authenticatedPage.request.post('/api/admin/faqs', {
        data: {
          question: 'What is your cancellation policy?',
          answer: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '24 hours notice required' }],
              },
            ],
          }),
          category: 'POLICIES',
          serviceId: null,
          sortOrder: 10,
          isActive: true,
        },
      })

      expect(response.status()).toBe(201)

      const newFaq = await response.json()
      expect(newFaq.question).toBe('What is your cancellation policy?')
      expect(newFaq.category).toBe('POLICIES')
      expect(newFaq.serviceId).toBeNull()
      expect(newFaq.sortOrder).toBe(10)
      expect(newFaq.isActive).toBe(true)

      // Verify in database
      const dbFaq = await prisma.faq.findUnique({ where: { id: newFaq.id } })
      expect(dbFaq).toBeDefined()
      expect(dbFaq?.question).toBe('What is your cancellation policy?')

      // Cleanup
      await prisma.faq.delete({ where: { id: newFaq.id } })
    })

    test('allows admin to create a service-specific FAQ', async ({
      authenticatedPage,
    }) => {
      const response = await authenticatedPage.request.post('/api/admin/faqs', {
        data: {
          question: 'What should I wear for headshots?',
          answer: JSON.stringify({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Solid colors work best' }],
              },
            ],
          }),
          category: 'PROCESS',
          serviceId: service.id,
          sortOrder: 5,
          isActive: true,
        },
      })

      expect(response.status()).toBe(201)

      const newFaq = await response.json()
      expect(newFaq.serviceId).toBe(service.id)
      expect(newFaq.service.id).toBe(service.id)

      // Cleanup
      await prisma.faq.delete({ where: { id: newFaq.id } })
    })

    test('validates required fields', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.post('/api/admin/faqs', {
        data: {
          // Missing question
          answer: JSON.stringify({ type: 'doc', content: [] }),
          category: 'GENERAL',
        },
      })

      expect(response.status()).toBe(400)

      const error = await response.json()
      expect(error.error).toContain('required')
    })
  })

  test.describe('GET /api/admin/faqs/[id]', () => {
    test('blocks unauthenticated requests', async ({ page }) => {
      const response = await page.request.get(`/api/admin/faqs/${faq1.id}`)
      expect(response.status()).toBe(401)
    })

    test('allows admin to get FAQ by id', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.get(
        `/api/admin/faqs/${faq1.id}`
      )
      expect(response.status()).toBe(200)

      const faq = await response.json()
      expect(faq.id).toBe(faq1.id)
      expect(faq.question).toBe('What should I bring?')
    })

    test('returns 404 for non-existent FAQ', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.get(
        '/api/admin/faqs/non-existent-id'
      )
      expect(response.status()).toBe(404)
    })
  })

  test.describe('PUT /api/admin/faqs/[id]', () => {
    test('blocks unauthenticated requests', async ({ page }) => {
      const response = await page.request.put(`/api/admin/faqs/${faq1.id}`, {
        data: { question: 'Updated question' },
      })
      expect(response.status()).toBe(401)
    })

    test('allows admin to update FAQ', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.put(
        `/api/admin/faqs/${faq1.id}`,
        {
          data: {
            question: 'What should I bring to the session?',
            answer: JSON.stringify({
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Bring comfortable clothes and props',
                    },
                  ],
                },
              ],
            }),
            category: 'PROCESS',
            serviceId: service.id,
            sortOrder: 99,
            isActive: false,
          },
        }
      )

      expect(response.status()).toBe(200)

      const updatedFaq = await response.json()
      expect(updatedFaq.question).toBe('What should I bring to the session?')
      expect(updatedFaq.category).toBe('PROCESS')
      expect(updatedFaq.serviceId).toBe(service.id)
      expect(updatedFaq.sortOrder).toBe(99)
      expect(updatedFaq.isActive).toBe(false)

      // Verify in database
      const dbFaq = await prisma.faq.findUnique({ where: { id: faq1.id } })
      expect(dbFaq?.question).toBe('What should I bring to the session?')
      expect(dbFaq?.isActive).toBe(false)
    })
  })

  test.describe('DELETE /api/admin/faqs/[id]', () => {
    test('blocks unauthenticated requests', async ({ page }) => {
      const response = await page.request.delete(`/api/admin/faqs/${faq1.id}`)
      expect(response.status()).toBe(401)

      // Verify FAQ was not deleted
      const unchangedFaq = await prisma.faq.findUnique({
        where: { id: faq1.id },
      })
      expect(unchangedFaq).toBeDefined()
    })

    test('allows admin to delete FAQ', async ({ authenticatedPage }) => {
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

      const response = await authenticatedPage.request.delete(
        `/api/admin/faqs/${faqToDelete.id}`
      )

      expect(response.status()).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)

      // Verify FAQ was deleted
      const deletedFaq = await prisma.faq.findUnique({
        where: { id: faqToDelete.id },
      })
      expect(deletedFaq).toBeNull()
    })
  })

  test.describe('POST /api/admin/faqs/[id]/duplicate', () => {
    test('blocks unauthenticated requests', async ({ page }) => {
      const response = await page.request.post(
        `/api/admin/faqs/${faq1.id}/duplicate`
      )
      expect(response.status()).toBe(401)
    })

    test('allows admin to duplicate FAQ', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.post(
        `/api/admin/faqs/${faq1.id}/duplicate`
      )

      expect(response.status()).toBe(201)

      const duplicatedFaq = await response.json()
      expect(duplicatedFaq.question).toBe('What should I bring? (Copy)')
      expect(duplicatedFaq.category).toBe(
        faq1.question === 'What should I bring?' ? 'GENERAL' : faq1.question
      )
      expect(duplicatedFaq.isActive).toBe(false)
      expect(duplicatedFaq.id).not.toBe(faq1.id)

      // Cleanup
      await prisma.faq.delete({ where: { id: duplicatedFaq.id } })
    })
  })

  test.describe('POST /api/admin/faqs/reorder', () => {
    test('blocks unauthenticated requests', async ({ page }) => {
      const response = await page.request.post('/api/admin/faqs/reorder', {
        data: {
          faqOrders: [
            { id: faq1.id, sortOrder: 100 },
            { id: faq2.id, sortOrder: 50 },
          ],
        },
      })

      expect(response.status()).toBe(401)
    })

    test('allows admin to reorder FAQs', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.post(
        '/api/admin/faqs/reorder',
        {
          data: {
            faqOrders: [
              { id: faq1.id, sortOrder: 100 },
              { id: faq2.id, sortOrder: 50 },
            ],
          },
        }
      )

      expect(response.status()).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)

      // Verify in database
      const [updatedFaq1, updatedFaq2] = await Promise.all([
        prisma.faq.findUnique({ where: { id: faq1.id } }),
        prisma.faq.findUnique({ where: { id: faq2.id } }),
      ])
      expect(updatedFaq1?.sortOrder).toBe(100)
      expect(updatedFaq2?.sortOrder).toBe(50)
    })

    test('validates faqOrders must be array', async ({ authenticatedPage }) => {
      const response = await authenticatedPage.request.post(
        '/api/admin/faqs/reorder',
        {
          data: {
            faqOrders: 'not-an-array',
          },
        }
      )

      expect(response.status()).toBe(400)
    })
  })

  test.describe('POST /api/admin/faqs/[id]/view', () => {
    test('allows unauthenticated view tracking', async ({ page }) => {
      const initialViewCount =
        (
          await prisma.faq.findUnique({
            where: { id: faq1.id },
          })
        )?.viewCount || 0

      const response = await page.request.post(
        `/api/admin/faqs/${faq1.id}/view`
      )

      expect(response.status()).toBe(200)

      const result = await response.json()
      expect(result.success).toBe(true)

      // Verify view count was incremented
      const updatedFaq = await prisma.faq.findUnique({
        where: { id: faq1.id },
      })
      expect(updatedFaq?.viewCount).toBe(initialViewCount + 1)
    })
  })
})
