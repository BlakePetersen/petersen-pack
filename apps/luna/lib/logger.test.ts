// ABOUTME: Unit tests for pino logger — redaction, serializers, ALS mixin, JSON format
// ABOUTME: Uses pino test transport (memory stream) to capture emitted lines

import { describe, it, expect, vi } from 'vitest'
import { Writable } from 'node:stream'
import pino from 'pino'
import type { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: vi.fn().mockResolvedValue(null) }))
vi.mock('@/lib/env', () => ({
  env: { LOG_LEVEL: 'trace', LOG_PRETTY: '0', SENTRY_DSN: undefined },
}))

// Import logger factory after mocking. We import the module-level builder to
// construct a test instance pointed at an in-memory writable stream.
// To keep the production lib/logger.ts clean, we duplicate the config shape
// here by importing the shared helpers.
import { buildLoggerOptions } from './logger'
import { withRequestContext } from './request-context'

function createTestLogger(): { logger: pino.Logger; lines: string[] } {
  const lines: string[] = []
  const stream = new Writable({
    write(chunk, _enc, cb) {
      lines.push(String(chunk))
      cb()
    },
  })
  const logger = pino(buildLoggerOptions(), stream)
  return { logger, lines }
}

describe('logger', () => {
  it('emits single-line JSON containing level, time, msg', () => {
    const { logger, lines } = createTestLogger()
    logger.info({ userId: 'u_1' }, 'test.event')
    const parsed = JSON.parse(lines.pop()!)
    expect(parsed.msg).toBe('test.event')
    expect(parsed.level).toBeDefined()
    expect(parsed.time).toBeDefined()
    expect(parsed.userId).toBe('u_1')
  })

  it('redacts password, token, authorization, cookie in nested paths', () => {
    const { logger, lines } = createTestLogger()
    logger.info(
      {
        password: 'secret',
        token: 'abc',
        nested: { authorization: 'Bearer x', cookie: 'sid=123' },
      },
      'redact.test'
    )
    const parsed = JSON.parse(lines.pop()!)
    expect(parsed.password).toBe('[REDACTED]')
    expect(parsed.token).toBe('[REDACTED]')
    expect(parsed.nested.authorization).toBe('[REDACTED]')
    expect(parsed.nested.cookie).toBe('[REDACTED]')
  })

  it('redacts PII fields three levels deep (request.body.form shape)', () => {
    const { logger, lines } = createTestLogger()
    logger.info(
      {
        req: {
          body: {
            form: {
              email: 'leak@example.com',
              password: 'plain',
              phone: '555-0100',
            },
          },
        },
      },
      'redact.deep'
    )
    const parsed = JSON.parse(lines.pop()!)
    expect(parsed.req.body.form.email).toBe('[REDACTED]')
    expect(parsed.req.body.form.password).toBe('[REDACTED]')
    expect(parsed.req.body.form.phone).toBe('[REDACTED]')
  })

  it('user serializer strips email + password, keeps id/role/createdAt', () => {
    const { logger, lines } = createTestLogger()
    logger.info(
      {
        user: {
          id: 'u_1',
          email: 'leak@example.com',
          password: 'plain-text',
          role: 'ADMIN',
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
      },
      'user.serialize'
    )
    const parsed = JSON.parse(lines.pop()!)
    expect(parsed.user.id).toBe('u_1')
    expect(parsed.user.role).toBe('ADMIN')
    expect(parsed.user.email).toBeUndefined()
    expect(parsed.user.password).toBeUndefined()
  })

  it('mixin pulls requestId from ALS when called inside withRequestContext', async () => {
    const { logger, lines } = createTestLogger()
    const req = new Request('https://example.com/')
    let capturedRequestId: string | undefined
    const h: (req: NextRequest) => Promise<Response> = async () => {
      logger.info('from-within-als')
      const parsed = JSON.parse(lines.pop()!)
      capturedRequestId = parsed.requestId
      return new Response()
    }
    await withRequestContext(h)(req as unknown as NextRequest)
    expect(capturedRequestId).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  })

  it('mixin emits no requestId when called outside withRequestContext', () => {
    const { logger, lines } = createTestLogger()
    logger.info('outside-als')
    const parsed = JSON.parse(lines.pop()!)
    expect(parsed.requestId).toBeUndefined()
  })
})
