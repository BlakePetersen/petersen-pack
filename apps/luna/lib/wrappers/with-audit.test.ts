// ABOUTME: Unit tests for withAudit — curried action validator + chain tag (D-10)
// ABOUTME: Verifies the wrapper writes nothing and only tags the chain for TST-07

import { describe, it, expect, vi } from 'vitest'
import { makeCtx, makeReq } from '@/tests/fixtures/wrappers'

describe('withAudit', () => {
  it('returns wrapped handler that calls inner once and forwards response', async () => {
    const { withAudit } = await import('./with-audit')
    const inner = vi.fn(async () => new Response('ok', { status: 200 }))
    const handler = withAudit('contract.create', inner)
    const res = await handler(
      makeReq('POST', 'https://luna.test/api/admin/contracts'),
      makeCtx({ actorId: 'admin-1', actorRole: 'ADMIN' })
    )
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
  })

  it('forwards req and ctx to inner handler unchanged', async () => {
    const { withAudit } = await import('./with-audit')
    const inner = vi.fn(async () => new Response('ok'))
    const req = makeReq('POST', 'https://luna.test/api/admin/x')
    const ctx = makeCtx({ actorId: 'admin-99', actorRole: 'ADMIN' })
    await withAudit('gallery.publish', inner)(req, ctx)
    expect(inner).toHaveBeenCalledWith(req, ctx)
  })

  it('attaches __wrapperKind === Symbol.for("luna.withAudit") and __wrappedHandler back-pointer', async () => {
    const { withAudit, WRAPPER_KIND_AUDIT } = await import('./with-audit')
    const inner = async () => new Response('ok')
    const wrapped = withAudit('booking.convert_inquiry', inner) as unknown as {
      __wrapperKind: symbol
      __wrappedHandler: typeof inner
    }
    expect(wrapped.__wrapperKind).toBe(WRAPPER_KIND_AUDIT)
    expect(wrapped.__wrapperKind).toBe(Symbol.for('luna.withAudit'))
    expect(wrapped.__wrappedHandler).toBe(inner)
  })

  it('exposes the action string on the wrapped handler for TST-07 introspection', async () => {
    const { withAudit } = await import('./with-audit')
    const inner = async () => new Response('ok')
    const wrapped = withAudit('contract.create', inner) as unknown as {
      __auditAction: string
    }
    expect(wrapped.__auditAction).toBe('contract.create')
  })

  it('throws at construction time on uppercase action', async () => {
    const { withAudit } = await import('./with-audit')
    expect(() =>
      withAudit('Contract.Create', async () => new Response('ok'))
    ).toThrow(/invalid action/i)
  })

  it('throws at construction time when action is missing the dot separator', async () => {
    const { withAudit } = await import('./with-audit')
    expect(() =>
      withAudit('contractcreate', async () => new Response('ok'))
    ).toThrow(/invalid action/i)
  })

  it('throws at construction time when verb half is empty', async () => {
    const { withAudit } = await import('./with-audit')
    expect(() =>
      withAudit('contract.', async () => new Response('ok'))
    ).toThrow(/invalid action/i)
  })

  it('throws at construction time when resource half is empty', async () => {
    const { withAudit } = await import('./with-audit')
    expect(() => withAudit('.create', async () => new Response('ok'))).toThrow(
      /invalid action/i
    )
  })

  it('accepts snake_case in either half (e.g. booking.convert_inquiry)', async () => {
    const { withAudit } = await import('./with-audit')
    expect(() =>
      withAudit('booking.convert_inquiry', async () => new Response('ok'))
    ).not.toThrow()
    expect(() =>
      withAudit('client_gallery.archive', async () => new Response('ok'))
    ).not.toThrow()
  })
})
