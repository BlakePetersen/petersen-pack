# Content Staging & Shareable Previews Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable draft/publish workflow for galleries with shareable preview links for clients.

**Architecture:** Add `status` enum to Gallery model (DRAFT/PUBLISHED), create PreviewToken model for time-limited access tokens. Preview routes validate tokens server-side and render draft content with a banner. Admin UI gets publish/unpublish controls and preview link generation.

**Tech Stack:** Prisma migrations, Next.js API routes, React components, Node.js crypto for token generation.

---

## Task 1: Database Migration - Gallery Status

**Files:**

- Modify: `prisma/schema.prisma`
- Create: Migration file (auto-generated)

**Step 1: Add GalleryStatus enum and status field to schema**

Add after line 41 (before `model Gallery`):

```prisma
enum GalleryStatus {
  DRAFT
  PUBLISHED
}
```

Modify `model Gallery` to add status and publishedAt fields:

```prisma
model Gallery {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique
  description String?
  featured    Boolean       @default(false)
  sortOrder   Int           @default(0)
  status      GalleryStatus @default(PUBLISHED)
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  images     Image[]
  heroSlides HeroSlide[]
  coverImage String?
}
```

Note: Default is PUBLISHED so existing galleries stay live. New galleries will be created as DRAFT via application logic.

**Step 2: Create and apply migration**

Run: `pnpm prisma migrate dev --name add-gallery-status`

Expected: Migration creates enum and adds columns with defaults.

**Step 3: Backfill publishedAt for existing galleries**

Create temporary script or run in Prisma Studio:

```sql
UPDATE "Gallery" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;
```

Or via Prisma:

```typescript
await prisma.gallery.updateMany({
  where: { publishedAt: null },
  data: { publishedAt: new Date() },
})
```

**Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add gallery status enum and publishedAt field"
```

---

## Task 2: Database Migration - PreviewToken Model

**Files:**

- Modify: `prisma/schema.prisma`
- Create: Migration file (auto-generated)

**Step 1: Add PreviewToken model to schema**

Add at end of schema file:

```prisma
model PreviewToken {
  id           String   @id @default(cuid())
  token        String   @unique
  resourceType String   // "gallery"
  resourceId   String
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  createdBy    String   // admin user ID

  @@index([token])
  @@index([expiresAt])
  @@index([resourceType, resourceId])
}
```

**Step 2: Create and apply migration**

Run: `pnpm prisma migrate dev --name add-preview-tokens`

Expected: Migration creates PreviewToken table with indexes.

**Step 3: Commit**

```bash
git add prisma/
git commit -m "feat: add PreviewToken model for shareable previews"
```

---

## Task 3: Preview Token API - Create & List

**Files:**

- Create: `app/api/admin/preview-tokens/route.ts`
- Create: `lib/preview-tokens.ts`

**Step 1: Create token utility functions**

Create `lib/preview-tokens.ts`:

```typescript
// ABOUTME: Preview token generation and validation utilities
// ABOUTME: Handles secure token creation and expiry calculations

import { randomBytes } from 'crypto'

export function generatePreviewToken(): string {
  return randomBytes(32).toString('hex')
}

export function getExpiryDate(duration: string): Date {
  const now = new Date()
  switch (duration) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000)
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000) // default 24h
  }
}
```

**Step 2: Create API route for creating and listing tokens**

Create `app/api/admin/preview-tokens/route.ts`:

```typescript
// ABOUTME: API endpoints for preview token management
// ABOUTME: Handles creation and listing of preview tokens for admin users

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { generatePreviewToken, getExpiryDate } from '@/lib/preview-tokens'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { resourceType, resourceId, duration } = await request.json()

    if (!resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'resourceType and resourceId are required' },
        { status: 400 }
      )
    }

    const token = generatePreviewToken()
    const expiresAt = getExpiryDate(duration || '24h')

    const previewToken = await prisma.previewToken.create({
      data: {
        token,
        resourceType,
        resourceId,
        expiresAt,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json({
      id: previewToken.id,
      token: previewToken.token,
      expiresAt: previewToken.expiresAt,
    })
  } catch (error) {
    console.error('Failed to create preview token:', error)
    return NextResponse.json(
      { error: 'Failed to create preview token' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const resourceType = searchParams.get('resourceType')
    const resourceId = searchParams.get('resourceId')

    const tokens = await prisma.previewToken.findMany({
      where: {
        ...(resourceType && { resourceType }),
        ...(resourceId && { resourceId }),
        expiresAt: { gt: new Date() }, // Only active tokens
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(tokens)
  } catch (error) {
    console.error('Failed to fetch preview tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview tokens' },
      { status: 500 }
    )
  }
}
```

**Step 3: Run type check**

Run: `pnpm type-check`

Expected: No errors

**Step 4: Commit**

```bash
git add lib/preview-tokens.ts app/api/admin/preview-tokens/
git commit -m "feat: add preview token creation and listing API"
```

---

## Task 4: Preview Token API - Delete

**Files:**

- Create: `app/api/admin/preview-tokens/[id]/route.ts`

**Step 1: Create delete endpoint**

Create `app/api/admin/preview-tokens/[id]/route.ts`:

```typescript
// ABOUTME: API endpoint for deleting preview tokens
// ABOUTME: Allows admins to revoke preview access

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.previewToken.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete preview token:', error)
    return NextResponse.json(
      { error: 'Failed to delete preview token' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add app/api/admin/preview-tokens/
git commit -m "feat: add preview token deletion API"
```

---

## Task 5: Public Preview Validation API

**Files:**

- Create: `app/api/preview/validate/route.ts`

**Step 1: Create public validation endpoint**

Create `app/api/preview/validate/route.ts`:

```typescript
// ABOUTME: Public API for validating preview tokens
// ABOUTME: Returns resource info if token is valid, used by preview pages

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const previewToken = await prisma.previewToken.findUnique({
      where: { token },
    })

    if (!previewToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    if (previewToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 410 })
    }

    return NextResponse.json({
      resourceType: previewToken.resourceType,
      resourceId: previewToken.resourceId,
      expiresAt: previewToken.expiresAt,
    })
  } catch (error) {
    console.error('Failed to validate preview token:', error)
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add app/api/preview/
git commit -m "feat: add public preview token validation API"
```

---

## Task 6: Gallery Publish/Unpublish API

**Files:**

- Create: `app/api/admin/galleries/[id]/publish/route.ts`
- Create: `app/api/admin/galleries/[id]/unpublish/route.ts`

**Step 1: Create publish endpoint**

Create `app/api/admin/galleries/[id]/publish/route.ts`:

```typescript
// ABOUTME: API endpoint for publishing a gallery
// ABOUTME: Sets gallery status to PUBLISHED and records publishedAt timestamp

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const gallery = await prisma.gallery.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Failed to publish gallery:', error)
    return NextResponse.json(
      { error: 'Failed to publish gallery' },
      { status: 500 }
    )
  }
}
```

**Step 2: Create unpublish endpoint**

Create `app/api/admin/galleries/[id]/unpublish/route.ts`:

```typescript
// ABOUTME: API endpoint for unpublishing a gallery
// ABOUTME: Sets gallery status to DRAFT, preserves publishedAt for reference

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const gallery = await prisma.gallery.update({
      where: { id },
      data: {
        status: 'DRAFT',
      },
    })

    return NextResponse.json(gallery)
  } catch (error) {
    console.error('Failed to unpublish gallery:', error)
    return NextResponse.json(
      { error: 'Failed to unpublish gallery' },
      { status: 500 }
    )
  }
}
```

**Step 3: Commit**

```bash
git add app/api/admin/galleries/
git commit -m "feat: add gallery publish/unpublish API endpoints"
```

---

## Task 7: Update Portfolio Page - Filter Published Only

**Files:**

- Modify: `app/portfolio/page.tsx`

**Step 1: Add status filter to gallery query**

In `app/portfolio/page.tsx`, update the Prisma query (around line 56):

```typescript
const galleries = await prisma.gallery.findMany({
  where: {
    status: 'PUBLISHED',
  },
  include: {
    images: {
      take: 1,
      orderBy: { sortOrder: 'asc' },
    },
    _count: {
      select: { images: true },
    },
  },
  orderBy: { sortOrder: 'asc' },
})
```

**Step 2: Run type check**

Run: `pnpm type-check`

Expected: No errors

**Step 3: Commit**

```bash
git add app/portfolio/page.tsx
git commit -m "feat: filter portfolio page to show only published galleries"
```

---

## Task 8: Create Preview Route

**Files:**

- Create: `app/preview/portfolio/[slug]/page.tsx`
- Create: `components/commons/PreviewBanner.tsx`

**Step 1: Create PreviewBanner component**

Create `components/commons/PreviewBanner.tsx`:

```typescript
// ABOUTME: Preview mode banner component
// ABOUTME: Displays warning that content is not yet published with expiry info

'use client'

interface PreviewBannerProps {
  expiresAt: string
}

export default function PreviewBanner({ expiresAt }: PreviewBannerProps) {
  const expiryDate = new Date(expiresAt)
  const formattedExpiry = expiryDate.toLocaleString()

  return (
    <div className="fixed left-0 right-0 top-0 z-[70] bg-amber-500 px-4 py-3 text-center text-sm font-medium text-amber-950">
      <span className="mr-2">👁️</span>
      You&apos;re viewing a preview. This content is not yet published.
      <span className="mx-2">•</span>
      Link expires: {formattedExpiry}
    </div>
  )
}
```

**Step 2: Create preview page**

Create `app/preview/portfolio/[slug]/page.tsx`:

```typescript
// ABOUTME: Preview page for draft galleries
// ABOUTME: Validates token and renders gallery with preview banner

import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import GlobalFooter from '@/components/commons/GlobalFooter'
import { SectionNavigator } from '@/components/luna/SectionNavigator'
import { Section, Container } from '@/components/commons'
import GalleryGrid from '@/components/commons/GalleryGrid'
import PreviewBanner from '@/components/commons/PreviewBanner'

interface PreviewPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function PreviewGalleryPage({
  params,
  searchParams,
}: PreviewPageProps) {
  const { slug } = await params
  const { token } = await searchParams

  if (!token) {
    redirect('/portfolio')
  }

  // Validate token
  const previewToken = await prisma.previewToken.findUnique({
    where: { token },
  })

  if (!previewToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invalid Preview Link
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This preview link is not valid.
          </p>
        </div>
      </div>
    )
  }

  if (previewToken.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Preview Link Expired
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This preview link has expired. Please request a new one.
          </p>
        </div>
      </div>
    )
  }

  // Fetch gallery regardless of status
  const gallery = await prisma.gallery.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!gallery) {
    notFound()
  }

  // Verify token matches this gallery
  if (
    previewToken.resourceType !== 'gallery' ||
    previewToken.resourceId !== gallery.id
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invalid Preview Link
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This preview link is not valid for this gallery.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PreviewBanner expiresAt={previewToken.expiresAt.toISOString()} />

      <div className="pt-12">
        <SectionNavigator title={gallery.title} />

        <Section>
          <Container>
            {gallery.description && (
              <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-600 dark:text-gray-400">
                {gallery.description}
              </p>
            )}
            <GalleryGrid
              images={gallery.images}
              galleryTitle={gallery.title}
            />
          </Container>
        </Section>

        <GlobalFooter />
      </div>
    </>
  )
}
```

**Step 3: Export PreviewBanner from commons index**

Add to `components/commons/index.ts`:

```typescript
export { default as PreviewBanner } from './PreviewBanner'
```

**Step 4: Run type check**

Run: `pnpm type-check`

Expected: No errors

**Step 5: Commit**

```bash
git add app/preview/ components/commons/PreviewBanner.tsx components/commons/index.ts
git commit -m "feat: add preview route for draft galleries with token validation"
```

---

## Task 9: Update GalleryForm - Default to DRAFT for New Galleries

**Files:**

- Modify: `app/api/galleries/route.ts`

**Step 1: Update POST handler to create as DRAFT**

In `app/api/galleries/route.ts`, update the create call (around line 53):

```typescript
const gallery = await prisma.gallery.create({
  data: {
    title,
    slug,
    description: description || null,
    featured: featured || false,
    status: 'DRAFT',
  },
})
```

**Step 2: Commit**

```bash
git add app/api/galleries/route.ts
git commit -m "feat: new galleries default to DRAFT status"
```

---

## Task 10: Update Gallery List Manager - Add Status Badge

**Files:**

- Modify: `components/sol/admin/GalleryListManager.tsx`

**Step 1: Update Gallery type to include status**

Update the type definition (around line 27):

```typescript
type Gallery = {
  id: string
  title: string
  slug: string
  featured: boolean
  sortOrder: number
  status: 'DRAFT' | 'PUBLISHED'
  _count: {
    images: number
  }
}
```

**Step 2: Add status badge to SortableGalleryCard**

In the `SortableGalleryCard` component, add status badge after the title (around line 213):

```typescript
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {gallery.title}
                </h3>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    gallery.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {gallery.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {gallery._count.images} images
              </p>
            </div>
```

**Step 3: Update admin galleries page query**

In `app/admin/galleries/page.tsx`, update the query to include status:

```typescript
const galleries = await prisma.gallery.findMany({
  include: {
    _count: {
      select: { images: true },
    },
  },
  orderBy: { sortOrder: 'asc' },
})
```

(status is already included by default, just verify)

**Step 4: Run type check**

Run: `pnpm type-check`

Expected: No errors

**Step 5: Commit**

```bash
git add components/sol/admin/GalleryListManager.tsx app/admin/galleries/page.tsx
git commit -m "feat: add status badge to gallery list in admin"
```

---

## Task 11: Add Publish/Preview Controls to Gallery Detail

**Files:**

- Modify: `app/admin/galleries/[id]/page.tsx`
- Create: `components/sol/admin/GalleryPublishControls.tsx`

**Step 1: Create GalleryPublishControls component**

Create `components/sol/admin/GalleryPublishControls.tsx`:

```typescript
// ABOUTME: Gallery publish/unpublish and preview link controls
// ABOUTME: Provides UI for managing gallery visibility and generating preview links

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface GalleryPublishControlsProps {
  galleryId: string
  gallerySlug: string
  status: 'DRAFT' | 'PUBLISHED'
}

interface PreviewToken {
  id: string
  token: string
  expiresAt: string
}

export default function GalleryPublishControls({
  galleryId,
  gallerySlug,
  status,
}: GalleryPublishControlsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [previewToken, setPreviewToken] = useState<PreviewToken | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handlePublish = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/galleries/${galleryId}/publish`, {
        method: 'POST',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to publish:', error)
    }
    setIsLoading(false)
  }

  const handleUnpublish = async () => {
    if (!confirm('Unpublish this gallery? It will no longer be visible on the public site.')) {
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/galleries/${galleryId}/unpublish`, {
        method: 'POST',
      })
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to unpublish:', error)
    }
    setIsLoading(false)
  }

  const handleGeneratePreview = async (duration: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/preview-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceType: 'gallery',
          resourceId: galleryId,
          duration,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setPreviewToken(data)
      }
    } catch (error) {
      console.error('Failed to generate preview:', error)
    }
    setIsLoading(false)
  }

  const previewUrl = previewToken
    ? `${window.location.origin}/preview/portfolio/${gallerySlug}?token=${previewToken.token}`
    : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      {status === 'DRAFT' ? (
        <button
          onClick={handlePublish}
          disabled={isLoading}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </button>
      ) : (
        <button
          onClick={handleUnpublish}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {isLoading ? 'Unpublishing...' : 'Unpublish'}
        </button>
      )}

      <button
        onClick={() => setShowPreviewModal(true)}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Share Preview
      </button>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Generate Preview Link
            </h3>

            {!previewToken ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a shareable link to preview this gallery. Choose how long the link should be valid:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGeneratePreview('1h')}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    1 Hour
                  </button>
                  <button
                    onClick={() => handleGeneratePreview('24h')}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    24 Hours
                  </button>
                  <button
                    onClick={() => handleGeneratePreview('7d')}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    7 Days
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share this link with anyone to let them preview the gallery:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={previewUrl}
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                  />
                  <button
                    onClick={handleCopy}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Expires: {new Date(previewToken.expiresAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPreviewModal(false)
                  setPreviewToken(null)
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Update gallery detail page to include controls**

Update `app/admin/galleries/[id]/page.tsx`:

Add import:

```typescript
import GalleryPublishControls from '@/components/sol/admin/GalleryPublishControls'
```

Update the query to include status:

```typescript
const gallery = await prisma.gallery.findUnique({
  where: { id },
  include: {
    images: {
      orderBy: { sortOrder: 'asc' },
    },
    _count: {
      select: { images: true },
    },
  },
})
```

Add controls to header:

```typescript
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {gallery.title}
              </h1>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  gallery.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {gallery.status === 'PUBLISHED' ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {gallery._count?.images || 0} images
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GalleryPublishControls
              galleryId={gallery.id}
              gallerySlug={gallery.slug}
              status={gallery.status}
            />
            <Link
              href={`/admin/galleries/${gallery.id}/edit`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Edit Settings
            </Link>
          </div>
        </div>
```

**Step 3: Run type check**

Run: `pnpm type-check`

Expected: No errors

**Step 4: Commit**

```bash
git add components/sol/admin/GalleryPublishControls.tsx app/admin/galleries/[id]/page.tsx
git commit -m "feat: add publish/unpublish and preview link controls to gallery admin"
```

---

## Task 12: Final Integration Test

**Step 1: Run full type check**

Run: `pnpm type-check`

Expected: No errors

**Step 2: Run lint**

Run: `pnpm lint`

Expected: No new errors

**Step 3: Start dev server and test manually**

Run: `pnpm dev`

Test:

1. Create a new gallery → should be DRAFT
2. Gallery shows "Draft" badge in list
3. Gallery not visible on /portfolio
4. Click "Share Preview" → generate link
5. Open preview link in incognito → should show gallery with yellow banner
6. Click "Publish" → status changes to Published
7. Gallery now visible on /portfolio
8. Click "Unpublish" → returns to draft

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete content staging and preview system (Phase 2)"
```

---

## Summary

This plan implements:

- Gallery DRAFT/PUBLISHED status with migration
- PreviewToken model for shareable access
- API endpoints for token management and publish/unpublish
- Public preview route with token validation and expiry banner
- Admin UI with status badges and publish controls
- Preview link generation modal

All existing galleries default to PUBLISHED (no breaking changes). New galleries start as DRAFT.
