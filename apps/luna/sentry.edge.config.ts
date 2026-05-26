// ABOUTME: Sentry Next.js edge runtime init
// ABOUTME: Covers legacy Edge routes; no pino (proxy.ts is Node in Next 16)

import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  })
}
