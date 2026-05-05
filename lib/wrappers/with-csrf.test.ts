// ABOUTME: Unit tests for withCsrf — origin-header check vs env.NEXT_PUBLIC_APP_URL
// ABOUTME: Bypasses safe methods; 403s on mismatch; logs to pino on failure

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeCtx, makeReq } from '@/tests/fixtures/wrappers'

vi.mock('@/lib/env', () => ({
  env: { NEXT_PUBLIC_APP_URL: 'https://luna.test' },
}))

const warnSpy = vi.fn()
vi.mock('@/lib/logger', () => ({
  logger: { warn: (...args: unknown[]) => warnSpy(...args) },
}))

beforeEach(() => {
  warnSpy.mockClear()
})

describe('withCsrf', () => {
  it('bypasses GET requests', async () => {
    const { withCsrf } = await import('./with-csrf')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withCsrf(inner)
    const res = await handler(
      makeReq('GET', 'https://luna.test/api/x'),
      makeCtx({ method: 'GET' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
  })

  it('bypasses HEAD requests', async () => {
    const { withCsrf } = await import('./with-csrf')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withCsrf(inner)
    const res = await handler(
      makeReq('HEAD', 'https://luna.test/api/x'),
      makeCtx({ method: 'HEAD' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
  })

  it('bypasses OPTIONS requests', async () => {
    const { withCsrf } = await import('./with-csrf')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withCsrf(inner)
    const res = await handler(
      makeReq('OPTIONS', 'https://luna.test/api/x'),
      makeCtx({ method: 'OPTIONS' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
  })

  it('calls handler on POST when origin matches', async () => {
    const { withCsrf } = await import('./with-csrf')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withCsrf(inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/x', {
        headers: { origin: 'https://luna.test' },
      }),
      makeCtx({ method: 'POST' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
  })

  it('returns 403 on POST when origin mismatches', async () => {
    const { withCsrf } = await import('./with-csrf')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withCsrf(inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/x', {
        headers: { origin: 'https://attacker.example' },
      }),
      makeCtx({ method: 'POST' })
    )
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({ error: 'csrf_origin_mismatch', code: 'FORBIDDEN' })
    expect(inner).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledOnce()
    const [meta, msg] = warnSpy.mock.calls[0]
    expect(msg).toBe('csrf.origin_mismatch')
    expect(meta).toMatchObject({
      origin: 'https://attacker.example',
      expected: 'https://luna.test',
    })
  })

  it('returns 403 when origin header is absent on POST', async () => {
    const { withCsrf } = await import('./with-csrf')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withCsrf(inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/x'),
      makeCtx({ method: 'POST' })
    )
    expect(res.status).toBe(403)
    expect(inner).not.toHaveBeenCalled()
  })

  it('attaches __wrapperKind and __wrappedHandler back-pointer', async () => {
    const { withCsrf, WRAPPER_KIND_CSRF } = await import('./with-csrf')
    const inner = async () => new Response('ok')
    const wrapped = withCsrf(inner) as unknown as {
      __wrapperKind: symbol
      __wrappedHandler: typeof inner
    }
    expect(wrapped.__wrapperKind).toBe(WRAPPER_KIND_CSRF)
    expect(wrapped.__wrapperKind).toBe(Symbol.for('luna.withCsrf'))
    expect(wrapped.__wrappedHandler).toBe(inner)
  })
})
