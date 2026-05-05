// ABOUTME: Unit tests for seedPageRequestContext — Server Component ALS seed helper
// ABOUTME: Verifies getRequestContext() observes a populated ctx inside the render callback

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Simulate Vercel runtime so x-forwarded-for is trusted.
beforeEach(() => {
  process.env.VERCEL = '1'
})
afterEach(() => {
  delete process.env.VERCEL
})

// next/headers returns a Promise<ReadonlyHeaders> in Next 16.
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(
    new Headers({
      'x-vercel-id': 'vercel-xyz-123',
      'x-forwarded-for': '198.51.100.9, 10.0.0.1',
      'user-agent': 'vitest-ssr/1.0',
      'x-pathname': '/admin',
    })
  ),
}))
vi.mock('@/lib/auth', () => ({ auth: vi.fn().mockResolvedValue(null) }))

describe('seedPageRequestContext', () => {
  it('wraps the render callback in an ALS scope with a populated context', async () => {
    const { seedPageRequestContext } = await import('./request-context.page')
    const { getRequestContext } = await import('./request-context')

    const observed = await seedPageRequestContext(() => {
      return getRequestContext()
    })

    expect(observed).toBeDefined()
    expect(observed!.requestId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
    expect(observed!.correlationId).toBe('vercel-xyz-123')
    expect(observed!.ip).toBe('198.51.100.9')
    expect(observed!.ua).toBe('vitest-ssr/1.0')
    expect(observed!.path).toBe('/admin')
    expect(observed!.method).toBe('GET')
    expect(observed!.tenant).toBe('ashley')
    expect(observed!.actorId).toBeNull()
    expect(observed!.actorRole).toBeNull()
  })

  it('passes through the render callback return value', async () => {
    const { seedPageRequestContext } = await import('./request-context.page')
    const result = await seedPageRequestContext(() => 'rendered')
    expect(result).toBe('rendered')
  })

  it('shares the same als instance as withRequestContext (Node seed point)', async () => {
    const { seedPageRequestContext } = await import('./request-context.page')
    const { getRequestContext } = await import('./request-context')
    const captured = await seedPageRequestContext(() => getRequestContext())
    expect(captured).toBeDefined()
  })
})
