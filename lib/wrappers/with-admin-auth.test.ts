// ABOUTME: Unit tests for withAdminAuth — reads ctx.actorRole, never re-calls auth()
// ABOUTME: Verifies 401/403/pass-through paths and chain-introspection metadata

import { describe, it, expect, vi } from 'vitest'
import { makeCtx, makeReq } from '@/tests/fixtures/wrappers'

vi.mock('@/auth', () => ({
  auth: vi.fn(async () => {
    throw new Error(
      'withAdminAuth must NOT call auth() — read ctx.actorRole instead (D-02)'
    )
  }),
}))

describe('withAdminAuth', () => {
  it('returns 401 UNAUTHORIZED when ctx.actorId is null', async () => {
    const { withAdminAuth } = await import('./with-admin-auth')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withAdminAuth(inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/admin/x'),
      makeCtx({ actorId: null, actorRole: null })
    )
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ error: 'Unauthorized', code: 'UNAUTHORIZED' })
    expect(inner).not.toHaveBeenCalled()
  })

  it('returns 403 FORBIDDEN when actorId set but role is not ADMIN', async () => {
    const { withAdminAuth } = await import('./with-admin-auth')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withAdminAuth(inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/admin/x'),
      makeCtx({ actorId: 'user-1', actorRole: 'CLIENT' })
    )
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body).toEqual({ error: 'Forbidden', code: 'FORBIDDEN' })
    expect(inner).not.toHaveBeenCalled()
  })

  it('calls handler when actorRole === ADMIN', async () => {
    const { withAdminAuth } = await import('./with-admin-auth')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withAdminAuth(inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/admin/x'),
      makeCtx({ actorId: 'admin-1', actorRole: 'ADMIN' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
  })

  it('NEVER calls auth() — reads ctx exclusively', async () => {
    const authMod = await import('@/auth')
    const { withAdminAuth } = await import('./with-admin-auth')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withAdminAuth(inner)
    await handler(
      makeReq('POST', 'https://luna.test/api/admin/x'),
      makeCtx({ actorId: 'admin-1', actorRole: 'ADMIN' })
    )
    expect(authMod.auth).not.toHaveBeenCalled()
  })

  it('attaches __wrapperKind and __wrappedHandler back-pointer', async () => {
    const { withAdminAuth, WRAPPER_KIND_ADMIN_AUTH } = await import(
      './with-admin-auth'
    )
    const inner = async () => new Response('ok')
    const wrapped = withAdminAuth(inner) as unknown as {
      __wrapperKind: symbol
      __wrappedHandler: typeof inner
    }
    expect(wrapped.__wrapperKind).toBe(WRAPPER_KIND_ADMIN_AUTH)
    expect(wrapped.__wrapperKind).toBe(Symbol.for('luna.withAdminAuth'))
    expect(wrapped.__wrappedHandler).toBe(inner)
  })
})
