// ABOUTME: Unit tests for withClientAuth — gates on any non-null ctx.actorId
// ABOUTME: Per-resource role checks live in handlers (lib/api-auth.ts::requireGalleryAccess)

import { describe, it, expect, vi } from 'vitest'
import { makeCtx, makeReq } from '@/tests/fixtures/wrappers'

describe('withClientAuth', () => {
  it('returns 401 UNAUTHORIZED when ctx.actorId is null', async () => {
    const { withClientAuth } = await import('./with-client-auth')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withClientAuth(inner)
    const res = await handler(
      makeReq('GET', 'https://luna.test/api/client/x'),
      makeCtx({ actorId: null })
    )
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
    expect(inner).not.toHaveBeenCalled()
  })

  it('calls handler when actorId is set, regardless of role', async () => {
    const { withClientAuth } = await import('./with-client-auth')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withClientAuth(inner)
    const res = await handler(
      makeReq('GET', 'https://luna.test/api/client/x'),
      makeCtx({ actorId: 'user-1', actorRole: 'CLIENT' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
  })

  it('also calls handler for ADMIN role (admins are clients too)', async () => {
    const { withClientAuth } = await import('./with-client-auth')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withClientAuth(inner)
    const res = await handler(
      makeReq('GET', 'https://luna.test/api/client/x'),
      makeCtx({ actorId: 'admin-1', actorRole: 'ADMIN' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
  })

  it('attaches __wrapperKind and __wrappedHandler back-pointer', async () => {
    const { withClientAuth, WRAPPER_KIND_CLIENT_AUTH } =
      await import('./with-client-auth')
    const inner = async () => new Response('ok')
    const wrapped = withClientAuth(inner) as unknown as {
      __wrapperKind: symbol
      __wrappedHandler: typeof inner
    }
    expect(wrapped.__wrapperKind).toBe(WRAPPER_KIND_CLIENT_AUTH)
    expect(wrapped.__wrapperKind).toBe(Symbol.for('luna.withClientAuth'))
    expect(wrapped.__wrappedHandler).toBe(inner)
  })
})
