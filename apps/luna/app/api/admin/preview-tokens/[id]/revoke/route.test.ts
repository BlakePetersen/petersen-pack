// ABOUTME: SEC-06 contract — POST /api/admin/preview-tokens/[id]/revoke
// ABOUTME: Asserts auth gate, CSRF, happy path (revokedAt + audit row in tx), idempotent re-revoke

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

const previewTokenFindUnique = vi.fn()
const previewTokenUpdate = vi.fn()
const auditLogCreate = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    previewToken: {
      findUnique: (...a: unknown[]) => previewTokenFindUnique(...a),
      update: (...a: unknown[]) => previewTokenUpdate(...a),
    },
    auditLog: {
      create: (...a: unknown[]) => auditLogCreate(...a),
    },
    // Pass-through transaction — feed callers a `tx` whose model accessors are
    // the same vi.fn references so we can assert calls happened "inside" tx.
    $transaction: async (
      cb: (tx: unknown) => Promise<unknown>
    ): Promise<unknown> => {
      const tx = {
        previewToken: { update: previewTokenUpdate },
        auditLog: { create: auditLogCreate },
      }
      return cb(tx)
    },
    $disconnect: vi.fn(async () => {}),
  },
}))

import { POST } from './route'

const ROUTE = 'http://localhost:3000/api/admin/preview-tokens/tok_1/revoke'
const ORIGIN = 'http://localhost:3000'

function buildRequest(): NextRequest {
  return new NextRequest(ROUTE, {
    method: 'POST',
    headers: { origin: ORIGIN },
  })
}

function paramsFor(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

describe('POST /api/admin/preview-tokens/[id]/revoke — SEC-06', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const res = await POST(buildRequest(), paramsFor('tok_1'))
    expect(res.status).toBe(401)
    expect(previewTokenUpdate).not.toHaveBeenCalled()
    expect(auditLogCreate).not.toHaveBeenCalled()
  })

  it('returns 403 for non-admin (CLIENT) session', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'u1', role: 'CLIENT', email: 'c@example.test' },
    } as never)
    const res = await POST(buildRequest(), paramsFor('tok_1'))
    expect(res.status).toBe(403)
    expect(previewTokenUpdate).not.toHaveBeenCalled()
  })

  it('returns 403 when origin header missing (CSRF)', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin1', role: 'ADMIN', email: 'a@example.test' },
    } as never)
    const req = new NextRequest(ROUTE, { method: 'POST' })
    const res = await POST(req, paramsFor('tok_1'))
    expect(res.status).toBe(403)
    expect(previewTokenUpdate).not.toHaveBeenCalled()
  })

  it('returns 404 when token id is unknown', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin1', role: 'ADMIN', email: 'a@example.test' },
    } as never)
    previewTokenFindUnique.mockResolvedValue(null)
    const res = await POST(buildRequest(), paramsFor('missing'))
    expect(res.status).toBe(404)
    expect(previewTokenUpdate).not.toHaveBeenCalled()
  })

  it('happy path: sets revokedAt and writes audit row in same tx', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin1', role: 'ADMIN', email: 'a@example.test' },
    } as never)
    const now = new Date('2026-04-27T12:00:00Z')
    previewTokenFindUnique.mockResolvedValue({
      id: 'tok_1',
      resourceType: 'gallery',
      resourceId: 'gal_1',
      revokedAt: null,
    })
    previewTokenUpdate.mockResolvedValue({
      id: 'tok_1',
      revokedAt: now,
    })
    auditLogCreate.mockResolvedValue({ id: 'audit_1' })

    const res = await POST(buildRequest(), paramsFor('tok_1'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.revokedAt).toBeTruthy()

    expect(previewTokenUpdate).toHaveBeenCalledWith({
      where: { id: 'tok_1' },
      data: { revokedAt: expect.any(Date) },
    })
    expect(auditLogCreate).toHaveBeenCalledOnce()
    const auditCall = auditLogCreate.mock.calls[0][0]
    expect(auditCall.data.action).toBe('preview_token.revoke')
    expect(auditCall.data.resourceId).toBe('tok_1')
  })

  it('idempotent: second revoke skips update + audit, returns original revokedAt', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin1', role: 'ADMIN', email: 'a@example.test' },
    } as never)
    const earlier = new Date('2026-04-26T08:00:00Z')
    previewTokenFindUnique.mockResolvedValue({
      id: 'tok_1',
      resourceType: 'gallery',
      resourceId: 'gal_1',
      revokedAt: earlier,
    })

    const res = await POST(buildRequest(), paramsFor('tok_1'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.alreadyRevoked).toBe(true)
    expect(new Date(body.revokedAt).toISOString()).toBe(earlier.toISOString())
    expect(previewTokenUpdate).not.toHaveBeenCalled()
    expect(auditLogCreate).not.toHaveBeenCalled()
  })
})
