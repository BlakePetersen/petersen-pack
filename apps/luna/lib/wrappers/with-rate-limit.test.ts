// ABOUTME: Unit tests for withRateLimit — admin (120/min/actorId) + anon (60/min/ip) tiers
// ABOUTME: Verifies 429 headers, fail-open on Upstash error (D-07), and chain metadata

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeCtx, makeReq } from '@/tests/fixtures/wrappers'

const limitMock = vi.fn()

vi.mock('@upstash/ratelimit', () => {
  class FakeRatelimit {
    static slidingWindow = vi.fn((n: number, w: string) => ({
      kind: 'sw',
      n,
      w,
    }))
    public limit: typeof limitMock
    constructor(_opts: unknown) {
      this.limit = limitMock
    }
  }
  return { Ratelimit: FakeRatelimit }
})

vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: vi.fn(() => ({ tag: 'fake-redis' })) },
}))

const warnSpy = vi.fn()
vi.mock('@/lib/logger', () => ({
  logger: { warn: (...args: unknown[]) => warnSpy(...args) },
}))

beforeEach(() => {
  limitMock.mockReset()
  warnSpy.mockClear()
})

describe('withRateLimit', () => {
  it('calls handler when limiter returns success', async () => {
    limitMock.mockResolvedValueOnce({
      success: true,
      limit: 120,
      remaining: 119,
      reset: Date.now() + 60_000,
    })
    const { withRateLimit } = await import('./with-rate-limit')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withRateLimit('admin', inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/admin/x'),
      makeCtx({ actorId: 'admin-1', actorRole: 'ADMIN' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
    expect(limitMock).toHaveBeenCalledWith('admin-1')
  })

  it('returns 429 with rate-limit headers when limiter denies', async () => {
    const reset = Date.now() + 30_000
    limitMock.mockResolvedValueOnce({
      success: false,
      limit: 120,
      remaining: 0,
      reset,
    })
    const { withRateLimit } = await import('./with-rate-limit')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withRateLimit('admin', inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/admin/x'),
      makeCtx({ actorId: 'admin-1', actorRole: 'ADMIN' })
    )
    expect(res.status).toBe(429)
    expect(inner).not.toHaveBeenCalled()
    const retryAfter = Number(res.headers.get('Retry-After'))
    expect(retryAfter).toBeGreaterThanOrEqual(1)
    expect(retryAfter).toBeLessThanOrEqual(31)
    expect(res.headers.get('X-RateLimit-Limit')).toBe('120')
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(res.headers.get('X-RateLimit-Reset')).toBe(
      String(Math.ceil(reset / 1000))
    )
    const body = await res.json()
    expect(body.error).toBe('rate_limited')
    expect(body.retryAfter).toBeGreaterThanOrEqual(1)
  })

  it('keys admin tier on ctx.actorId when present', async () => {
    limitMock.mockResolvedValueOnce({
      success: true,
      limit: 120,
      remaining: 119,
      reset: Date.now() + 60_000,
    })
    const { withRateLimit } = await import('./with-rate-limit')
    const inner = vi.fn(async () => new Response('ok'))
    await withRateLimit('admin', inner)(
      makeReq('POST', 'https://luna.test/api/admin/x'),
      makeCtx({ actorId: 'admin-42', actorRole: 'ADMIN' })
    )
    expect(limitMock).toHaveBeenCalledWith('admin-42')
  })

  it('falls back to ip:<ip> for admin tier when actorId is null', async () => {
    limitMock.mockResolvedValueOnce({
      success: true,
      limit: 120,
      remaining: 119,
      reset: Date.now() + 60_000,
    })
    const { withRateLimit } = await import('./with-rate-limit')
    const inner = vi.fn(async () => new Response('ok'))
    await withRateLimit('admin', inner)(
      makeReq('POST', 'https://luna.test/api/admin/x'),
      makeCtx({ actorId: null, ip: '203.0.113.7' })
    )
    expect(limitMock).toHaveBeenCalledWith('ip:203.0.113.7')
  })

  it('keys anon tier on ip:<ip> regardless of actorId', async () => {
    limitMock.mockResolvedValueOnce({
      success: true,
      limit: 60,
      remaining: 59,
      reset: Date.now() + 60_000,
    })
    const { withRateLimit } = await import('./with-rate-limit')
    const inner = vi.fn(async () => new Response('ok'))
    await withRateLimit('anon', inner)(
      makeReq('POST', 'https://luna.test/api/contact'),
      makeCtx({ actorId: 'user-1', ip: '198.51.100.9' })
    )
    expect(limitMock).toHaveBeenCalledWith('ip:198.51.100.9')
  })

  it('fails open when limiter throws — calls handler and logs warn (D-07)', async () => {
    limitMock.mockRejectedValueOnce(new Error('upstash boom'))
    const { withRateLimit } = await import('./with-rate-limit')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withRateLimit('admin', inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/admin/x'),
      makeCtx({ actorId: 'admin-1', actorRole: 'ADMIN' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
    expect(warnSpy).toHaveBeenCalledOnce()
    const [meta, msg] = warnSpy.mock.calls[0]
    expect(msg).toBe('rate_limit.upstash_unavailable')
    expect(meta).toMatchObject({ tier: 'admin', key: 'admin-1' })
    expect(meta.err).toBeInstanceOf(Error)
  })

  it('attaches __wrapperKind and __wrappedHandler back-pointer', async () => {
    const { withRateLimit, WRAPPER_KIND_RATE_LIMIT } = await import(
      './with-rate-limit'
    )
    const inner = async () => new Response('ok')
    const wrapped = withRateLimit('admin', inner) as unknown as {
      __wrapperKind: symbol
      __wrappedHandler: typeof inner
    }
    expect(wrapped.__wrapperKind).toBe(WRAPPER_KIND_RATE_LIMIT)
    expect(wrapped.__wrapperKind).toBe(Symbol.for('luna.withRateLimit'))
    expect(wrapped.__wrappedHandler).toBe(inner)
  })
})
