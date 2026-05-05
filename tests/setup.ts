// ABOUTME: Vitest global setup — load .env.test, mock externals
// ABOUTME: D-18: dedicated Postgres test DB; NextAuth/Stripe/Resend/Cloudinary mocked at boundary

import { config } from 'dotenv'
import { afterAll } from 'vitest'

// Load .env.test BEFORE any code that reads process.env (e.g. lib/env.ts).
// Migrations are applied separately via `pnpm test:migrate` before the suite runs;
// this keeps the test process from spawning child shells (per project security guard).
config({ path: '.env.test' })

afterAll(async () => {
  const { prisma } = await import('@/lib/prisma')
  await prisma.$disconnect()
})
