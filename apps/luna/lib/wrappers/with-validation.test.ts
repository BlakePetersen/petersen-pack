// ABOUTME: Unit tests for withValidation — Zod parse → 400 or forward typed body
// ABOUTME: Verifies error shape matches lib/api-error.ts VALIDATION_ERROR contract

import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { makeCtx, makeReq } from '@/tests/fixtures/wrappers'

const Schema = z.object({
  name: z.string().min(1),
  age: z.number().int().nonnegative(),
})

describe('withValidation', () => {
  it('forwards parsed body as third arg on success', async () => {
    const { withValidation } = await import('./with-validation')
    type Body = z.infer<typeof Schema>
    const inner = vi.fn(
      async (_req: unknown, _ctx: unknown, _body: Body) =>
        new Response('ok', { status: 200 })
    )
    const handler = withValidation(Schema, inner)
    const req = makeReq('POST', 'https://luna.test/api/admin/x', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ashley', age: 30 }),
    })
    const ctx = makeCtx({ actorId: 'admin-1', actorRole: 'ADMIN' })
    const res = await handler(req, ctx)
    expect(res.status).toBe(200)
    expect(inner).toHaveBeenCalledOnce()
    const call = inner.mock.calls[0]
    expect(call[1]).toBe(ctx)
    expect(call[2]).toEqual({ name: 'Ashley', age: 30 })
  })

  it('returns 400 with VALIDATION_ERROR shape on parse failure', async () => {
    const { withValidation } = await import('./with-validation')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withValidation(Schema, inner)
    const req = makeReq('POST', 'https://luna.test/api/admin/x', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', age: -1 }),
    })
    const res = await handler(req, makeCtx())
    expect(res.status).toBe(400)
    expect(res.headers.get('Content-Type')).toContain('application/json')
    const json = await res.json()
    expect(json.error).toBe('Validation failed')
    expect(json.code).toBe('VALIDATION_ERROR')
    expect(json.details).toBeTypeOf('object')
    // dotted-path keys with array values
    expect(Array.isArray(json.details.name)).toBe(true)
    expect(Array.isArray(json.details.age)).toBe(true)
    expect(json.details.name.length).toBeGreaterThan(0)
    expect(inner).not.toHaveBeenCalled()
  })

  it('returns 400 with VALIDATION_ERROR when req.json() throws (empty / non-JSON body)', async () => {
    const { withValidation } = await import('./with-validation')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withValidation(Schema, inner)
    const req = makeReq('POST', 'https://luna.test/api/admin/x', {
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{{{',
    })
    const res = await handler(req, makeCtx())
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.code).toBe('VALIDATION_ERROR')
    expect(inner).not.toHaveBeenCalled()
  })

  it('uses dotted path for nested errors', async () => {
    const Nested = z.object({
      user: z.object({ email: z.string().email() }),
    })
    const { withValidation } = await import('./with-validation')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withValidation(Nested, inner)
    const req = makeReq('POST', 'https://luna.test/api/admin/x', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: { email: 'not-an-email' } }),
    })
    const res = await handler(req, makeCtx())
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.details['user.email']).toBeDefined()
    expect(Array.isArray(json.details['user.email'])).toBe(true)
  })

  it('uses <root> key when issue.path is empty', async () => {
    // A schema that fails at the root (e.g., expecting object, given string)
    const Strict = z.object({ name: z.string() })
    const { withValidation } = await import('./with-validation')
    const inner = vi.fn(async () => new Response('ok'))
    const handler = withValidation(Strict, inner)
    const req = makeReq('POST', 'https://luna.test/api/admin/x', {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('a string, not an object'),
    })
    const res = await handler(req, makeCtx())
    expect(res.status).toBe(400)
    const json = await res.json()
    // Either '<root>' key or some non-empty details map
    const keys = Object.keys(json.details)
    expect(keys.length).toBeGreaterThan(0)
    // At least one of the keys should be '<root>' since the failure is at the
    // top level (Zod issue.path === [])
    expect(keys).toContain('<root>')
  })

  it('attaches __wrapperKind === Symbol.for("luna.withValidation") and __wrappedHandler back-pointer', async () => {
    const { withValidation, WRAPPER_KIND_VALIDATION } =
      await import('./with-validation')
    const inner = async () => new Response('ok')
    const wrapped = withValidation(Schema, inner) as unknown as {
      __wrapperKind: symbol
      __wrappedHandler: typeof inner
    }
    expect(wrapped.__wrapperKind).toBe(WRAPPER_KIND_VALIDATION)
    expect(wrapped.__wrapperKind).toBe(Symbol.for('luna.withValidation'))
    expect(wrapped.__wrappedHandler).toBe(inner)
  })
})
