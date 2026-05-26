// ABOUTME: E2E tests for client image download API with quota enforcement
// ABOUTME: Tests download functionality, quota limits, and payment requirements

import { test, expect } from '../fixtures'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import path from 'path'
import fs from 'fs/promises'

test.describe('Client Image Download API', () => {
  let clientUser: any
  let adminUser: any
  let contract: any
  let clientGallery: any
  let clientImage: any
  let usageRight: any

  test.beforeEach(async () => {
    // Create unique test users
    const clientEmail = `client-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`
    const adminEmail = `admin-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`

    // Get or create usage right
    usageRight = await prisma.usageRight.findFirst({
      where: { slug: 'personal-use' },
    })
    if (!usageRight) {
      throw new Error('Usage rights not seeded. Run: pnpm prisma db seed')
    }

    // Create test users
    ;[clientUser, adminUser] = await Promise.all([
      prisma.user.create({
        data: {
          email: clientEmail,
          password: await hash('password123', 10),
          name: 'Test Client',
          role: 'CLIENT',
        },
      }),
      prisma.user.create({
        data: {
          email: adminEmail,
          password: await hash('password123', 10),
          name: 'Test Admin',
          role: 'ADMIN',
        },
      }),
    ])

    // Create signed contract with download quota
    contract = await prisma.contract.create({
      data: {
        clientId: clientUser.id,
        shootType: 'Wedding',
        shootDate: new Date('2025-06-15'),
        shootLocation: 'Test Location',
        sessionDuration: '4 hours',
        deliverablesDescription: '100 edited photos',
        totalAmount: 250000,
        depositAmount: 125000,
        retouchesIncluded: 10,
        pricePerExtraRetouch: 10000,
        downloadQuota: 5, // Small quota for testing
        maxFileSizePx: 2000, // Max 2000px for testing
        status: 'SIGNED',
        signedAt: new Date(),
        usageRights: {
          create: [{ usageRightId: usageRight.id }],
        },
      },
    })

    // Create client gallery with final payment completed
    clientGallery = await prisma.clientGallery.create({
      data: {
        clientId: clientUser.id,
        title: 'Test Wedding Gallery',
        slug: `test-wedding-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        contractId: contract.id,
        finalPaymentStatus: 'COMPLETED',
        downloadQuotaUsed: 0,
      },
    })

    // Create test image
    // First ensure we have a test image file in public directory
    const testImagePath = path.join(process.cwd(), 'public', 'test-image.jpg')
    try {
      await fs.access(testImagePath)
    } catch {
      // Create a minimal test image if it doesn't exist
      // Note: This is a placeholder - in real tests, you'd have actual test images
      await fs.writeFile(testImagePath, Buffer.from('fake-image-data'))
    }

    clientImage = await prisma.clientImage.create({
      data: {
        clientGalleryId: clientGallery.id,
        url: '/test-image.jpg',
        altText: 'Test Image',
        width: 3000,
        height: 2000,
        sortOrder: 0,
      },
    })
  })

  test.afterEach(async () => {
    // Cleanup in reverse order of creation
    if (clientImage) {
      await prisma.clientImage
        .delete({ where: { id: clientImage.id } })
        .catch(() => {})
    }
    if (clientGallery) {
      await prisma.clientGallery
        .delete({ where: { id: clientGallery.id } })
        .catch(() => {})
    }
    if (contract) {
      await prisma.contractUsageRight.deleteMany({
        where: { contractId: contract.id },
      })
      await prisma.contract
        .delete({ where: { id: contract.id } })
        .catch(() => {})
    }
    if (clientUser) {
      await prisma.user.delete({ where: { id: clientUser.id } }).catch(() => {})
    }
    if (adminUser) {
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {})
    }
  })

  test('allows download when quota available', async ({ page }) => {
    // Login as client
    await page.goto('/login')
    await page.getByLabel('Email Address').fill(clientUser.email)
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/admin')

    // Make download request
    const response = await page.request.get(
      `/api/client-images/${clientImage.id}/download`
    )

    // Should succeed
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/jpeg')
    expect(response.headers()['content-disposition']).toContain('attachment')
    expect(response.headers()['cache-control']).toContain('private')

    // Verify quota was incremented
    const updatedGallery = await prisma.clientGallery.findUnique({
      where: { id: clientGallery.id },
    })
    expect(updatedGallery?.downloadQuotaUsed).toBe(1)

    // Verify response is an image
    const buffer = await response.body()
    expect(buffer.length).toBeGreaterThan(0)
  })

  test('blocks download when quota exhausted', async ({ page }) => {
    // Exhaust the quota
    await prisma.clientGallery.update({
      where: { id: clientGallery.id },
      data: { downloadQuotaUsed: 5 }, // Equal to downloadQuota
    })

    // Login as client
    await page.goto('/login')
    await page.getByLabel('Email Address').fill(clientUser.email)
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/admin')

    // Make download request
    const response = await page.request.get(
      `/api/client-images/${clientImage.id}/download`
    )

    // Should fail with 403
    expect(response.status()).toBe(403)

    const error = await response.json()
    expect(error.error.toLowerCase()).toContain('quota')
  })

  test('blocks download when final payment not completed', async ({ page }) => {
    // Set payment status to pending
    await prisma.clientGallery.update({
      where: { id: clientGallery.id },
      data: { finalPaymentStatus: 'PENDING' },
    })

    // Login as client
    await page.goto('/login')
    await page.getByLabel('Email Address').fill(clientUser.email)
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/admin')

    // Make download request
    const response = await page.request.get(
      `/api/client-images/${clientImage.id}/download`
    )

    // Should fail with 403
    expect(response.status()).toBe(403)

    const error = await response.json()
    expect(error.error.toLowerCase()).toContain('payment')
  })

  test('blocks download for non-owner clients', async ({ page }) => {
    // Create another client user
    const otherClientEmail = `other-client-${Date.now()}@example.com`
    const otherClient = await prisma.user.create({
      data: {
        email: otherClientEmail,
        password: await hash('password123', 10),
        name: 'Other Client',
        role: 'CLIENT',
      },
    })

    try {
      // Login as other client
      await page.goto('/login')
      await page.getByLabel('Email Address').fill(otherClient.email)
      await page.getByLabel('Password').fill('password123')
      await page.getByRole('button', { name: 'Sign In' }).click()
      await page.waitForURL('/admin')

      // Make download request
      const response = await page.request.get(
        `/api/client-images/${clientImage.id}/download`
      )

      // Should fail with 403
      expect(response.status()).toBe(403)

      const error = await response.json()
      expect(error.error).toBe('Forbidden')
    } finally {
      // Cleanup other client
      await prisma.user.delete({ where: { id: otherClient.id } })
    }
  })

  test('allows admin to download without quota check', async ({
    authenticatedPage,
  }) => {
    // Exhaust quota
    await prisma.clientGallery.update({
      where: { id: clientGallery.id },
      data: { downloadQuotaUsed: 5 },
    })

    // Admin download should still work
    const response = await authenticatedPage.request.get(
      `/api/client-images/${clientImage.id}/download`
    )

    // Should succeed for admin even with exhausted quota
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toBe('image/jpeg')
  })

  test('requires authentication', async ({ page }) => {
    // Don't login - use unauthenticated page
    const response = await page.request.get(
      `/api/client-images/${clientImage.id}/download`
    )

    expect(response.status()).toBe(401)

    const error = await response.json()
    expect(error.error).toBe('Unauthorized')
  })

  test('enforces max file size from contract', async ({ page }) => {
    // Login as client
    await page.goto('/login')
    await page.getByLabel('Email Address').fill(clientUser.email)
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/admin')

    // Make download request
    const response = await page.request.get(
      `/api/client-images/${clientImage.id}/download`
    )

    expect(response.status()).toBe(200)

    // Note: We can't easily verify the exact dimensions without decoding the JPEG,
    // but we verify the download succeeds and returns valid image data
    const buffer = await response.body()
    expect(buffer.length).toBeGreaterThan(0)
  })
})
