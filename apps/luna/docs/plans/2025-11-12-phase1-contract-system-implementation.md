# Phase 1: Core Contract System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the foundational contract system enabling Ashley to create, send, and have clients sign contracts with deposit payments via Stripe.

**Architecture:** Multi-step admin form for contract creation, client-facing signature page with Stripe Checkout integration, Prisma database models for contracts/payments/usage rights, and email notifications using existing email infrastructure.

**Tech Stack:** Next.js 15, Prisma, PostgreSQL, Stripe, TypeScript, Tailwind CSS, React Hook Form, Zod validation

---

## Task 1: Database Schema Migration

**Files:**

- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/`

**Step 1: Add Contract model to schema**

Edit `prisma/schema.prisma`, add after `HomepageContent` model:

```prisma
model Contract {
  id                      String            @id @default(cuid())
  clientId                String
  inquiryId               String?
  bookingId               String?

  // Shoot details
  shootType               String
  shootDate               DateTime
  shootLocation           String
  sessionDuration         String
  deliverablesDescription String            @db.Text

  // Pricing
  totalAmount             Int               // In cents
  depositAmount           Int               // In cents
  retouchesIncluded       Int
  pricePerExtraRetouch    Int               // In cents
  downloadQuota           Int
  maxFileSizePx           Int

  // Signature
  signedAt                DateTime?
  signatureType           String?           // TYPED or DRAWN
  signatureData           String?           @db.Text
  signatureIpAddress      String?
  signedPdfUrl            String?

  // Status
  status                  ContractStatus    @default(DRAFT)
  sentAt                  DateTime?
  expiresAt               DateTime?

  createdAt               DateTime          @default(now())
  updatedAt               DateTime          @updatedAt

  client                  User              @relation(fields: [clientId], references: [id])
  payments                Payment[]
  usageRights             ContractUsageRight[]
  clientGalleries         ClientGallery[]

  @@index([clientId])
  @@index([status])
}

enum ContractStatus {
  DRAFT
  SENT
  SIGNED
  EXPIRED
}
```

**Step 2: Add UsageRight and ContractUsageRight models**

Continue in `prisma/schema.prisma`:

```prisma
model UsageRight {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String   @db.Text
  price       Int      // In cents
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  contracts   ContractUsageRight[]

  @@index([sortOrder])
  @@index([isActive])
}

model ContractUsageRight {
  contractId     String
  usageRightId   String

  contract       Contract    @relation(fields: [contractId], references: [id], onDelete: Cascade)
  usageRight     UsageRight  @relation(fields: [usageRightId], references: [id], onDelete: Cascade)

  @@id([contractId, usageRightId])
  @@index([contractId])
  @@index([usageRightId])
}
```

**Step 3: Add Payment model**

```prisma
model Payment {
  id                    String         @id @default(cuid())
  contractId            String
  clientGalleryId       String?

  type                  PaymentType
  amount                Int            // In cents
  status                PaymentStatus  @default(PENDING)

  stripePaymentIntentId String?        @unique
  stripeReceiptUrl      String?

  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt

  contract              Contract       @relation(fields: [contractId], references: [id])

  @@index([contractId])
  @@index([status])
  @@index([type])
}

enum PaymentType {
  DEPOSIT
  FINAL_BALANCE
  EXTRA_RETOUCHES
  ADDITIONAL_DOWNLOADS
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}
```

**Step 4: Add ContractTemplate model**

```prisma
model ContractTemplate {
  id          String   @id @default(cuid())
  section     String   @unique
  content     String   @db.Text
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([sortOrder])
  @@index([isActive])
}
```

**Step 5: Update ClientGallery model**

Find the `ClientGallery` model and add these fields before the closing brace:

```prisma
  contractId            String?
  downloadQuotaUsed     Int               @default(0)
  finalPaymentStatus    PaymentStatus?

  contract              Contract?         @relation(fields: [contractId], references: [id])
```

**Step 6: Update User model**

Find the `User` model and add this relation:

```prisma
  contracts       Contract[]
```

**Step 7: Generate and run migration**

```bash
pnpm prisma migrate dev --name add_contract_payment_system
```

Expected: Migration created successfully, database updated

**Step 8: Verify migration**

```bash
pnpm prisma studio
```

Expected: Open Prisma Studio and verify new models exist: Contract, UsageRight, Payment, ContractTemplate

**Step 9: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add contract and payment database schema

- Add Contract model with pricing and signature fields
- Add UsageRight and ContractUsageRight for tiered licensing
- Add Payment model for Stripe integration
- Add ContractTemplate for reusable boilerplate
- Update ClientGallery with contract link and quota tracking

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Seed Default Usage Rights

**Files:**

- Create: `prisma/seed-usage-rights.ts`
- Modify: `package.json`

**Step 1: Create seed script**

Create `prisma/seed-usage-rights.ts`:

```typescript
// ABOUTME: Seeds default usage rights tiers for contracts
// ABOUTME: Run with: pnpm prisma db seed

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultUsageRights = [
  {
    name: 'Personal Use Only',
    slug: 'personal-use',
    description:
      'Images may be used for personal purposes only. No commercial use, advertising, or resale permitted.',
    price: 0,
    sortOrder: 1,
  },
  {
    name: 'Social Media & Web',
    slug: 'social-media-web',
    description:
      'Personal use plus permission to post on social media and personal websites.',
    price: 50000, // $500
    sortOrder: 2,
  },
  {
    name: 'Print Advertising',
    slug: 'print-advertising',
    description:
      'Personal and social media use plus print advertising (magazines, brochures, billboards).',
    price: 150000, // $1,500
    sortOrder: 3,
  },
  {
    name: 'Unlimited Commercial',
    slug: 'unlimited-commercial',
    description:
      'Full commercial rights including advertising, resale, sublicensing, and unlimited distribution.',
    price: 500000, // $5,000
    sortOrder: 4,
  },
]

async function main() {
  console.log('Seeding usage rights...')

  for (const usageRight of defaultUsageRights) {
    await prisma.usageRight.upsert({
      where: { slug: usageRight.slug },
      update: usageRight,
      create: usageRight,
    })
    console.log(`✓ ${usageRight.name}`)
  }

  console.log('Usage rights seeded successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

**Step 2: Add seed command to package.json**

In `package.json`, add to `"prisma"` section:

```json
{
  "seed": "tsx prisma/seed-usage-rights.ts"
}
```

**Step 3: Run seed**

```bash
pnpm prisma db seed
```

Expected: Output shows 4 usage rights seeded successfully

**Step 4: Verify in database**

```bash
pnpm prisma studio
```

Expected: UsageRight table has 4 records

**Step 5: Commit**

```bash
git add prisma/seed-usage-rights.ts package.json
git commit -m "feat: seed default usage rights tiers

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Contract Validation Schemas

**Files:**

- Create: `lib/validations/contract.ts`

**Step 1: Create validation schemas**

Create `lib/validations/contract.ts`:

```typescript
// ABOUTME: Zod validation schemas for contract creation and updates
// ABOUTME: Used in admin forms and API routes

import { z } from 'zod'

export const contractFormSchema = z.object({
  // Client
  clientId: z.string().min(1, 'Client is required'),
  inquiryId: z.string().optional(),
  bookingId: z.string().optional(),

  // Shoot details
  shootType: z.string().min(1, 'Shoot type is required'),
  shootDate: z.coerce.date(),
  shootLocation: z.string().min(1, 'Location is required'),
  sessionDuration: z.string().min(1, 'Duration is required'),
  deliverablesDescription: z
    .string()
    .min(1, 'Deliverables description is required'),

  // Pricing
  totalAmount: z.coerce.number().positive('Total must be positive'),
  depositAmount: z.coerce.number().positive('Deposit must be positive'),
  retouchesIncluded: z.coerce.number().int().min(0),
  pricePerExtraRetouch: z.coerce.number().int().min(0),
  downloadQuota: z.coerce
    .number()
    .int()
    .positive('Download quota must be positive'),
  maxFileSizePx: z.coerce.number().int().positive(),

  // Usage rights
  usageRightIds: z.array(z.string()).min(1, 'Select at least one usage right'),
})

export const signContractSchema = z.object({
  signatureType: z.enum(['TYPED', 'DRAWN']),
  signatureData: z.string().min(1, 'Signature is required'),
})

export type ContractFormInput = z.infer<typeof contractFormSchema>
export type SignContractInput = z.infer<typeof signContractSchema>
```

**Step 2: Commit**

```bash
git add lib/validations/contract.ts
git commit -m "feat: add contract validation schemas

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Contract Creation API Route

**Files:**

- Create: `app/api/admin/contracts/route.ts`

**Step 1: Write failing test**

Create `app/api/admin/contracts/route.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

vi.mock('@/auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    contract: {
      create: vi.fn(),
    },
    usageRight: {
      findMany: vi.fn(),
    },
  },
}))

describe('POST /api/admin/contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates contract when admin authenticated', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'admin-1', role: 'ADMIN' },
    } as any)

    vi.mocked(prisma.usageRight.findMany).mockResolvedValue([
      { id: 'usage-1', price: 0 },
    ] as any)

    vi.mocked(prisma.contract.create).mockResolvedValue({
      id: 'contract-1',
      status: 'DRAFT',
    } as any)

    const request = new NextRequest(
      'http://localhost:3000/api/admin/contracts',
      {
        method: 'POST',
        body: JSON.stringify({
          clientId: 'client-1',
          shootType: 'Wedding',
          shootDate: '2025-06-15',
          shootLocation: 'Central Park',
          sessionDuration: '4 hours',
          deliverablesDescription: '200 edited photos',
          totalAmount: 250000,
          depositAmount: 125000,
          retouchesIncluded: 10,
          pricePerExtraRetouch: 10000,
          downloadQuota: 50,
          maxFileSizePx: 4000,
          usageRightIds: ['usage-1'],
        }),
      }
    )

    const response = await POST(request)
    expect(response.status).toBe(201)
  })

  it('rejects unauthenticated requests', async () => {
    vi.mocked(auth).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/admin/contracts',
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    )

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
pnpm vitest run app/api/admin/contracts/route.test.ts
```

Expected: FAIL - module not found

**Step 3: Implement API route**

Create `app/api/admin/contracts/route.ts`:

```typescript
// ABOUTME: API route for creating contracts
// ABOUTME: Admin-only, creates contract with usage rights

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { contractFormSchema } from '@/lib/validations/contract'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = contractFormSchema.parse(body)

    // Calculate total including usage rights
    const usageRights = await prisma.usageRight.findMany({
      where: { id: { in: data.usageRightIds } },
    })

    const usageRightsTotal = usageRights.reduce((sum, ur) => sum + ur.price, 0)
    const finalTotal = data.totalAmount + usageRightsTotal

    const contract = await prisma.contract.create({
      data: {
        clientId: data.clientId,
        inquiryId: data.inquiryId,
        bookingId: data.bookingId,
        shootType: data.shootType,
        shootDate: data.shootDate,
        shootLocation: data.shootLocation,
        sessionDuration: data.sessionDuration,
        deliverablesDescription: data.deliverablesDescription,
        totalAmount: finalTotal,
        depositAmount: data.depositAmount,
        retouchesIncluded: data.retouchesIncluded,
        pricePerExtraRetouch: data.pricePerExtraRetouch,
        downloadQuota: data.downloadQuota,
        maxFileSizePx: data.maxFileSizePx,
        usageRights: {
          create: data.usageRightIds.map((id) => ({
            usageRightId: id,
          })),
        },
      },
      include: {
        usageRights: {
          include: {
            usageRight: true,
          },
        },
      },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Contract creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    )
  }
}
```

**Step 4: Run test to verify it passes**

```bash
pnpm vitest run app/api/admin/contracts/route.test.ts
```

Expected: PASS - all tests passing

**Step 5: Commit**

```bash
git add app/api/admin/contracts/
git commit -m "feat: add contract creation API endpoint

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Contract Send API Route

**Files:**

- Create: `app/api/admin/contracts/[id]/send/route.ts`
- Create: `lib/email/contract-sent.tsx`

**Step 1: Create email template**

Create `lib/email/contract-sent.tsx`:

```typescript
// ABOUTME: Email template for contract sent notification
// ABOUTME: Rendered with React Email

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface ContractSentEmailProps {
  clientName: string
  contractUrl: string
  depositAmount: number
  shootDate: string
}

export default function ContractSentEmail({
  clientName,
  contractUrl,
  depositAmount,
  shootDate,
}: ContractSentEmailProps) {
  const formattedDeposit = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(depositAmount / 100)

  return (
    <Html>
      <Head />
      <Preview>Your photography contract from Ashley Petersen is ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Photography Contract</Heading>
          <Text style={text}>Hi {clientName},</Text>
          <Text style={text}>
            Your photography contract is ready for review and signature. Please review the terms
            and sign at your earliest convenience.
          </Text>
          <Text style={text}>
            <strong>Shoot Date:</strong> {new Date(shootDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text style={text}>
            <strong>Deposit Due:</strong> {formattedDeposit}
          </Text>
          <Link href={contractUrl} style={button}>
            Review & Sign Contract
          </Link>
          <Text style={footer}>
            Questions? Reply to this email or contact Ashley directly.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 32px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
  margin: '32px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
}
```

**Step 2: Create send API route**

Create `app/api/admin/contracts/[id]/send/route.ts`:

```typescript
// ABOUTME: API route for sending contract to client
// ABOUTME: Updates status, sets expiration, sends email

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import ContractSentEmail from '@/lib/email/contract-sent'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (contract.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Contract already sent' },
        { status: 400 }
      )
    }

    // Update contract status and set expiration
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        expiresAt,
      },
    })

    // Send email
    const contractUrl = `${process.env.NEXT_PUBLIC_URL}/contract/${contract.id}`

    await resend.emails.send({
      from: 'Ashley Petersen Photography <contracts@ashleypetersenphoto.com>',
      to: contract.client.email,
      subject: 'Your Photography Contract is Ready',
      react: ContractSentEmail({
        clientName: contract.client.name || 'there',
        contractUrl,
        depositAmount: contract.depositAmount,
        shootDate: contract.shootDate.toISOString(),
      }),
    })

    return NextResponse.json(updatedContract)
  } catch (error) {
    console.error('Send contract error:', error)
    return NextResponse.json(
      { error: 'Failed to send contract' },
      { status: 500 }
    )
  }
}
```

**Step 3: Install dependencies**

```bash
pnpm add resend @react-email/components
```

**Step 4: Add environment variable**

Add to `.env.local`:

```
RESEND_API_KEY=re_your_key_here
```

**Step 5: Commit**

```bash
git add app/api/admin/contracts lib/email/contract-sent.tsx package.json pnpm-lock.yaml .env.local
git commit -m "feat: add contract send endpoint and email template

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Admin Contract Form Components

**Files:**

- Create: `components/sol/admin/ContractForm.tsx`
- Create: `app/admin/contracts/new/page.tsx`

**Step 1: Create contract form component**

Create `components/sol/admin/ContractForm.tsx`:

```typescript
// ABOUTME: Multi-step form for creating photography contracts
// ABOUTME: Steps: client, shoot details, pricing, usage rights, review

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contractFormSchema, type ContractFormInput } from '@/lib/validations/contract'

type Props = {
  clients: Array<{ id: string; name: string | null; email: string }>
  usageRights: Array<{ id: string; name: string; description: string; price: number }>
}

export default function ContractForm({ clients, usageRights }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ContractFormInput>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      maxFileSizePx: 4000,
      usageRightIds: [],
    },
  })

  const totalAmount = watch('totalAmount') || 0
  const depositAmount = watch('depositAmount') || 0
  const selectedUsageRightIds = watch('usageRightIds') || []

  const usageRightsTotal = usageRights
    .filter((ur) => selectedUsageRightIds.includes(ur.id))
    .reduce((sum, ur) => sum + ur.price, 0)

  const grandTotal = Number(totalAmount) + usageRightsTotal / 100

  const onSubmit = async (data: ContractFormInput) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          totalAmount: Math.round(data.totalAmount * 100), // Convert to cents
          depositAmount: Math.round(data.depositAmount * 100),
          pricePerExtraRetouch: Math.round(data.pricePerExtraRetouch * 100),
        }),
      })

      if (!response.ok) throw new Error('Failed to create contract')

      const contract = await response.json()
      router.push(`/admin/contracts/${contract.id}`)
    } catch (error) {
      alert('Failed to create contract')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Step 1: Client Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 1: Client Selection</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Client *
            </label>
            <select
              {...register('clientId')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name || client.email}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Shoot Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 2: Shoot Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Shoot Type *
            </label>
            <input
              {...register('shootType')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Wedding, Portrait, Corporate, etc."
            />
            {errors.shootType && (
              <p className="mt-1 text-sm text-red-600">{errors.shootType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Shoot Date *
            </label>
            <input
              type="date"
              {...register('shootDate')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            {errors.shootDate && (
              <p className="mt-1 text-sm text-red-600">{errors.shootDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location *
            </label>
            <input
              {...register('shootLocation')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Central Park, NYC"
            />
            {errors.shootLocation && (
              <p className="mt-1 text-sm text-red-600">{errors.shootLocation.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Session Duration *
            </label>
            <input
              {...register('sessionDuration')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="4 hours"
            />
            {errors.sessionDuration && (
              <p className="mt-1 text-sm text-red-600">{errors.sessionDuration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Deliverables Description *
            </label>
            <textarea
              {...register('deliverablesDescription')}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="200 professionally edited high-resolution photos..."
            />
            {errors.deliverablesDescription && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deliverablesDescription.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-lg border border-gray-300 px-6 py-2 dark:border-gray-600"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Pricing */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 3: Pricing Configuration</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Package Price *
              </label>
              <input
                type="number"
                {...register('totalAmount', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="2500"
              />
              {errors.totalAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.totalAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Deposit Amount *
              </label>
              <input
                type="number"
                {...register('depositAmount', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="1250"
              />
              {errors.depositAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.depositAmount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Retouches Included *
              </label>
              <input
                type="number"
                {...register('retouchesIncluded', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price Per Extra Retouch *
              </label>
              <input
                type="number"
                {...register('pricePerExtraRetouch', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Download Quota *
              </label>
              <input
                type="number"
                {...register('downloadQuota', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max File Size (px) *
              </label>
              <select
                {...register('maxFileSizePx', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="2000">2000px</option>
                <option value="3000">3000px</option>
                <option value="4000">4000px</option>
                <option value="6000">Original (6000px+)</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-lg border border-gray-300 px-6 py-2 dark:border-gray-600"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Usage Rights */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 4: Usage Rights</h2>

          <div className="space-y-3">
            {usageRights.map((usageRight) => (
              <label
                key={usageRight.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <input
                  type="checkbox"
                  value={usageRight.id}
                  {...register('usageRightIds')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{usageRight.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {usageRight.price === 0
                        ? 'Included'
                        : `+$${(usageRight.price / 100).toLocaleString()}`}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {usageRight.description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {errors.usageRightIds && (
            <p className="text-sm text-red-600">{errors.usageRightIds.message}</p>
          )}

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex justify-between text-lg font-semibold">
              <span>Grand Total:</span>
              <span>${grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-lg border border-gray-300 px-6 py-2 dark:border-gray-600"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 5: Review & Create</h2>

          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review the contract details before creating.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="rounded-lg border border-gray-300 px-6 py-2 dark:border-gray-600"
              disabled={isSubmitting}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Contract'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
```

**Step 2: Create admin page**

Create `app/admin/contracts/new/page.tsx`:

```typescript
// ABOUTME: Admin page for creating new contracts
// ABOUTME: Loads clients and usage rights, renders contract form

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ContractForm from '@/components/sol/admin/ContractForm'

export default async function NewContractPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const [clients, usageRights] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    prisma.usageRight.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Contract</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new photography contract for a client
        </p>
      </div>

      <ContractForm clients={clients} usageRights={usageRights} />
    </div>
  )
}
```

**Step 3: Install dependencies**

```bash
pnpm add react-hook-form @hookform/resolvers/zod
```

**Step 4: Test in browser**

```bash
pnpm dev
```

Navigate to http://localhost:3333/admin/contracts/new

Expected: Multi-step form renders, can navigate through steps

**Step 5: Commit**

```bash
git add components/sol/admin/ContractForm.tsx app/admin/contracts/new/page.tsx package.json pnpm-lock.yaml
git commit -m "feat: add admin contract creation form

Multi-step form with client selection, shoot details, pricing, and usage rights.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Next Steps

This completes the initial setup for Phase 1. The remaining tasks would include:

- Task 7: Client contract signing page
- Task 8: Signature capture component
- Task 9: Stripe deposit payment integration
- Task 10: Contract signed email template
- Task 11: Admin contract list page
- Task 12: Contract detail/status page

Would you like me to continue with the remaining tasks, or would you prefer to implement these tasks first and review?

---

## Execution Handoff

Plan saved to `docs/plans/2025-11-12-phase1-contract-system-implementation.md`.

Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
