import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

vi.mock('@/auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    contract: {
      create: vi.fn(),
    },
    usageRight: {
      findMany: vi.fn(),
    },
  },
}))

describe('POST /api/admin/contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates contract when admin authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any)

    vi.mocked(prisma.usageRight.findMany).mockResolvedValue([
      { id: 'usage-1', price: 0 },
    ] as any)

    vi.mocked(prisma.contract.create).mockResolvedValue({
      id: 'contract-1',
      status: 'DRAFT',
    } as any)

    const request = new NextRequest(
      'http://localhost:3000/api/admin/contracts',
      {
        method: 'POST',
        body: JSON.stringify({
          clientId: 'client-1',
          shootType: 'Wedding',
          shootDate: '2025-06-15',
          shootLocation: 'Central Park',
          sessionDuration: '4 hours',
          deliverablesDescription: '200 edited photos',
          totalAmount: 250000,
          depositAmount: 125000,
          retouchesIncluded: 10,
          pricePerExtraRetouch: 10000,
          downloadQuota: 50,
          maxFileSizePx: 4000,
          usageRightIds: ['usage-1'],
        }),
      }
    )

    const response = await POST(request)
    expect(response.status).toBe(201)
  })

  it('rejects unauthenticated requests', async () => {
    vi.mocked(auth).mockResolvedValue(null as any)

    const request = new NextRequest(
      'http://localhost:3000/api/admin/contracts',
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    )

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
