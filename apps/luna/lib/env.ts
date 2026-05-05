// ABOUTME: Build-time env var validation via @t3-oss/env-nextjs + Zod 4
// ABOUTME: Fails build on missing/malformed vars before runtime

import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // Core — revenue path (required)
    DATABASE_URL: z.url(),
    DIRECT_URL: z.url(),
    AUTH_SECRET: z.string().min(32),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    RESEND_API_KEY: z.string().startsWith('re_'),
    FROM_EMAIL: z.email(),
    ADMIN_EMAIL: z.email().optional(),

    // Core — optional now, may tighten in Phase 2
    STRIPE_WEBHOOK_SECRET: z.string().optional(), // becomes required in Phase 2 SEC-08
    CLOUDINARY_URL: z.url().optional(),
    BLOB_READ_WRITE_TOKEN: z.string().optional(),
    LUNA_READ_WRITE_TOKEN: z.string().optional(),
    OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
    REPLICATE_API_TOKEN: z.string().startsWith('r8_').optional(),
    INSTAGRAM_ACCESS_TOKEN: z.string().optional(),

    // Observability (consumed by P1.2)
    SENTRY_DSN: z.url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .default('info'),
    LOG_PRETTY: z.enum(['0', '1']).default('0'),

    // PLT-11 spike (consumed by P1.5 on feature branch only)
    FIELD_ENCRYPTION_KEY: z.string().optional(),

    // Upstash Redis — distributed rate limiter (SEC-01, P2.2a)
    // Required: withRateLimit cannot construct limiters without these and
    // every admin route would lose protection. Fail-fast at build time.
    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(20),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  emptyStringAsUndefined: true,
  onValidationError: (issues) => {
    const details = issues
      .map((i) => `${i.path?.join('.') ?? '<root>'}: ${i.message}`)
      .join('; ')
    throw new Error(`Invalid environment variables — ${details}`)
  },
})
