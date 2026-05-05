# Phase 3: Final Payment & Premium Experience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable admin retouch approval, final payment processing via Stripe, premium gallery theme, and download quota enforcement.

**Architecture:** Add admin approval workflow for retouch requests, integrate Stripe for final payments, create luxury gallery theme that activates post-payment, implement download API with quota tracking and file size enforcement.

**Tech Stack:** Next.js 15, Stripe API, Sharp (image processing), Prisma, TypeScript, Playwright

---

## Task 1: Admin Retouch Approval Interface

**Files:**

- Create: `app/admin/galleries/[id]/page.tsx`
- Create: `app/api/admin/retouch-requests/[id]/approve/route.ts`
- Create: `app/api/admin/retouch-requests/[id]/decline/route.ts`
- Test: `tests/admin/retouch-approval.spec.ts`

**Step 1: Write failing test for admin viewing retouch requests**

Create `tests/admin/retouch-approval.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Admin Retouch Approval', () => {
  test('admin can view pending retouch requests', async ({ page }) => {
    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Navigate to gallery with retouch requests
    await page.goto('/admin/galleries/test-gallery-id')

    // Verify retouch requests table exists
    await expect(page.locator('h2:has-text("Retouch Requests")')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify pending request is shown
    await expect(page.locator('tr:has-text("PENDING")')).toBeVisible()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/admin/retouch-approval.spec.ts`
Expected: FAIL - "app/admin/galleries/[id]/page.tsx not found"

**Step 3: Create admin gallery detail page**

Create `app/admin/galleries/[id]/page.tsx`:

```typescript
// ABOUTME: Admin gallery detail page with retouch request approval
// ABOUTME: Shows gallery images and pending retouch requests for approval

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

export default async function AdminGalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { id } = await params

  const gallery = await prisma.clientGallery.findUnique({
    where: { id },
    include: {
      client: true,
      contract: true,
      images: {
        include: {
          retouchRequests: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!gallery) {
    notFound()
  }

  const pendingRequests = gallery.images.flatMap((img) =>
    img.retouchRequests.filter((req) => req.status === 'PENDING')
  )

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{gallery.title}</h1>

      <div className="mb-8">
        <p>Client: {gallery.client.name || gallery.client.email}</p>
        <p>Status: {gallery.status}</p>
        <p>Images: {gallery.images.length}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Retouch Requests</h2>

      {pendingRequests.length === 0 ? (
        <p>No pending retouch requests</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Image</th>
              <th className="text-left p-2">Notes</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((request) => {
              const image = gallery.images.find((img) =>
                img.retouchRequests.includes(request)
              )
              return (
                <tr key={request.id} className="border-b">
                  <td className="p-2">
                    {image && (
                      <img
                        src={image.url}
                        alt={image.altText || ''}
                        className="w-24 h-24 object-cover"
                      />
                    )}
                  </td>
                  <td className="p-2">{request.notes}</td>
                  <td className="p-2">{request.status}</td>
                  <td className="p-2">
                    <form className="flex gap-2">
                      <button
                        type="submit"
                        formAction={`/api/admin/retouch-requests/${request.id}/approve`}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                      <button
                        type="submit"
                        formAction={`/api/admin/retouch-requests/${request.id}/decline`}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Decline
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

**Step 4: Create approval API route**

Create `app/api/admin/retouch-requests/[id]/approve/route.ts`:

```typescript
// ABOUTME: API route for admin to approve retouch requests
// ABOUTME: Updates request status to APPROVED and returns updated data

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const retouchRequest = await prisma.retouchRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    })

    return NextResponse.json(retouchRequest)
  } catch (error) {
    console.error('Retouch approval error:', error)
    return NextResponse.json(
      { error: 'Failed to approve retouch request' },
      { status: 500 }
    )
  }
}
```

**Step 5: Create decline API route**

Create `app/api/admin/retouch-requests/[id]/decline/route.ts`:

```typescript
// ABOUTME: API route for admin to decline retouch requests
// ABOUTME: Deletes the retouch request from the database

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    await prisma.retouchRequest.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Retouch decline error:', error)
    return NextResponse.json(
      { error: 'Failed to decline retouch request' },
      { status: 500 }
    )
  }
}
```

**Step 6: Run test to verify it passes**

Run: `pnpm test tests/admin/retouch-approval.spec.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add app/admin/galleries/[id]/page.tsx app/api/admin/retouch-requests/[id]/approve/route.ts app/api/admin/retouch-requests/[id]/decline/route.ts tests/admin/retouch-approval.spec.ts
git commit -m "feat: add admin retouch approval interface

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Final Payment Calculation

**Files:**

- Create: `lib/calculate-final-payment.ts`
- Create: `app/api/client-galleries/[id]/final-payment-amount/route.ts`
- Test: `tests/lib/calculate-final-payment.test.ts`

**Step 1: Write failing test for payment calculation**

Create `tests/lib/calculate-final-payment.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateFinalPayment } from '@/lib/calculate-final-payment'

describe('calculateFinalPayment', () => {
  it('calculates balance with no extra retouches', () => {
    const result = calculateFinalPayment({
      totalAmount: 300000, // $3,000
      depositAmount: 150000, // $1,500
      retouchesIncluded: 10,
      retouchesUsed: 5,
      pricePerExtraRetouch: 10000, // $100
    })

    expect(result).toEqual({
      balanceRemaining: 150000,
      extraRetouches: 0,
      extraRetouchCost: 0,
      totalDue: 150000,
    })
  })

  it('calculates balance with extra retouches', () => {
    const result = calculateFinalPayment({
      totalAmount: 300000,
      depositAmount: 150000,
      retouchesIncluded: 10,
      retouchesUsed: 13, // 3 extra
      pricePerExtraRetouch: 10000,
    })

    expect(result).toEqual({
      balanceRemaining: 150000,
      extraRetouches: 3,
      extraRetouchCost: 30000, // 3 x $100
      totalDue: 180000, // $1,500 + $300
    })
  })

  it('calculates when deposit already covers balance', () => {
    const result = calculateFinalPayment({
      totalAmount: 100000,
      depositAmount: 100000,
      retouchesIncluded: 10,
      retouchesUsed: 5,
      pricePerExtraRetouch: 10000,
    })

    expect(result).toEqual({
      balanceRemaining: 0,
      extraRetouches: 0,
      extraRetouchCost: 0,
      totalDue: 0,
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest tests/lib/calculate-final-payment.test.ts`
Expected: FAIL - "lib/calculate-final-payment.ts not found"

**Step 3: Implement payment calculation logic**

Create `lib/calculate-final-payment.ts`:

```typescript
// ABOUTME: Utility for calculating final payment amounts for client galleries
// ABOUTME: Factors in remaining balance, extra retouches, and contract terms

export interface PaymentCalculation {
  balanceRemaining: number // Amount still owed from original contract
  extraRetouches: number // Number of retouches beyond included quota
  extraRetouchCost: number // Total cost of extra retouches
  totalDue: number // Total amount client needs to pay
}

export interface PaymentInput {
  totalAmount: number // Original contract total (in cents)
  depositAmount: number // Amount already paid as deposit (in cents)
  retouchesIncluded: number // Number of retouches included in contract
  retouchesUsed: number // Number of retouches requested/approved
  pricePerExtraRetouch: number // Price per additional retouch (in cents)
}

export function calculateFinalPayment(input: PaymentInput): PaymentCalculation {
  const balanceRemaining = Math.max(0, input.totalAmount - input.depositAmount)

  const extraRetouches = Math.max(
    0,
    input.retouchesUsed - input.retouchesIncluded
  )
  const extraRetouchCost = extraRetouches * input.pricePerExtraRetouch

  const totalDue = balanceRemaining + extraRetouchCost

  return {
    balanceRemaining,
    extraRetouches,
    extraRetouchCost,
    totalDue,
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest tests/lib/calculate-final-payment.test.ts`
Expected: PASS (all 3 tests)

**Step 5: Create API endpoint for payment amount**

Create `app/api/client-galleries/[id]/final-payment-amount/route.ts`:

```typescript
// ABOUTME: API route to calculate final payment amount for a gallery
// ABOUTME: Returns breakdown of balance, extra retouches, and total due

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calculateFinalPayment } from '@/lib/calculate-final-payment'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const gallery = await prisma.clientGallery.findUnique({
      where: { id },
      include: {
        client: true,
        contract: {
          include: {
            _count: {
              select: {
                payments: {
                  where: { status: 'COMPLETED' },
                },
              },
            },
          },
        },
        images: {
          include: {
            retouchRequests: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Verify access
    if (session.user.role !== 'ADMIN' && gallery.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!gallery.contract) {
      return NextResponse.json(
        { error: 'Gallery not linked to contract' },
        { status: 400 }
      )
    }

    const approvedRetouches = gallery.images.reduce(
      (sum, img) => sum + img.retouchRequests.length,
      0
    )

    const calculation = calculateFinalPayment({
      totalAmount: gallery.contract.totalAmount,
      depositAmount: gallery.contract.depositAmount,
      retouchesIncluded: gallery.contract.retouchesIncluded,
      retouchesUsed: approvedRetouches,
      pricePerExtraRetouch: gallery.contract.pricePerExtraRetouch,
    })

    return NextResponse.json(calculation)
  } catch (error) {
    console.error('Payment calculation error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate payment' },
      { status: 500 }
    )
  }
}
```

**Step 6: Run full test suite**

Run: `pnpm vitest tests/lib/calculate-final-payment.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add lib/calculate-final-payment.ts app/api/client-galleries/[id]/final-payment-amount/route.ts tests/lib/calculate-final-payment.test.ts
git commit -m "feat: add final payment calculation logic

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Stripe Final Payment Integration

**Files:**

- Create: `app/api/create-final-payment-session/route.ts`
- Create: `app/client/[slug]/FinalPaymentBanner.tsx`
- Modify: `app/client/[slug]/page.tsx`
- Test: `tests/client/final-payment.spec.ts`

**Step 1: Install Stripe**

Run: `pnpm add stripe @stripe/stripe-js`

**Step 2: Create Stripe checkout session API**

Create `app/api/create-final-payment-session/route.ts`:

```typescript
// ABOUTME: API route to create Stripe checkout session for final gallery payment
// ABOUTME: Calculates total due and creates payment session with metadata

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calculateFinalPayment } from '@/lib/calculate-final-payment'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { galleryId } = await request.json()

    const gallery = await prisma.clientGallery.findUnique({
      where: { id: galleryId },
      include: {
        client: true,
        contract: true,
        images: {
          include: {
            retouchRequests: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
    })

    if (!gallery || !gallery.contract) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Verify access
    if (gallery.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const approvedRetouches = gallery.images.reduce(
      (sum, img) => sum + img.retouchRequests.length,
      0
    )

    const calculation = calculateFinalPayment({
      totalAmount: gallery.contract.totalAmount,
      depositAmount: gallery.contract.depositAmount,
      retouchesIncluded: gallery.contract.retouchesIncluded,
      retouchesUsed: approvedRetouches,
      pricePerExtraRetouch: gallery.contract.pricePerExtraRetouch,
    })

    if (calculation.totalDue === 0) {
      return NextResponse.json({ error: 'No payment due' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: calculation.totalDue,
            product_data: {
              name: `Final Payment - ${gallery.title}`,
              description: `Balance: $${(calculation.balanceRemaining / 100).toFixed(2)}${
                calculation.extraRetouches > 0
                  ? ` + ${calculation.extraRetouches} extra retouches ($${(calculation.extraRetouchCost / 100).toFixed(2)})`
                  : ''
              }`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: gallery.client.email,
      metadata: {
        type: 'FINAL_BALANCE',
        galleryId: gallery.id,
        contractId: gallery.contractId!,
        userId: session.user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/${gallery.slug}?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/${gallery.slug}`,
    })

    return NextResponse.json({ sessionId: checkoutSession.id })
  } catch (error) {
    console.error('Stripe session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
```

**Step 3: Create final payment banner component**

Create `app/client/[slug]/FinalPaymentBanner.tsx`:

```typescript
'use client'

// ABOUTME: Banner component for final payment on client gallery
// ABOUTME: Shows payment breakdown and Stripe checkout button

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface FinalPaymentBannerProps {
  galleryId: string
  calculation: {
    balanceRemaining: number
    extraRetouches: number
    extraRetouchCost: number
    totalDue: number
  }
  expiresAt: Date | null
}

export function FinalPaymentBanner({
  galleryId,
  calculation,
  expiresAt,
}: FinalPaymentBannerProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/create-final-payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Payment error:', error)
      setLoading(false)
    }
  }

  const daysRemaining = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Final Payment Required</h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Remaining Balance:</span>
          <span className="font-medium">
            ${(calculation.balanceRemaining / 100).toFixed(2)}
          </span>
        </div>

        {calculation.extraRetouches > 0 && (
          <div className="flex justify-between">
            <span>
              Extra Retouches ({calculation.extraRetouches}):
            </span>
            <span className="font-medium">
              ${(calculation.extraRetouchCost / 100).toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between text-xl font-bold border-t pt-2">
          <span>Total Due:</span>
          <span>${(calculation.totalDue / 100).toFixed(2)}</span>
        </div>
      </div>

      {daysRemaining !== null && (
        <p className="text-sm text-amber-800 mb-4">
          Gallery expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
        </p>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  )
}
```

**Step 4: Update client gallery page to show banner**

Modify `app/client/[slug]/page.tsx` - add import and conditional rendering:

```typescript
import { FinalPaymentBanner } from './FinalPaymentBanner'

// In the component, after fetching gallery data:
const showPaymentBanner =
  gallery.contract &&
  gallery.finalPaymentStatus !== 'COMPLETED' &&
  gallery.contractId !== null

// In the JSX, before the gallery grid:
{showPaymentBanner && (
  <FinalPaymentBanner
    galleryId={gallery.id}
    calculation={paymentCalculation}
    expiresAt={gallery.expiresAt}
  />
)}
```

**Step 5: Commit**

```bash
git add app/api/create-final-payment-session/route.ts app/client/[slug]/FinalPaymentBanner.tsx app/client/[slug]/page.tsx package.json
git commit -m "feat: add Stripe final payment integration

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Premium Gallery Theme

**Files:**

- Create: `app/client/[slug]/PremiumGallery.tsx`
- Create: `app/globals.css` (add premium animations)
- Modify: `app/client/[slug]/page.tsx`

**Step 1: Create premium gallery component**

Create `app/client/[slug]/PremiumGallery.tsx`:

```typescript
'use client'

// ABOUTME: Premium luxury-themed gallery component for paid clients
// ABOUTME: Features champagne gold accents, animations, and full-res downloads

import { useState } from 'react'
import { ClientImage } from '@prisma/client'

interface PremiumGalleryProps {
  images: ClientImage[]
  galleryId: string
  downloadQuotaRemaining: number
}

export function PremiumGallery({
  images,
  galleryId,
  downloadQuotaRemaining,
}: PremiumGalleryProps) {
  const [quota, setQuota] = useState(downloadQuotaRemaining)

  const handleDownload = async (imageId: string) => {
    if (quota <= 0) {
      alert('Download quota exhausted')
      return
    }

    try {
      const response = await fetch(`/api/client-images/${imageId}/download`)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `image-${imageId}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setQuota(quota - 1)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download image')
    }
  }

  return (
    <div className="premium-gallery">
      <div className="premium-header">
        <h2 className="premium-title">Your Collection Awaits</h2>
        <p className="premium-quota">
          {quota} download{quota !== 1 ? 's' : ''} remaining
        </p>
      </div>

      <div className="premium-grid">
        {images.map((image) => (
          <div key={image.id} className="premium-card">
            <img
              src={image.url}
              alt={image.altText || ''}
              className="premium-image"
            />
            <button
              onClick={() => handleDownload(image.id)}
              className="premium-download-btn"
              disabled={quota <= 0}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Add premium CSS to globals**

Add to `app/globals.css`:

```css
/* Premium Gallery Theme */
.premium-gallery {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  min-height: 100vh;
  padding: 4rem 2rem;
}

.premium-header {
  text-align: center;
  margin-bottom: 4rem;
}

.premium-title {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #d4af37 0%, #f4e5b8 50%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
  animation: shimmer 3s ease-in-out infinite;
}

.premium-quota {
  color: #d4af37;
  font-size: 1.25rem;
  letter-spacing: 0.05em;
}

.premium-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.premium-card {
  position: relative;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.6s ease-out backwards;
}

.premium-card:hover {
  transform: translateY(-8px);
  border-color: rgba(212, 175, 55, 0.6);
  box-shadow: 0 20px 40px rgba(212, 175, 55, 0.2);
}

.premium-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
  animation: glint 8s ease-in-out infinite;
}

.premium-image {
  width: 100%;
  aspect-ratio: 3/2;
  object-fit: cover;
}

.premium-download-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #d4af37 0%, #b8922e 100%);
  color: #0a0a0a;
  font-weight: 600;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.premium-download-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f4e5b8 0%, #d4af37 100%);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.premium-download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes shimmer {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes glint {
  0%,
  100% {
    left: -100%;
  }
  50% {
    left: 200%;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Step 3: Update client page to use premium theme**

Modify `app/client/[slug]/page.tsx`:

```typescript
import { PremiumGallery } from './PremiumGallery'

// After checking finalPaymentStatus:
const isPremium = gallery.finalPaymentStatus === 'COMPLETED'

// In JSX:
{isPremium ? (
  <PremiumGallery
    images={gallery.images}
    galleryId={gallery.id}
    downloadQuotaRemaining={
      gallery.contract
        ? gallery.contract.downloadQuota - gallery.downloadQuotaUsed
        : 0
    }
  />
) : (
  // Existing ClientGalleryView component
)}
```

**Step 4: Commit**

```bash
git add app/client/[slug]/PremiumGallery.tsx app/globals.css app/client/[slug]/page.tsx
git commit -m "feat: add premium gallery theme with luxury design

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Download API with Quota Enforcement

**Files:**

- Create: `app/api/client-images/[imageId]/download/route.ts`
- Test: `tests/api/download.spec.ts`

**Step 1: Write failing test for download**

Create `tests/api/download.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Image Download API', () => {
  test('allows download when quota available', async ({ request }) => {
    const response = await request.get(
      '/api/client-images/test-image-id/download'
    )

    expect(response.ok()).toBeTruthy()
    expect(response.headers()['content-type']).toBe('image/jpeg')
  })

  test('blocks download when quota exhausted', async ({ request }) => {
    const response = await request.get(
      '/api/client-images/exhausted-quota-image/download'
    )

    expect(response.status()).toBe(403)
    const json = await response.json()
    expect(json.error).toContain('quota')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/api/download.spec.ts`
Expected: FAIL - "route not found"

**Step 3: Implement download API**

Create `app/api/client-images/[imageId]/download/route.ts`:

```typescript
// ABOUTME: API route for downloading full-resolution client gallery images
// ABOUTME: Enforces payment status, download quota, and file size limits

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageId } = await params

    const image = await prisma.clientImage.findUnique({
      where: { id: imageId },
      include: {
        clientGallery: {
          include: {
            client: true,
            contract: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Verify access
    if (
      session.user.role !== 'ADMIN' &&
      image.clientGallery.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check final payment status
    if (image.clientGallery.finalPaymentStatus !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Final payment required' },
        { status: 403 }
      )
    }

    // Check download quota
    if (
      image.clientGallery.contract &&
      image.clientGallery.downloadQuotaUsed >=
        image.clientGallery.contract.downloadQuota
    ) {
      return NextResponse.json(
        { error: 'Download quota exhausted' },
        { status: 403 }
      )
    }

    // Read and process image
    const imagePath = path.join(process.cwd(), 'public', image.url)
    const normalizedPath = path.normalize(imagePath)
    const publicDir = path.join(process.cwd(), 'public')

    // Prevent path traversal
    if (!normalizedPath.startsWith(publicDir)) {
      return NextResponse.json({ error: 'Invalid image path' }, { status: 400 })
    }

    const imageBuffer = await readFile(normalizedPath)

    // Enforce max file size if specified
    let processedImage = sharp(imageBuffer)

    if (image.clientGallery.contract?.maxFileSizePx) {
      const metadata = await processedImage.metadata()
      const maxSize = image.clientGallery.contract.maxFileSizePx

      if (
        metadata.width &&
        metadata.height &&
        (metadata.width > maxSize || metadata.height > maxSize)
      ) {
        processedImage = processedImage.resize(maxSize, maxSize, {
          fit: 'inside',
          withoutEnlargement: false,
        })
      }
    }

    const finalBuffer = await processedImage.jpeg({ quality: 95 }).toBuffer()

    // Increment download quota
    await prisma.clientGallery.update({
      where: { id: image.clientGallery.id },
      data: {
        downloadQuotaUsed: { increment: 1 },
      },
    })

    // Return image
    return new NextResponse(finalBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="image-${imageId}.jpg"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 }
    )
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/api/download.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add app/api/client-images/[imageId]/download/route.ts tests/api/download.spec.ts
git commit -m "feat: add download API with quota enforcement

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Stripe Webhook for Final Payment

**Files:**

- Modify: `app/api/webhooks/stripe/route.ts`
- Test: Manual testing with Stripe CLI

**Step 1: Update webhook to handle final payment**

Modify `app/api/webhooks/stripe/route.ts` - add case for FINAL_BALANCE:

```typescript
// Add to the switch statement in the webhook handler:

case 'FINAL_BALANCE': {
  const { galleryId } = metadata

  await prisma.clientGallery.update({
    where: { id: galleryId },
    data: {
      finalPaymentStatus: 'COMPLETED',
    },
  })

  // TODO: Send confirmation email

  break
}
```

**Step 2: Test webhook locally**

Run Stripe CLI:

```bash
stripe listen --forward-to localhost:3333/api/webhooks/stripe
```

Trigger test payment:

```bash
stripe trigger checkout.session.completed
```

Expected: Gallery finalPaymentStatus updated to COMPLETED

**Step 3: Commit**

```bash
git add app/api/webhooks/stripe/route.ts
git commit -m "feat: handle final payment in Stripe webhook

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] Admin can view and approve/decline retouch requests
- [ ] Payment calculation correctly handles extra retouches
- [ ] Stripe checkout creates session for final payment
- [ ] Premium gallery theme displays after payment
- [ ] Downloads enforce quota and file size limits
- [ ] Webhook updates gallery status on payment
- [ ] All tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] Linting passes: `pnpm lint`

## Environment Variables Required

Add to `.env.local`:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3333
```

---

**Implementation complete!** Phase 3 adds the full final payment workflow with premium experience.
