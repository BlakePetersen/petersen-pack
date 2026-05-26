// ABOUTME: Sentry Next.js server init with pino breadcrumb integration
// ABOUTME: Only active when env.SENTRY_DSN is set; enables logs + 10% trace sampling

import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'

// Strip common PII from event payloads before they reach Sentry. Pino's
// redact list handles structured logs, but Sentry captures exception
// message/stack and request data independently — so an error like
// `new Error("Failed to email jane@doe.com")` would leak verbatim.
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

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    enableLogs: true,
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.pinoIntegration({
        log: { levels: ['info', 'warn', 'error', 'fatal'] },
        error: { levels: ['error', 'fatal'] },
      }),
    ],
    beforeSend(event) {
      return scrubPii(event)
    },
  })
}
