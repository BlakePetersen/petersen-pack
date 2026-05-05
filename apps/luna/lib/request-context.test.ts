// ABOUTME: Unit tests for AsyncLocalStorage request context + ULID generator
// ABOUTME: Covers monotonicity, ALS propagation, correlationId extraction, actor snapshot

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { NextRequest } from 'next/server'

const { authMock } = vi.hoisted(() => ({
  authMock: vi.fn().mockResolvedValue(null),
}))
vi.mock('@/lib/auth', () => ({ auth: authMock }))

import {
  newRequestId,
  getRequestContext,
  withRequestContext,
} from './request-context'

// Simulate Vercel runtime so x-forwarded-for is trusted.
// (Untrusted-proxy behavior is asserted separately below.)
beforeEach(() => {
  process.env.VERCEL = '1'
})
afterEach(() => {
  delete process.env.VERCEL
})

type Handler = (req: NextRequest) => Promise<Response>

describe('newRequestId', () => {
  it('returns 26-char Crockford-base32 string', () => {
    const id = newRequestId()
    expect(id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  })

  it('generates 1000 unique IDs in the same invocation burst', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 1000; i++) ids.add(newRequestId())
    expect(ids.size).toBe(1000)
  })

  it('sorts lexically in monotonic order', () => {
    const ids = Array.from({ length: 100 }, () => newRequestId())
    const sorted = [...ids].sort()
    expect(sorted).toEqual(ids)
  })
})

describe('getRequestContext', () => {
  it('returns undefined outside an ALS scope', () => {
    expect(getRequestContext()).toBeUndefined()
  })
})

describe('withRequestContext', () => {
  it('seeds ALS so getRequestContext() returns the context inside the handler', async () => {
    const mockReq = new Request('https://example.com/api/test', {
      method: 'POST',
      headers: {
        'x-vercel-id': 'vercel-abc-123',
        'x-forwarded-for': '203.0.113.5, 10.0.0.1',
        'user-agent': 'vitest/1.0',
      },
    })
    let observed: ReturnType<typeof getRequestContext>
    const handler: Handler = async () => {
      observed = getRequestContext()
      return new Response('ok')
    }
    const wrapped = withRequestContext(handler)
    await wrapped(mockReq as unknown as NextRequest)
    expect(observed).toBeDefined()
    expect(observed!.requestId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
    expect(observed!.correlationId).toBe('vercel-abc-123')
    expect(observed!.ip).toBe('203.0.113.5')
    expect(observed!.ua).toBe('vitest/1.0')
    expect(observed!.tenant).toBe('ashley')
    expect(observed!.method).toBe('POST')
    expect(observed!.path).toBe('/api/test')
  })

  it('falls back through x-vercel-id → x-request-id → null', async () => {
    const reqWithRequestId = new Request('https://example.com/', {
      headers: { 'x-request-id': 'req-xyz' },
    })
    let observed: ReturnType<typeof getRequestContext>
    const h1: Handler = async () => {
      observed = getRequestContext()
      return new Response()
    }
    await withRequestContext(h1)(reqWithRequestId as unknown as NextRequest)
    expect(observed!.correlationId).toBe('req-xyz')

    const reqNoId = new Request('https://example.com/')
    let observed2: ReturnType<typeof getRequestContext>
    const h2: Handler = async () => {
      observed2 = getRequestContext()
      return new Response()
    }
    await withRequestContext(h2)(reqNoId as unknown as NextRequest)
    expect(observed2!.correlationId).toBeNull()
  })

  it('actor snapshot is {actorId, actorRole, actorEmail}, never full User', async () => {
    const req = new Request('https://example.com/')
    let observed: ReturnType<typeof getRequestContext>
    const h: Handler = async () => {
      observed = getRequestContext()
      return new Response()
    }
    await withRequestContext(h)(req as unknown as NextRequest)
    expect(observed).toHaveProperty('actorId')
    expect(observed).toHaveProperty('actorRole')
    expect(observed).toHaveProperty('actorEmail')
    expect(observed).not.toHaveProperty('user')
    expect(observed).not.toHaveProperty('actor')
  })

  it('actorEmail defaults to null when there is no session', async () => {
    authMock.mockResolvedValueOnce(null)
    const req = new Request('https://example.com/')
    let observed: ReturnType<typeof getRequestContext>
    const h: Handler = async () => {
      observed = getRequestContext()
      return new Response()
    }
    await withRequestContext(h)(req as unknown as NextRequest)
    expect(observed!.actorEmail).toBeNull()
    expect(observed!.actorId).toBeNull()
    expect(observed!.actorRole).toBeNull()
  })

  it('actorEmail is seeded from session.user.email when authenticated', async () => {
    authMock.mockResolvedValueOnce({
      user: { id: 'u_1', role: 'ADMIN', email: 'admin@example.com' },
    })
    const req = new Request('https://example.com/')
    let observed: ReturnType<typeof getRequestContext>
    const h: Handler = async () => {
      observed = getRequestContext()
      return new Response()
    }
    await withRequestContext(h)(req as unknown as NextRequest)
    expect(observed!.actorEmail).toBe('admin@example.com')
    expect(observed!.actorId).toBe('u_1')
    expect(observed!.actorRole).toBe('ADMIN')
  })

  it('actorEmail is null when auth() throws', async () => {
    authMock.mockRejectedValueOnce(new Error('boom'))
    const req = new Request('https://example.com/')
    let observed: ReturnType<typeof getRequestContext>
    const h: Handler = async () => {
      observed = getRequestContext()
      return new Response()
    }
    await withRequestContext(h)(req as unknown as NextRequest)
    expect(observed!.actorEmail).toBeNull()
    expect(observed!.actorId).toBeNull()
    expect(observed!.actorRole).toBeNull()
  })

  it('ignores x-forwarded-for when VERCEL env is not set (untrusted proxy)', async () => {
    delete process.env.VERCEL
    const req = new Request('https://example.com/', {
      headers: {
        'x-forwarded-for': '203.0.113.5',
        'x-real-ip': '198.51.100.9',
      },
    })
    let observed: ReturnType<typeof getRequestContext>
    const h: Handler = async () => {
      observed = getRequestContext()
      return new Response()
    }
    await withRequestContext(h)(req as unknown as NextRequest)
    // Falls through to x-real-ip; forwarded header is treated as spoofable.
    expect(observed!.ip).toBe('198.51.100.9')
  })

  it('ip falls back to x-real-ip then unknown when x-forwarded-for absent', async () => {
    const reqRealIp = new Request('https://example.com/', {
      headers: { 'x-real-ip': '198.51.100.9' },
    })
    let observed: ReturnType<typeof getRequestContext>
    const h1: Handler = async () => {
      observed = getRequestContext()
      return new Response()
    }
    await withRequestContext(h1)(reqRealIp as unknown as NextRequest)
    expect(observed!.ip).toBe('198.51.100.9')

    const reqNoIp = new Request('https://example.com/')
    let observed2: ReturnType<typeof getRequestContext>
    const h2: Handler = async () => {
      observed2 = getRequestContext()
      return new Response()
    }
    await withRequestContext(h2)(reqNoIp as unknown as NextRequest)
    expect(observed2!.ip).toBe('unknown')
  })
})
