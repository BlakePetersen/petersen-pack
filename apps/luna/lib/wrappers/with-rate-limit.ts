// ABOUTME: Distributed rate limiter (SEC-01) — admin/anon tiers via @upstash/ratelimit
// ABOUTME: Self-tags via __wrapperKind; fail-open on Upstash error per CONTEXT D-07

import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/lib/request-context'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

export const WRAPPER_KIND_RATE_LIMIT = Symbol.for('luna.withRateLimit')

type Handler = (req: NextRequest, ctx: RequestContext) => Promise<Response>
type Tier = 'admin' | 'anon'

// Module-scope ephemeral cache survives warm Fluid Compute invocations and
// blunts cache stampede when the limiter is hit by parallel requests for the
// same identity within a single isolate (RESEARCH §"Pitfall 5").
const cache = new Map<string, { success: boolean; pending: Promise<unknown> }>()
const redis = Redis.fromEnv()

const limiters: Record<Tier, Ratelimit> = {
  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, '60 s'),
    ephemeralCache: cache as unknown as Map<string, number>,
    prefix: 'luna:rl:admin',
    analytics: true,
  }),
  anon: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '60 s'),
    ephemeralCache: cache as unknown as Map<string, number>,
    prefix: 'luna:rl:anon',
    analytics: true,
  }),
}

function identityFor(tier: Tier, ctx: RequestContext): string {
  if (tier === 'admin' && ctx.actorId) return ctx.actorId
  return `ip:${ctx.ip}`
}

export function withRateLimit(tier: Tier, handler: Handler): Handler {
  const wrapped: Handler = async (req, ctx) => {
    const identity = identityFor(tier, ctx)
    try {
      const { success, limit, remaining, reset } =
        await limiters[tier].limit(identity)
      if (!success) {
        const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
        return new Response(
          JSON.stringify({ error: 'rate_limited', retryAfter }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(retryAfter),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': String(remaining),
              'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
            },
          }
        )
      }
    } catch (err) {
      // Fail-open per CONTEXT D-07: a Redis blip should not take down the
      // admin panel. logger.warn fires a Sentry breadcrumb; OBS-02 surfaces
      // the outage on /api/health.
      logger.warn(
        { err, key: identity, tier },
        'rate_limit.upstash_unavailable'
      )
    }
    return handler(req, ctx)
  }
  ;(wrapped as unknown as { __wrapperKind: symbol }).__wrapperKind =
    WRAPPER_KIND_RATE_LIMIT
  ;(wrapped as unknown as { __wrappedHandler: Handler }).__wrappedHandler =
    handler
  return wrapped
}
