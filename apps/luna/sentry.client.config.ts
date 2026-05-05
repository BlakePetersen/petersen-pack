// ABOUTME: Sentry Next.js client (browser) init
// ABOUTME: Captures React render + client-side errors; no pino (browser)

import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'

const dsn = env.NEXT_PUBLIC_SENTRY_DSN

// Mirror of sentry.server.config.ts's scrubPii — emails from error
// messages and auth headers off request objects. Keeps PII out of the
// Sentry payload even when a thrown Error stringifies a user-provided value.
const EMAIL_RE = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g

function scrubPii<
  T extends {
    message?: string
    request?: { headers?: Record<string, unknown> }
  },
>(event: T): T {
  if (event.message) {
    event.message = event.message.replace(EMAIL_RE, '[email]')
  }
  const headers = event.request?.headers
  if (headers) {
    delete headers.authorization
    delete headers.Authorization
    delete headers.cookie
    delete headers.Cookie
  }
  return event
}

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      return scrubPii(event)
    },
  })
}
