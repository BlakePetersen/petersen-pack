// ABOUTME: Unit tests for env schema validation — required vars, defaults, enum constraints
// ABOUTME: Uses vi.stubEnv + dynamic import to exercise createEnv at module load

import { describe, it, expect, vi, afterEach } from 'vitest'

const VALID_ENV = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/luna',
  DIRECT_URL: 'postgresql://user:pass@localhost:5432/luna',
  AUTH_SECRET: 'a'.repeat(32),
  STRIPE_SECRET_KEY: 'sk_test_abcdef',
  RESEND_API_KEY: 're_test_abcdef',
  FROM_EMAIL: 'hello@luna.test',
  NEXT_PUBLIC_APP_URL: 'https://luna.test',
  UPSTASH_REDIS_REST_URL: 'https://example-upstash.upstash.io',
  UPSTASH_REDIS_REST_TOKEN: 'a'.repeat(32),
  SKIP_ENV_VALIDATION: '0',
} as const

function stubAll(extra: Record<string, string | undefined> = {}) {
  vi.resetModules()
  for (const [k, v] of Object.entries({ ...VALID_ENV, ...extra })) {
    if (v === undefined) vi.stubEnv(k, '')
    else vi.stubEnv(k, v)
  }
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('env schema', () => {
  it('accepts a valid env set and exposes typed fields', async () => {
    stubAll()
    const { env } = await import('./env')
    expect(env.DATABASE_URL).toBe(VALID_ENV.DATABASE_URL)
    expect(env.AUTH_SECRET).toBe(VALID_ENV.AUTH_SECRET)
    expect(env.LOG_LEVEL).toBe('info') // default
    expect(env.LOG_PRETTY).toBe('0') // default
    expect(env.NEXT_PUBLIC_APP_URL).toBe(VALID_ENV.NEXT_PUBLIC_APP_URL)
  })

  it('rejects missing AUTH_SECRET with readable error', async () => {
    stubAll({ AUTH_SECRET: '' })
    await expect(import('./env')).rejects.toThrow(/AUTH_SECRET/)
  })

  it('rejects malformed DATABASE_URL', async () => {
    stubAll({ DATABASE_URL: 'not-a-url' })
    await expect(import('./env')).rejects.toThrow(/DATABASE_URL/)
  })

  it('rejects AUTH_SECRET under 32 characters', async () => {
    stubAll({ AUTH_SECRET: 'short' })
    await expect(import('./env')).rejects.toThrow(/AUTH_SECRET/)
  })

  it('rejects STRIPE_SECRET_KEY not starting with sk_', async () => {
    stubAll({ STRIPE_SECRET_KEY: 'pk_oops' })
    await expect(import('./env')).rejects.toThrow(/STRIPE_SECRET_KEY/)
  })

  it('rejects LOG_LEVEL outside enum', async () => {
    stubAll({ LOG_LEVEL: 'verbose' })
    await expect(import('./env')).rejects.toThrow(/LOG_LEVEL/)
  })

  it('allows SENTRY_DSN to be absent', async () => {
    stubAll({ SENTRY_DSN: undefined })
    const { env } = await import('./env')
    expect(env.SENTRY_DSN).toBeUndefined()
  })

  it('accepts LOG_PRETTY=1 as valid enum value', async () => {
    stubAll({ LOG_PRETTY: '1' })
    const { env } = await import('./env')
    expect(env.LOG_PRETTY).toBe('1')
  })
})
