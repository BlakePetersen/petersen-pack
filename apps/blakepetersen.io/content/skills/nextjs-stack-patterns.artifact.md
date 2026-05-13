---
name: Next.js Stack Patterns Starter
description: Working NextAuth v5 + Prisma + shadcn scaffold for an email-OTP allowlist app — drop-in, runs against a Postgres connection string and a Resend API key.
type: skill
merge: replace
destination: .claude/skills/nextjs-stack-patterns.md
---

# Next.js Stack Patterns

Reference scaffold for a single-tier Next.js App Router app: email-OTP auth on an allowlist, Prisma against Postgres, shadcn/ui for components. Every file below is the production shape — no placeholders, no `// TODO: implement`.

## `auth.ts`

```ts
// auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyOtp } from '@/lib/otp'

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        code: { label: 'Code', type: 'text' }
      },
      authorize: async raw => {
        const email = typeof raw?.email === 'string' ? raw.email : null
        const code = typeof raw?.code === 'string' ? raw.code : null
        if (!email || !code) return null
        const user = await verifyOtp(email, code)
        return user ?? null
      }
    })
  ],
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email
      return token
    },
    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string
      return session
    }
  }
})
```

Mount the handlers at `app/api/auth/[...nextauth]/route.ts`:

```ts
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from '@/auth'
```

## `lib/prisma.ts`

```ts
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

## `lib/otp.ts`

```ts
// lib/otp.ts
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { sendOtpEmail } from './email'

const OTP_TTL_MS = 10 * 60 * 1000

function hashEmail(email: string) {
  return bcrypt.hash(email.trim().toLowerCase(), 10)
}

async function emailHashMatches(plain: string, hash: string) {
  return bcrypt.compare(plain.trim().toLowerCase(), hash)
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function requestOtp(email: string) {
  const allow = await prisma.allowedEmail.findMany()
  let allowed: (typeof allow)[number] | null = null
  for (const row of allow) {
    if (await emailHashMatches(email, row.emailHash)) {
      allowed = row
      break
    }
  }
  if (!allowed) return // silent — no information leak

  const code = generateCode()
  const codeHash = await bcrypt.hash(code, 10)
  await prisma.otpCode.create({
    data: {
      emailHash: allowed.emailHash,
      code: codeHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS)
    }
  })
  await sendOtpEmail(email, code)
}

export async function verifyOtp(email: string, code: string) {
  const allow = await prisma.allowedEmail.findMany()
  let allowed: (typeof allow)[number] | null = null
  for (const row of allow) {
    if (await emailHashMatches(email, row.emailHash)) {
      allowed = row
      break
    }
  }
  if (!allowed) return null

  const candidates = await prisma.otpCode.findMany({
    where: {
      emailHash: allowed.emailHash,
      used: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  })

  for (const row of candidates) {
    if (await bcrypt.compare(code, row.code)) {
      await prisma.otpCode.update({
        where: { id: row.id },
        data: { used: true }
      })
      return { id: allowed.id, email: email.trim().toLowerCase() }
    }
  }
  return null
}

export async function addAllowedEmail(
  email: string,
  label: string,
  addedBy: string
) {
  const emailHash = await hashEmail(email)
  return prisma.allowedEmail.create({
    data: { emailHash, label, addedBy }
  })
}
```

## `lib/email.ts`

```ts
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendOtpEmail(to: string, code: string) {
  return resend.emails.send({
    from: 'login@example.com',
    to,
    subject: `Your sign-in code: ${code}`,
    text: `Your sign-in code is ${code}. It expires in 10 minutes.`
  })
}
```

## `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AllowedEmail {
  id        String   @id @default(cuid())
  emailHash String   @unique
  label     String?
  addedBy   String
  createdAt DateTime @default(now())
}

model OtpCode {
  id        String   @id @default(cuid())
  emailHash String
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([emailHash])
}
```

## `middleware.ts`

```ts
// middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth(req => {
  const path = req.nextUrl.pathname
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/verify')
  if (!req.auth && !isAuthRoute) {
    const signIn = new URL('/login', req.nextUrl)
    signIn.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(signIn)
  }
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)']
}
```

## `app/(auth)/login/page.tsx`

```tsx
// app/(auth)/login/page.tsx
'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    await fetch('/api/otp/request', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
    const verify = new URLSearchParams({ email })
    const cb = search.get('callbackUrl')
    if (cb) verify.set('callbackUrl', cb)
    router.push(`/verify?${verify.toString()}`)
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={pending}>
        Send code
      </button>
    </form>
  )
}
```

## `app/api/otp/request/route.ts`

```ts
// app/api/otp/request/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requestOtp } from '@/lib/otp'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (typeof email !== 'string') return NextResponse.json({}, { status: 400 })
  await requestOtp(email)
  return NextResponse.json({ ok: true })
}
```

## `components.json` (shadcn)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

## Setup

```bash
pnpm add next-auth@beta @prisma/client bcryptjs resend
pnpm add -D prisma @types/bcryptjs

# .env.local
# DATABASE_URL=postgres://...
# AUTH_SECRET=$(openssl rand -base64 32)
# RESEND_API_KEY=re_...

pnpm prisma migrate dev --name init
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input card dialog form
```

Seed the first allowlist entry from a one-shot script:

```ts
// scripts/seed-admin.ts
import { addAllowedEmail } from '@/lib/otp'
await addAllowedEmail(process.argv[2], 'admin', 'bootstrap')
```

Run with `pnpm tsx scripts/seed-admin.ts you@example.com` after migrations. Subsequent admins are added through the protected `/admin` route.
