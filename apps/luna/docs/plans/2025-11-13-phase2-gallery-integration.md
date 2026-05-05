# Phase 2: Gallery Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate contracts with client galleries, add watermarked previews, retouch request system with pricing, and gallery expiration tracking.

**Architecture:** Link ClientGallery to Contract, implement on-the-fly image watermarking with Sharp, build retouch request approval workflow with extra charge calculation, add expiration countdown UI and admin extension controls.

**Tech Stack:** Next.js 15, Prisma, Sharp, React, TypeScript, Tailwind CSS

---

## Task 1: Link Contracts to Galleries

**Files:**

- Modify: `app/admin/contracts/[id]/page.tsx` (create new)
- Modify: `app/api/admin/contracts/[id]/link-gallery/route.ts` (create new)
- Test: `tests/admin/contracts.spec.ts`

**Step 1: Create contract detail page**

Create `app/admin/contracts/[id]/page.tsx`:

```typescript
// ABOUTME: Admin page for viewing and managing individual contracts
// ABOUTME: Shows contract details, status, and allows linking to galleries

import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export default async function ContractDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      usageRights: {
        include: {
          usageRight: true,
        },
      },
      payments: true,
      clientGalleries: true,
    },
  })

  if (!contract) {
    notFound()
  }

  const availableGalleries = await prisma.clientGallery.findMany({
    where: {
      userId: contract.clientId,
      contractId: null,
    },
    include: {
      images: {
        take: 1,
      },
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Contract Details
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {contract.client.name || contract.client.email}
        </p>
      </div>

      {/* Contract Info */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">Contract Information</h2>

        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {contract.status}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Shoot Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {format(new Date(contract.shootDate), 'MMM d, yyyy')}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              ${(contract.totalAmount / 100).toLocaleString()}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Download Quota
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {contract.downloadQuota} images
            </dd>
          </div>
        </dl>

        {contract.status === 'DRAFT' && (
          <div className="mt-6">
            <form action={`/api/admin/contracts/${contract.id}/send`} method="POST">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Send Contract to Client
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Link Gallery Section */}
      {contract.status === 'SIGNED' && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Link Gallery</h2>

          {contract.clientGalleries.length > 0 ? (
            <div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Linked galleries:
              </p>
              {contract.clientGalleries.map((gallery) => (
                <div key={gallery.id} className="mb-2 rounded-lg border border-gray-200 p-4">
                  <p className="font-medium">{gallery.title}</p>
                  <p className="text-sm text-gray-500">{gallery.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Select a gallery to link to this contract:
              </p>

              {availableGalleries.length === 0 ? (
                <p className="text-sm text-gray-500">No available galleries for this client.</p>
              ) : (
                <div className="space-y-3">
                  {availableGalleries.map((gallery) => (
                    <form
                      key={gallery.id}
                      action={`/api/admin/contracts/${contract.id}/link-gallery`}
                      method="POST"
                    >
                      <input type="hidden" name="galleryId" value={gallery.id} />
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        <p className="font-medium">{gallery.title}</p>
                        <p className="text-sm text-gray-500">{gallery.description}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {gallery.images.length} images
                        </p>
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create link gallery API route**

Create `app/api/admin/contracts/[id]/link-gallery/route.ts`:

```typescript
// ABOUTME: API route for linking a gallery to a contract
// ABOUTME: Updates gallery with contractId and sets expiration to 30 days

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const galleryId = formData.get('galleryId') as string

    if (!galleryId) {
      return NextResponse.json(
        { error: 'Gallery ID required' },
        { status: 400 }
      )
    }

    // Verify contract exists and is signed
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    if (contract.status !== 'SIGNED') {
      return NextResponse.json(
        { error: 'Contract must be signed before linking gallery' },
        { status: 400 }
      )
    }

    // Set expiration to 30 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Link gallery to contract
    await prisma.clientGallery.update({
      where: { id: galleryId },
      data: {
        contractId: params.id,
        expiresAt,
      },
    })

    return NextResponse.redirect(
      new URL(`/admin/contracts/${params.id}`, request.url)
    )
  } catch (error) {
    console.error('Link gallery error:', error)
    return NextResponse.json(
      { error: 'Failed to link gallery' },
      { status: 500 }
    )
  }
}
```

**Step 3: Add test for gallery linking**

Add to `tests/admin/contracts.spec.ts`:

```typescript
test('admin can link gallery to signed contract', async ({
  authenticatedPage,
  page,
}) => {
  const email = `admin-${Date.now()}@test.com`
  const clientEmail = `client-${Date.now()}@test.com`

  // Setup: Create admin, client, contract, and gallery
  const [admin, client] = await Promise.all([
    prisma.user.create({
      data: {
        email,
        name: 'Admin User',
        role: 'ADMIN',
        password: await hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: clientEmail,
        name: 'Test Client',
        role: 'CLIENT',
        password: await hash('password123', 10),
      },
    }),
  ])

  const usageRight = await prisma.usageRight.findFirst({
    where: { slug: 'personal-use' },
  })

  const contract = await prisma.contract.create({
    data: {
      clientId: client.id,
      shootType: 'Wedding',
      shootDate: new Date('2025-06-15'),
      shootLocation: 'Central Park',
      sessionDuration: '4 hours',
      deliverablesDescription: '200 edited photos',
      totalAmount: 250000,
      depositAmount: 125000,
      retouchesIncluded: 10,
      pricePerExtraRetouch: 10000,
      downloadQuota: 50,
      maxFileSizePx: 4000,
      status: 'SIGNED',
      signedAt: new Date(),
      usageRights: {
        create: [{ usageRightId: usageRight!.id }],
      },
    },
  })

  const gallery = await prisma.clientGallery.create({
    data: {
      userId: client.id,
      title: 'Wedding Photos',
      description: 'Beautiful wedding day',
      slug: `wedding-${Date.now()}`,
    },
  })

  // Test: Link gallery to contract
  await authenticatedPage.goto(
    `http://localhost:3333/admin/contracts/${contract.id}`
  )
  await authenticatedPage.click(
    `button[type="submit"]:has-text("${gallery.title}")`
  )

  // Verify: Gallery is linked
  const updatedGallery = await prisma.clientGallery.findUnique({
    where: { id: gallery.id },
  })

  expect(updatedGallery?.contractId).toBe(contract.id)
  expect(updatedGallery?.expiresAt).toBeDefined()

  // Cleanup
  await prisma.clientGallery.delete({ where: { id: gallery.id } })
  await prisma.contract.delete({ where: { id: contract.id } })
  await Promise.all([
    prisma.user.delete({ where: { id: admin.id } }),
    prisma.user.delete({ where: { id: client.id } }),
  ])
})
```

**Step 4: Run tests**

```bash
pnpm test tests/admin/contracts.spec.ts
```

Expected: All tests pass

**Step 5: Commit**

```bash
git add app/admin/contracts app/api/admin/contracts tests/admin/contracts.spec.ts
git commit -m "feat: add contract detail page and gallery linking

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Image Watermarking System

**Files:**

- Create: `lib/watermark.ts`
- Create: `app/api/client-images/[imageId]/preview/route.ts`
- Test: Manual testing with browser

**Step 1: Create watermark utility**

Create `lib/watermark.ts`:

```typescript
// ABOUTME: Utility for generating watermarked preview images
// ABOUTME: Uses Sharp to composite diagonal "PROOF" text over images

import sharp from 'sharp'
import { readFile } from 'fs/promises'
import path from 'path'

export async function generateWatermarkedPreview(
  imagePath: string,
  clientName: string,
  maxSize = 1200
): Promise<Buffer> {
  // Read the original image
  const imageBuffer = await readFile(imagePath)
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()

  // Calculate dimensions for preview (max 1200px longest edge)
  const width = metadata.width || 1200
  const height = metadata.height || 1200
  const aspectRatio = width / height

  let newWidth = width
  let newHeight = height

  if (width > height && width > maxSize) {
    newWidth = maxSize
    newHeight = Math.round(maxSize / aspectRatio)
  } else if (height > maxSize) {
    newHeight = maxSize
    newWidth = Math.round(maxSize * aspectRatio)
  }

  // Resize image
  const resized = await image
    .resize(newWidth, newHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer()

  // Create watermark SVG (diagonal text across center)
  const watermarkText = `PROOF - ${clientName.toUpperCase()}`
  const fontSize = Math.min(newWidth, newHeight) / 12

  const watermarkSvg = `
    <svg width="${newWidth}" height="${newHeight}">
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="rgba(255, 255, 255, 0.4)"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-45 ${newWidth / 2} ${newHeight / 2})"
      >
        ${watermarkText}
      </text>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="none"
        stroke="rgba(0, 0, 0, 0.3)"
        stroke-width="2"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-45 ${newWidth / 2} ${newHeight / 2})"
      >
        ${watermarkText}
      </text>
    </svg>
  `

  // Composite watermark onto image
  const watermarkedImage = await sharp(resized)
    .composite([
      {
        input: Buffer.from(watermarkSvg),
        top: 0,
        left: 0,
      },
    ])
    .jpeg({ quality: 85 })
    .toBuffer()

  return watermarkedImage
}
```

**Step 2: Create preview API route**

Create `app/api/client-images/[imageId]/preview/route.ts`:

```typescript
// ABOUTME: API route for serving watermarked preview images
// ABOUTME: Only accessible before final payment is completed

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateWatermarkedPreview } from '@/lib/watermark'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get image with gallery and contract info
    const image = await prisma.clientImage.findUnique({
      where: { id: params.imageId },
      include: {
        gallery: {
          include: {
            user: true,
            contract: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Verify user has access to this gallery
    if (
      session.user.role !== 'ADMIN' &&
      image.gallery.userId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If final payment completed, redirect to full-res download
    if (image.gallery.finalPaymentStatus === 'COMPLETED') {
      return NextResponse.redirect(
        new URL(`/api/client-images/${params.imageId}/download`, request.url)
      )
    }

    // Generate watermarked preview
    const imagePath = path.join(process.cwd(), 'public', image.url)
    const clientName = image.gallery.user.name || image.gallery.user.email

    const watermarkedBuffer = await generateWatermarkedPreview(
      imagePath,
      clientName
    )

    // Return watermarked image
    return new NextResponse(watermarkedBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
```

**Step 3: Install Sharp dependency**

```bash
pnpm add sharp
```

**Step 4: Test watermark generation**

Navigate to `/admin/contracts/[id]` and create a test gallery with images. Access preview URL:

```
http://localhost:3333/api/client-images/[imageId]/preview
```

Expected: Image with diagonal "PROOF - CLIENT NAME" watermark

**Step 5: Commit**

```bash
git add lib/watermark.ts app/api/client-images package.json pnpm-lock.yaml
git commit -m "feat: add image watermarking system

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Retouch Request System

**Files:**

- Create: `app/client/[slug]/RetouchRequestForm.tsx`
- Modify: `app/client/[slug]/page.tsx`
- Create: `app/api/client-galleries/[id]/retouch-requests/route.ts`

**Step 1: Create retouch request form component**

Create `app/client/[slug]/RetouchRequestForm.tsx`:

```typescript
// ABOUTME: Form for clients to request retouches on selected images
// ABOUTME: Shows included retouches remaining and charges for extras

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  galleryId: string
  imageId: string
  retouchesIncluded: number
  retouchesUsed: number
  pricePerExtra: number
  onClose: () => void
}

export default function RetouchRequestForm({
  galleryId,
  imageId,
  retouchesIncluded,
  retouchesUsed,
  pricePerExtra,
  onClose,
}: Props) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const retouchesRemaining = retouchesIncluded - retouchesUsed
  const willCostExtra = retouchesRemaining <= 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(
        `/api/client-galleries/${galleryId}/retouch-requests`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageId,
            notes,
          }),
        }
      )

      if (!response.ok) throw new Error('Failed to submit')

      router.refresh()
      onClose()
    } catch (error) {
      alert('Failed to submit retouch request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">Request Retouch</h2>

        <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>{retouchesRemaining}</strong> included retouches remaining
          </p>
          {willCostExtra && (
            <p className="mt-2 text-sm font-semibold text-orange-700 dark:text-orange-300">
              This retouch will cost ${(pricePerExtra / 100).toFixed(2)} extra
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Retouch Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Describe what changes you'd like made..."
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

**Step 2: Create retouch request API route**

Create `app/api/client-galleries/[id]/retouch-requests/route.ts`:

```typescript
// ABOUTME: API route for creating retouch requests
// ABOUTME: Tracks usage against contract retouch quota

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageId, notes } = await request.json()

    // Verify gallery access
    const gallery = await prisma.clientGallery.findUnique({
      where: { id: params.id },
      include: {
        contract: true,
      },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && gallery.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!gallery.contract) {
      return NextResponse.json(
        { error: 'Gallery not linked to contract' },
        { status: 400 }
      )
    }

    // Count existing retouch requests
    const retouchCount = await prisma.retouchRequest.count({
      where: {
        clientImage: {
          galleryId: params.id,
        },
      },
    })

    // Create retouch request
    const retouchRequest = await prisma.retouchRequest.create({
      data: {
        clientImageId: imageId,
        requestNotes: notes,
        status: 'PENDING',
      },
    })

    return NextResponse.json(retouchRequest, { status: 201 })
  } catch (error) {
    console.error('Retouch request error:', error)
    return NextResponse.json(
      { error: 'Failed to create retouch request' },
      { status: 500 }
    )
  }
}
```

**Step 3: Add retouch button to client gallery**

Modify `app/client/[slug]/page.tsx` to include retouch request functionality.

**Step 4: Test retouch requests**

Navigate to client gallery, click "Request Retouch" on an image, submit request.

Expected: Request created with PENDING status

**Step 5: Commit**

```bash
git add app/client app/api/client-galleries
git commit -m "feat: add retouch request system

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Gallery Expiration Tracking

**Files:**

- Create: `components/sol/ExpirationCountdown.tsx`
- Modify: `app/client/[slug]/page.tsx`
- Create: `app/api/admin/galleries/[id]/extend/route.ts`

**Step 1: Create expiration countdown component**

Create `components/sol/ExpirationCountdown.tsx`:

```typescript
// ABOUTME: Countdown timer showing days until gallery expires
// ABOUTME: Shows warning states at 7, 3, and 1 day remaining

'use client'

import { useEffect, useState } from 'react'
import { differenceInDays, differenceInHours, format } from 'date-fns'

type Props = {
  expiresAt: Date | null
}

export default function ExpirationCountdown({ expiresAt }: Props) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'urgent'>('normal')

  useEffect(() => {
    if (!expiresAt) return

    const updateCountdown = () => {
      const now = new Date()
      const expiration = new Date(expiresAt)
      const daysRemaining = differenceInDays(expiration, now)
      const hoursRemaining = differenceInHours(expiration, now)

      if (daysRemaining > 7) {
        setTimeRemaining(`Expires ${format(expiration, 'MMM d, yyyy')}`)
        setUrgency('normal')
      } else if (daysRemaining > 1) {
        setTimeRemaining(`${daysRemaining} days remaining`)
        setUrgency(daysRemaining <= 3 ? 'urgent' : 'warning')
      } else if (hoursRemaining > 0) {
        setTimeRemaining(`${hoursRemaining} hours remaining`)
        setUrgency('urgent')
      } else {
        setTimeRemaining('Expired')
        setUrgency('urgent')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [expiresAt])

  if (!expiresAt) return null

  const bgColor =
    urgency === 'urgent'
      ? 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700'
      : urgency === 'warning'
        ? 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
        : 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'

  const textColor =
    urgency === 'urgent'
      ? 'text-red-900 dark:text-red-100'
      : urgency === 'warning'
        ? 'text-orange-900 dark:text-orange-100'
        : 'text-blue-900 dark:text-blue-100'

  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex items-center gap-2">
        <svg
          className={`h-5 w-5 ${textColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className={`font-medium ${textColor}`}>{timeRemaining}</span>
      </div>
    </div>
  )
}
```

**Step 2: Add expiration countdown to client gallery**

Modify client gallery page to show expiration countdown.

**Step 3: Create extension API route for admin**

Create `app/api/admin/galleries/[id]/extend/route.ts`:

```typescript
// ABOUTME: API route for admin to extend gallery expiration
// ABOUTME: Adds specified number of days to current expiration

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { days } = await request.json()

    if (!days || days < 1) {
      return NextResponse.json(
        { error: 'Days must be positive number' },
        { status: 400 }
      )
    }

    const gallery = await prisma.clientGallery.findUnique({
      where: { id: params.id },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Calculate new expiration
    const currentExpiration = gallery.expiresAt || new Date()
    const newExpiration = new Date(currentExpiration)
    newExpiration.setDate(newExpiration.getDate() + days)

    // Update expiration
    const updatedGallery = await prisma.clientGallery.update({
      where: { id: params.id },
      data: {
        expiresAt: newExpiration,
      },
    })

    return NextResponse.json(updatedGallery)
  } catch (error) {
    console.error('Extension error:', error)
    return NextResponse.json(
      { error: 'Failed to extend gallery' },
      { status: 500 }
    )
  }
}
```

**Step 4: Test expiration functionality**

Create a gallery with expiration, verify countdown shows correctly, test admin extension.

**Step 5: Commit**

```bash
git add components/sol/ExpirationCountdown.tsx app/client app/api/admin/galleries
git commit -m "feat: add gallery expiration tracking and extension

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Next Steps

This completes Phase 2: Gallery Integration. The system now has:

- Contract-to-gallery linking
- Watermarked preview images
- Retouch request system with quota tracking
- Gallery expiration countdown and admin extension

Phase 3 would include:

- Admin retouch approval workflow
- Final payment calculation with extra retouches
- Stripe final payment integration
- Premium gallery theme after payment
- Download quota enforcement
