// ABOUTME: Unit tests for getPreviewToken — SEC-06 revocation filter
// ABOUTME: Asserts revoked rows return null; happy-path lookup includes revokedAt:null filter

import { describe, it, expect, vi, beforeEach } from 'vitest'

const findFirst = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    previewToken: { findFirst: (...a: unknown[]) => findFirst(...a) },
    $disconnect: vi.fn(async () => {}),
  },
}))

import {
  generatePreviewToken,
  getExpiryDate,
  getPreviewToken,
} from './preview-tokens'

describe('lib/preview-tokens', () => {
  describe('generatePreviewToken', () => {
    it('returns a 64-char hex string (32 random bytes)', () => {
      const t = generatePreviewToken()
      expect(t).toMatch(/^[0-9a-f]{64}$/)
    })
    it('returns distinct tokens across calls', () => {
      const a = generatePreviewToken()
      const b = generatePreviewToken()
      expect(a).not.toBe(b)
    })
  })

  describe('getExpiryDate', () => {
    it('returns +1h for "1h"', () => {
      const before = Date.now()
      const exp = getExpiryDate('1h').getTime()
      expect(exp - before).toBeGreaterThanOrEqual(60 * 60 * 1000 - 50)
      expect(exp - before).toBeLessThan(60 * 60 * 1000 + 50)
    })
    it('defaults to +24h for unknown input', () => {
      const before = Date.now()
      const exp = getExpiryDate('garbage').getTime()
      expect(exp - before).toBeGreaterThan(23 * 60 * 60 * 1000)
    })
  })

  describe('getPreviewToken — SEC-06 revocation', () => {
    beforeEach(() => {
      findFirst.mockReset()
    })

    it('queries with revokedAt: null and expiresAt > now()', async () => {
      findFirst.mockResolvedValue({
        id: 'tok_1',
        token: 'abc',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      })
      const result = await getPreviewToken('abc')
      expect(result).toBeTruthy()
      expect(findFirst).toHaveBeenCalledOnce()
      const args = findFirst.mock.calls[0][0]
      expect(args.where.revokedAt).toBeNull()
      expect(args.where.token).toBe('abc')
      expect(args.where.expiresAt).toMatchObject({ gt: expect.any(Date) })
    })

    it('returns null when prisma rejects revoked row (revokedAt filter excludes it)', async () => {
      // Simulate the DB filter: a revoked row would fail the WHERE, so findFirst
      // returns null. The point of this assertion is "callers that previously
      // received a row will now get null" — same shape, different meaning.
      findFirst.mockResolvedValue(null)
      const result = await getPreviewToken('revoked_token')
      expect(result).toBeNull()
    })

    it('returns null for expired token (expiresAt > now() filter)', async () => {
      findFirst.mockResolvedValue(null)
      const result = await getPreviewToken('expired_token')
      expect(result).toBeNull()
    })
  })
})
