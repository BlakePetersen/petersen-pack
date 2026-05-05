// ABOUTME: Synthetic chain helpers for unit-testing wrappers in isolation
// ABOUTME: Direct ctx injection per CONTEXT D-02 — no ALS seeding required

import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/lib/request-context'

export function makeCtx(
  overrides: Partial<RequestContext> = {}
): RequestContext {
  return {
    requestId: '01HQZX0000000000000000000A',
    correlationId: null,
    actorId: null,
    actorRole: null,
    actorEmail: null,
    ip: '127.0.0.1',
    ua: 'vitest',
    path: '/api/test',
    method: 'POST',
    startedAt: Date.now(),
    tenant: 'ashley',
    ...overrides,
  }
}

export function makeReq(
  method: string,
  url: string,
  init: { headers?: Record<string, string>; body?: string } = {}
): NextRequest {
  const headers = new Headers(init.headers ?? {})
  const req = new Request(url, { method, headers, body: init.body })
  return req as unknown as NextRequest
}

export type Handler = (
  req: NextRequest,
  ctx: RequestContext
) => Promise<Response>

export async function callChain(
  handler: Handler,
  req: NextRequest,
  ctx: RequestContext = makeCtx()
): Promise<Response> {
  return handler(req, ctx)
}
