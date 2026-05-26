// ABOUTME: E2E integration tests for contract creation API
// ABOUTME: Tests admin authentication and contract creation workflow

import { test, expect } from '../fixtures'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

test.describe('Contract Creation API', () => {
  let testClientEmail: string
  let clientUserId: string
  let usageRightId: string

  test.beforeEach(async () => {
    // Use unique email per test to avoid collisions
    testClientEmail = `testclient-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`

    // Ensure usage rights are seeded
    const usageRight = await prisma.usageRight.findFirst({
      where: { slug: 'personal-use' },
    })
    if (!usageRight) {
      throw new Error('Usage rights not seeded. Run: pnpm prisma db seed')
    }
    usageRightId = usageRight.id

    // Create a test client user (password not needed for API tests)
    const client = await prisma.user.create({
      data: {
        email: testClientEmail,
        password: 'not-used-in-tests',
        name: 'Test Client',
        role: 'CLIENT',
      },
    })
    clientUserId = client.id
  })

  test.afterEach(async () => {
    // Cleanup test client
    if (clientUserId) {
      await prisma.user
        .delete({
          where: { id: clientUserId },
        })
        .catch(() => {
          // User might already be deleted
        })
    }
  })

  test('admin can create a contract via API', async ({ authenticatedPage }) => {
    const contractData = {
      clientId: clientUserId,
      shootType: 'Wedding',
      shootDate: '2025-06-15',
      shootLocation: 'Central Park, NYC',
      sessionDuration: '4 hours',
      deliverablesDescription:
        '200 professionally edited high-resolution photos',
      totalAmount: 250000, // $2,500 in cents
      depositAmount: 125000, // $1,250 in cents
      retouchesIncluded: 10,
      pricePerExtraRetouch: 10000, // $100 in cents
      downloadQuota: 50,
      maxFileSizePx: 4000,
      usageRightIds: [usageRightId],
    }

    // Make API request using authenticated page's context
    const response = await authenticatedPage.request.post(
      '/api/admin/contracts',
      {
        data: contractData,
      }
    )

    expect(response.status()).toBe(201)

    const contract = await response.json()
    expect(contract.id).toBeDefined()
    expect(contract.status).toBe('DRAFT')
    expect(contract.clientId).toBe(clientUserId)
    expect(contract.shootType).toBe('Wedding')
    expect(contract.totalAmount).toBe(250000) // Should match input since personal-use is free
    expect(contract.depositAmount).toBe(125000)
    expect(contract.usageRights).toHaveLength(1)
    expect(contract.usageRights[0].usageRight.slug).toBe('personal-use')

    // Cleanup
    await prisma.contractUsageRight.deleteMany({
      where: { contractId: contract.id },
    })
    await prisma.contract.delete({
      where: { id: contract.id },
    })
  })

  test('unauthenticated requests are rejected', async ({ page }) => {
    // Don't use authenticatedPage - use regular page without auth
    const contractData = {
      clientId: clientUserId,
      shootType: 'Portrait',
      shootDate: '2025-07-01',
      shootLocation: 'Studio',
      sessionDuration: '2 hours',
      deliverablesDescription: '50 edited photos',
      totalAmount: 100000,
      depositAmount: 50000,
      retouchesIncluded: 5,
      pricePerExtraRetouch: 5000,
      downloadQuota: 25,
      maxFileSizePx: 4000,
      usageRightIds: [usageRightId],
    }

    const response = await page.request.post('/api/admin/contracts', {
      data: contractData,
    })

    expect(response.status()).toBe(401)

    const error = await response.json()
    expect(error.error).toBe('Unauthorized')
  })

  test('calculates total including usage rights pricing', async ({
    authenticatedPage,
  }) => {
    // Get a paid usage right
    const paidUsageRight = await prisma.usageRight.findFirst({
      where: { slug: 'social-media-web' },
    })

    if (!paidUsageRight) {
      throw new Error('Paid usage right not found')
    }

    const contractData = {
      clientId: clientUserId,
      shootType: 'Branding',
      shootDate: '2025-08-01',
      shootLocation: 'Office',
      sessionDuration: '3 hours',
      deliverablesDescription: '100 edited photos for marketing',
      totalAmount: 200000, // $2,000 in cents
      depositAmount: 100000, // $1,000 in cents
      retouchesIncluded: 15,
      pricePerExtraRetouch: 8000,
      downloadQuota: 75,
      maxFileSizePx: 6000,
      usageRightIds: [paidUsageRight.id],
    }

    const response = await authenticatedPage.request.post(
      '/api/admin/contracts',
      {
        data: contractData,
      }
    )

    expect(response.status()).toBe(201)

    const contract = await response.json()
    // Total should include base price + usage rights price
    const expectedTotal = 200000 + paidUsageRight.price
    expect(contract.totalAmount).toBe(expectedTotal)
    expect(contract.usageRights).toHaveLength(1)
    expect(contract.usageRights[0].usageRight.price).toBe(50000) // $500

    // Cleanup
    await prisma.contractUsageRight.deleteMany({
      where: { contractId: contract.id },
    })
    await prisma.contract.delete({
      where: { id: contract.id },
    })
  })

  test('admin can link gallery to signed contract', async ({
    authenticatedPage,
    page,
  }) => {
    const email = `admin-${Date.now()}@test.com`
    const clientEmail = `client-${Date.now()}@test.com`

    // Setup: Create admin, client, contract, and gallery
    const [admin, client] = await Promise.all([
      prisma.user.create({
        data: {
          email,
          name: 'Admin User',
          role: 'ADMIN',
          password: await hash('password123', 10),
        },
      }),
      prisma.user.create({
        data: {
          email: clientEmail,
          name: 'Test Client',
          role: 'CLIENT',
          password: await hash('password123', 10),
        },
      }),
    ])

    const usageRight = await prisma.usageRight.findFirst({
      where: { slug: 'personal-use' },
    })

    const contract = await prisma.contract.create({
      data: {
        clientId: client.id,
        shootType: 'Wedding',
        shootDate: new Date('2025-06-15'),
        shootLocation: 'Central Park',
        sessionDuration: '4 hours',
        deliverablesDescription: '200 edited photos',
        totalAmount: 250000,
        depositAmount: 125000,
        retouchesIncluded: 10,
        pricePerExtraRetouch: 10000,
        downloadQuota: 50,
        maxFileSizePx: 4000,
        status: 'SIGNED',
        signedAt: new Date(),
        usageRights: {
          create: [{ usageRightId: usageRight!.id }],
        },
      },
    })

    const gallery = await prisma.clientGallery.create({
      data: {
        clientId: client.id,
        title: 'Wedding Photos',
        slug: `wedding-${Date.now()}`,
      },
    })

    // Test: Link gallery to contract
    await authenticatedPage.goto(
      `http://localhost:3333/admin/contracts/${contract.id}`
    )
    await authenticatedPage.click(
      `button[type="submit"]:has-text("${gallery.title}")`
    )

    // Verify: Gallery is linked
    const updatedGallery = await prisma.clientGallery.findUnique({
      where: { id: gallery.id },
    })

    expect(updatedGallery?.contractId).toBe(contract.id)
    expect(updatedGallery?.expiresAt).toBeDefined()

    // Cleanup
    await prisma.clientGallery.delete({ where: { id: gallery.id } })
    await prisma.contract.delete({ where: { id: contract.id } })
    await Promise.all([
      prisma.user.delete({ where: { id: admin.id } }),
      prisma.user.delete({ where: { id: client.id } }),
    ])
  })
})
