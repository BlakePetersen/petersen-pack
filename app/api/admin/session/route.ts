// ABOUTME: Admin session check GET — composed wrapper chain per SEC-07
// ABOUTME: DEVIATION — no withAdminAuth (returns { isAdmin: false } for non-admins, not 401);
// ABOUTME: client UI relies on this shape. Uses 'anon' rate-limit tier since unauthed callers reach it.

import { NextResponse } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import { withRateLimit } from '@/lib/wrappers'

export const GET = withRequestContext(
  withRateLimit('anon', async (_req, ctx) => {
    if (ctx.actorRole !== 'ADMIN' || !ctx.actorId) {
      return NextResponse.json({ isAdmin: false })
    }
    return NextResponse.json({
      isAdmin: true,
      userId: ctx.actorId,
    })
  })
)
