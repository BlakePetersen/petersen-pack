// ABOUTME: Structured logger (pino on Node) — singleton with ALS mixin + PII redaction
// ABOUTME: Edge consumers should import from './logger.edge' — this file is Node-only

import pino, { type Logger, type LoggerOptions } from 'pino'
import { env } from '@/lib/env'
import { getRequestContext } from '@/lib/request-context'

type UserLike = {
  id?: string
  role?: string
  createdAt?: Date | string
}

type ClientGalleryLike = {
  id?: string
  slug?: string
  status?: string
}

type ContractLike = {
  id?: string
  status?: string
  createdAt?: Date | string
}

type InquiryLike = {
  id?: string
  status?: string
  createdAt?: Date | string
}

export function buildLoggerOptions(): LoggerOptions {
  return {
    level: env.LOG_LEVEL,
    redact: {
      // pino/fast-redact doesn't support ** globs — wildcards only match a
      // single level. Cover root + 2 and 3-level-deep request-body shapes
      // (e.g. body.form.email) explicitly so nested PII doesn't slip past.
      paths: [
        'password',
        '*.password',
        '*.*.password',
        '*.*.*.password',
        'token',
        '*.token',
        '*.*.token',
        '*.*.*.token',
        'authorization',
        '*.authorization',
        '*.*.authorization',
        '*.*.*.authorization',
        'cookie',
        '*.cookie',
        '*.*.cookie',
        '*.*.*.cookie',
        'email',
        '*.email',
        '*.*.email',
        '*.*.*.email',
        'phone',
        '*.phone',
        '*.*.phone',
        '*.*.*.phone',
      ],
      censor: '[REDACTED]',
    },
    serializers: {
      user: (u: UserLike | null | undefined) =>
        u && { id: u.id, role: u.role, createdAt: u.createdAt },
      clientGallery: (g: ClientGalleryLike | null | undefined) =>
        g && { id: g.id, slug: g.slug, status: g.status },
      contract: (c: ContractLike | null | undefined) =>
        c && { id: c.id, status: c.status, createdAt: c.createdAt },
      inquiry: (i: InquiryLike | null | undefined) =>
        i && { id: i.id, status: i.status, createdAt: i.createdAt },
    },
    mixin: () => {
      const ctx = getRequestContext()
      if (!ctx) return {}
      return {
        requestId: ctx.requestId,
        correlationId: ctx.correlationId,
        actorId: ctx.actorId,
      }
    },
  }
}

function createLogger(): Logger {
  const opts = buildLoggerOptions()
  if (env.LOG_PRETTY === '1') {
    return pino({
      ...opts,
      transport: { target: 'pino-pretty', options: { colorize: true } },
    })
  }
  return pino(opts)
}

const globalForLogger = globalThis as unknown as {
  logger: Logger | undefined
}

export const logger: Logger = globalForLogger.logger ?? createLogger()

if (process.env.NODE_ENV !== 'production') globalForLogger.logger = logger
