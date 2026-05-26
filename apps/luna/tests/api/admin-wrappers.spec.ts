// ABOUTME: TST-07 cross-cutting admin route contract test (D-15..D-17)
// ABOUTME: Globs app/api/admin/**/route.ts; introspects wrapper chain; asserts contracts

import { describe, test, expect, beforeEach } from 'vitest'
import { glob } from 'glob'
import path from 'node:path'
import { resetTransactionalTables } from '../fixtures/db'
import {
  inspectWrapperChain,
  type WrapperKind,
} from '@/lib/wrappers/chain-introspection'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
const ALL_METHODS: Method[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const MUTATION_METHODS: Method[] = ['POST', 'PUT', 'PATCH', 'DELETE']

describe.sequential('TST-07: admin route wrapper contracts', () => {
  const adminRoutePaths = glob.sync('app/api/admin/**/route.ts', {
    absolute: true,
  })

  beforeEach(async () => {
    await resetTransactionalTables()
  })

  test('discovered at least 30 admin route files', () => {
    expect(adminRoutePaths.length).toBeGreaterThanOrEqual(30)
  })

  for (const routePath of adminRoutePaths) {
    const relPath = path.relative(process.cwd(), routePath)

    describe(relPath, () => {
      test('every exported HTTP method has the expected wrapper chain', async () => {
        const mod = await import(routePath)
        for (const method of ALL_METHODS) {
          const handler = mod[method]
          if (!handler) continue
          const chain = inspectWrapperChain(handler)

          // Every admin route — regardless of method — must have rate limit + admin auth.
          expect(
            chain.has('rateLimit'),
            `${relPath} ${method} missing withRateLimit`
          ).toBe(true)
          expect(
            chain.has('adminAuth'),
            `${relPath} ${method} missing withAdminAuth`
          ).toBe(true)

          if (MUTATION_METHODS.includes(method)) {
            // Mutations: + csrf + audit
            expect(
              chain.has('csrf'),
              `${relPath} ${method} missing withCsrf`
            ).toBe(true)
            expect(
              chain.has('audit'),
              `${relPath} ${method} missing withAudit`
            ).toBe(true)
          } else {
            // GET: must NOT have csrf or audit (D-09: reads not audited; method gate makes csrf moot)
            expect(
              chain.has('csrf'),
              `${relPath} ${method} unexpectedly has withCsrf`
            ).toBe(false)
            expect(
              chain.has('audit'),
              `${relPath} ${method} unexpectedly has withAudit (D-09: reads not audited)`
            ).toBe(false)
          }
        }
      })
    })
  }
})
