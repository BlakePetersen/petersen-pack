# Unified Image Upload and Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a universal image management system for all CMS content with upload, crop, focal point editing, and on-the-fly editing of public images.

**Architecture:** Three-component system: `ImageUploader` for CMS forms, `EditableImage` wrapper for public site, `ImageEditorModal` for editing. Context-specific crop overrides allow different crops for referenced images (hero slides can crop differently than source gallery images). All cropping is CSS-based for performance.

**Tech Stack:** Next.js 15, React 19, Prisma, Vercel Blob, Sharp, react-easy-crop, NextAuth v5

---

## Phase 1: Database Schema

### Task 1.1: Add crop fields to Image model

**Files:**

- Modify: `prisma/schema.prisma` (Image model around line 55)

**Step 1: Add crop fields to Image model**

In `prisma/schema.prisma`, add these fields to the `Image` model after the `focalY` field:

```prisma
model Image {
  id        String   @id @default(cuid())
  url       String
  publicId  String?
  altText   String?
  width     Int?
  height    Int?
  focalX    Float?   @default(0.5)
  focalY    Float?   @default(0.5)
  cropX           Float?  // 0-1 range, left edge as percentage
  cropY           Float?  // 0-1 range, top edge as percentage
  cropWidth       Float?  // 0-1 range, width as percentage
  cropHeight      Float?  // 0-1 range, height as percentage
  cropAspectRatio String? // e.g., "16:9", "1:1", "original"
  sortOrder Int      @default(0)
  galleryId String
  createdAt DateTime @default(now())

  gallery    Gallery     @relation(fields: [galleryId], references: [id], onDelete: Cascade)
  heroSlides HeroSlide[]

  @@index([galleryId])
}
```

**Step 2: Commit schema change**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add crop fields to Image model"
```

### Task 1.2: Add crop fields to BlogPostImage model

**Files:**

- Modify: `prisma/schema.prisma` (BlogPostImage model)

**Step 1: Add crop fields to BlogPostImage model**

Locate the `BlogPostImage` model and add crop fields after `focalY`:

```prisma
model BlogPostImage {
  id        String   @id @default(cuid())
  url       String
  publicId  String?
  altText   String?
  width     Int?
  height    Int?
  focalX    Float?   @default(0.5)
  focalY    Float?   @default(0.5)
  cropX           Float?
  cropY           Float?
  cropWidth       Float?
  cropHeight      Float?
  cropAspectRatio String?
  sortOrder Int      @default(0)
  postId    String
  createdAt DateTime @default(now())

  post BlogPost @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
}
```

**Step 2: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add crop fields to BlogPostImage model"
```

### Task 1.3: Add crop fields to ServiceImage model

**Files:**

- Modify: `prisma/schema.prisma` (ServiceImage model)

**Step 1: Add crop fields to ServiceImage model**

Locate the `ServiceImage` model and add crop fields after `focalY`:

```prisma
model ServiceImage {
  id         String   @id @default(cuid())
  categoryId String
  url        String
  publicId   String?
  altText    String?
  width      Int?
  height     Int?
  focalX     Float?   @default(0.5)
  focalY     Float?   @default(0.5)
  cropX           Float?
  cropY           Float?
  cropWidth       Float?
  cropHeight      Float?
  cropAspectRatio String?
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())

  category ServiceCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([categoryId])
}
```

**Step 2: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add crop fields to ServiceImage model"
```

### Task 1.4: Add crop fields to HeroSlide model

**Files:**

- Modify: `prisma/schema.prisma` (HeroSlide model)

**Step 1: Add crop fields to HeroSlide model**

Locate the `HeroSlide` model and add crop fields after the focal point fields:

```prisma
model HeroSlide {
  id             String   @id @default(cuid())
  title          String

  // Image source (priority: imageId > galleryId > imageUrl)
  galleryId      String?
  imageId        String?
  imageUrl       String?
  mobileImageUrl String?

  focalX         Float    @default(0.5)
  focalY         Float    @default(0.5)
  mobileFocalX   Float    @default(0.5)
  mobileFocalY   Float    @default(0.5)

  cropX           Float?
  cropY           Float?
  cropWidth       Float?
  cropHeight      Float?
  cropAspectRatio String?

  linkUrl        String?

  // ... rest of model
}
```

**Step 2: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add crop fields to HeroSlide model"
```

### Task 1.5: Create and apply migration

**Files:**

- Create: Migration file (auto-generated)

**Step 1: Create migration**

```bash
pnpm prisma migrate dev --name add_crop_fields
```

Expected: Migration created successfully, database updated.

**Step 2: Verify migration**

```bash
pnpm prisma studio
```

Check that crop fields appear on Image, BlogPostImage, ServiceImage, and HeroSlide models.

**Step 3: Commit migration**

```bash
git add prisma/migrations
git commit -m "feat(db): add crop fields migration"
```

---

## Phase 2: Utility Functions

### Task 2.1: Create image styles utility

**Files:**

- Create: `lib/image-utils.ts`

**Step 1: Create getImageStyles utility function**

Create `lib/image-utils.ts`:

```typescript
// ABOUTME: Image rendering utilities for crop and focal point
// ABOUTME: Calculates CSS styles for displaying cropped images

export type ImageData = {
  url: string
  focalX?: number | null
  focalY?: number | null
  cropX?: number | null
  cropY?: number | null
  cropWidth?: number | null
  cropHeight?: number | null
}

export type ImageStyles = {
  container: React.CSSProperties
  image: React.CSSProperties
}

/**
 * Calculate styles for displaying an image with crop and focal point
 * @param imageData - Image metadata including crop and focal point
 * @param displayAspectRatio - Aspect ratio for the container (e.g., "16/9")
 * @returns CSS styles for container and image
 */
export function getImageStyles(
  imageData: ImageData,
  displayAspectRatio?: string
): ImageStyles {
  const focalX = imageData.focalX ?? 0.5
  const focalY = imageData.focalY ?? 0.5

  // If no crop data, just use focal point
  if (
    !imageData.cropX ||
    !imageData.cropY ||
    !imageData.cropWidth ||
    !imageData.cropHeight
  ) {
    return {
      container: {
        position: 'relative',
        width: '100%',
        aspectRatio: displayAspectRatio,
        overflow: 'hidden',
      },
      image: {
        objectFit: 'cover',
        objectPosition: `${focalX * 100}% ${focalY * 100}%`,
      },
    }
  }

  // Apply crop transformation
  const cropX = imageData.cropX
  const cropY = imageData.cropY
  const cropWidth = imageData.cropWidth
  const cropHeight = imageData.cropHeight

  return {
    container: {
      position: 'relative',
      width: '100%',
      aspectRatio: displayAspectRatio,
      overflow: 'hidden',
    },
    image: {
      objectFit: 'cover',
      objectPosition: `${focalX * 100}% ${focalY * 100}%`,
      transform: `scale(${1 / cropWidth}, ${1 / cropHeight})`,
      transformOrigin: `${((focalX - cropX) / cropWidth) * 100}% ${((focalY - cropY) / cropHeight) * 100}%`,
    },
  }
}

/**
 * Aspect ratio presets for cropping
 */
export const ASPECT_RATIOS = {
  '1:1': { label: 'Square (1:1)', value: 1 },
  '4:3': { label: 'Standard (4:3)', value: 4 / 3 },
  '16:9': { label: 'Widescreen (16:9)', value: 16 / 9 },
  '21:9': { label: 'Ultrawide (21:9)', value: 21 / 9 },
  original: { label: 'Original', value: null },
} as const

export type AspectRatioKey = keyof typeof ASPECT_RATIOS
```

**Step 2: Commit utility**

```bash
git add lib/image-utils.ts
git commit -m "feat(utils): add image styles utility for crop and focal point"
```

---

## Phase 3: API Layer

### Task 3.1: Create admin session check endpoint

**Files:**

- Create: `app/api/admin/session/route.ts`

**Step 1: Write failing test**

Create `app/api/admin/session/route.test.ts`:

```typescript
import { GET } from './route'
import { auth } from '@/auth'

jest.mock('@/auth')

describe('/api/admin/session', () => {
  it('returns isAdmin true when user is ADMIN', async () => {
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'user1', role: 'ADMIN' },
    })

    const response = await GET()
    const data = await response.json()

    expect(data).toEqual({ isAdmin: true, userId: 'user1' })
  })

  it('returns isAdmin false when user is not ADMIN', async () => {
    ;(auth as jest.Mock).mockResolvedValue({
      user: { id: 'user2', role: 'CLIENT' },
    })

    const response = await GET()
    const data = await response.json()

    expect(data).toEqual({ isAdmin: false })
  })

  it('returns isAdmin false when no session', async () => {
    ;(auth as jest.Mock).mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(data).toEqual({ isAdmin: false })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm test app/api/admin/session/route.test.ts`
Expected: FAIL with "route not found"

**Step 3: Implement session check endpoint**

Create `app/api/admin/session/route.ts`:

```typescript
// ABOUTME: Admin session check API endpoint
// ABOUTME: Returns whether current user is an admin

import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ isAdmin: false })
  }

  return NextResponse.json({
    isAdmin: true,
    userId: session.user.id,
  })
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm test app/api/admin/session/route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add app/api/admin/session/
git commit -m "feat(api): add admin session check endpoint"
```

### Task 3.2: Enhance upload API to accept crop data

**Files:**

- Modify: `app/api/upload/route.ts:89-97`

**Step 1: Add crop fields to database record creation**

In `app/api/upload/route.ts`, modify the image record creation (around line 89):

```typescript
// For gallery images, create database record
const imageRecord = await prisma.image.create({
  data: {
    url: blob.url,
    altText: file.name.replace(/\.[^/.]+$/, ''),
    width: optimizedMetadata.width || null,
    height: optimizedMetadata.height || null,
    focalX: formData.get('focalX')
      ? parseFloat(formData.get('focalX') as string)
      : 0.5,
    focalY: formData.get('focalY')
      ? parseFloat(formData.get('focalY') as string)
      : 0.5,
    cropX: formData.get('cropX')
      ? parseFloat(formData.get('cropX') as string)
      : null,
    cropY: formData.get('cropY')
      ? parseFloat(formData.get('cropY') as string)
      : null,
    cropWidth: formData.get('cropWidth')
      ? parseFloat(formData.get('cropWidth') as string)
      : null,
    cropHeight: formData.get('cropHeight')
      ? parseFloat(formData.get('cropHeight') as string)
      : null,
    cropAspectRatio: (formData.get('cropAspectRatio') as string) || null,
    galleryId: galleryId!,
  },
})
```

**Step 2: Commit**

```bash
git add app/api/upload/route.ts
git commit -m "feat(api): accept crop data in upload endpoint"
```

### Task 3.3: Create image update API endpoint

**Files:**

- Create: `app/api/images/[id]/route.ts`

**Step 1: Implement PATCH endpoint for image updates**

Create `app/api/images/[id]/route.ts`:

```typescript
// ABOUTME: Image update API endpoint
// ABOUTME: Handles updating crop and focal point data for existing images

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

type Context = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: NextRequest, context: Context) {
  const params = await context.params
  const { id } = params

  // Verify admin session
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const imageType = searchParams.get('type')

  if (
    !imageType ||
    !['gallery', 'service', 'blog', 'hero'].includes(imageType)
  ) {
    return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const {
      focalX,
      focalY,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      cropAspectRatio,
    } = body

    let updatedImage

    switch (imageType) {
      case 'gallery':
        updatedImage = await prisma.image.update({
          where: { id },
          data: {
            focalX: focalX ?? undefined,
            focalY: focalY ?? undefined,
            cropX: cropX ?? undefined,
            cropY: cropY ?? undefined,
            cropWidth: cropWidth ?? undefined,
            cropHeight: cropHeight ?? undefined,
            cropAspectRatio: cropAspectRatio ?? undefined,
          },
        })
        break

      case 'service':
        updatedImage = await prisma.serviceImage.update({
          where: { id },
          data: {
            focalX: focalX ?? undefined,
            focalY: focalY ?? undefined,
            cropX: cropX ?? undefined,
            cropY: cropY ?? undefined,
            cropWidth: cropWidth ?? undefined,
            cropHeight: cropHeight ?? undefined,
            cropAspectRatio: cropAspectRatio ?? undefined,
          },
        })
        break

      case 'blog':
        updatedImage = await prisma.blogPostImage.update({
          where: { id },
          data: {
            focalX: focalX ?? undefined,
            focalY: focalY ?? undefined,
            cropX: cropX ?? undefined,
            cropY: cropY ?? undefined,
            cropWidth: cropWidth ?? undefined,
            cropHeight: cropHeight ?? undefined,
            cropAspectRatio: cropAspectRatio ?? undefined,
          },
        })
        break

      case 'hero':
        updatedImage = await prisma.heroSlide.update({
          where: { id },
          data: {
            focalX: focalX ?? undefined,
            focalY: focalY ?? undefined,
            cropX: cropX ?? undefined,
            cropY: cropY ?? undefined,
            cropWidth: cropWidth ?? undefined,
            cropHeight: cropHeight ?? undefined,
            cropAspectRatio: cropAspectRatio ?? undefined,
          },
        })
        break
    }

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    )
  }
}
```

**Step 2: Commit**

```bash
git add app/api/images/
git commit -m "feat(api): add image update endpoint with auth"
```

---

## Phase 4: Core Components

### Task 4.1: Install react-easy-crop

**Files:**

- Modify: `package.json`

**Step 1: Install dependency**

```bash
pnpm add react-easy-crop
```

**Step 2: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(deps): add react-easy-crop for image cropping"
```

### Task 4.2: Create ImageEditorModal component

**Files:**

- Create: `components/sol/admin/ImageEditorModal.tsx`

**Step 1: Create ImageEditorModal component**

Create `components/sol/admin/ImageEditorModal.tsx`:

```typescript
// ABOUTME: Modal for editing image crop and focal point
// ABOUTME: Used by EditableImage for on-the-fly editing

'use client'

import { useState, useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import Cropper, { Area } from 'react-easy-crop'
import { ASPECT_RATIOS, AspectRatioKey } from '@/lib/image-utils'

type ImageEditorModalProps = {
  imageId: string
  imageType: 'gallery' | 'service' | 'blog' | 'hero'
  imageUrl: string
  initialData: {
    focalX: number
    focalY: number
    cropX?: number | null
    cropY?: number | null
    cropWidth?: number | null
    cropHeight?: number | null
    cropAspectRatio?: string | null
  }
  onClose: () => void
  onSave: () => void
}

export function ImageEditorModal({
  imageId,
  imageType,
  imageUrl,
  initialData,
  onClose,
  onSave,
}: ImageEditorModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>(
    (initialData.cropAspectRatio as AspectRatioKey) || 'original'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleSave = async () => {
    if (!croppedAreaPixels) return

    setIsSaving(true)
    setError(null)

    try {
      // Convert pixel coordinates to percentages (0-1 range)
      // This would need the actual image dimensions
      // For now, we'll use the croppedAreaPixels directly

      const response = await fetch(`/api/images/${imageId}?type=${imageType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focalX: crop.x,
          focalY: crop.y,
          cropX: croppedAreaPixels.x,
          cropY: croppedAreaPixels.y,
          cropWidth: croppedAreaPixels.width,
          cropHeight: croppedAreaPixels.height,
          cropAspectRatio: aspectRatio === 'original' ? null : aspectRatio,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save image')
      }

      onSave()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative h-full w-full max-w-6xl bg-white p-8 dark:bg-gray-900">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Image
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative mb-6 h-[600px] bg-gray-100 dark:bg-gray-800">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={ASPECT_RATIOS[aspectRatio].value ?? undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Aspect Ratio */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aspect Ratio
            </label>
            <div className="flex gap-2">
              {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                <button
                  key={key}
                  onClick={() => setAspectRatio(key as AspectRatioKey)}
                  className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                    aspectRatio === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Zoom: {zoom.toFixed(2)}
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/sol/admin/ImageEditorModal.tsx
git commit -m "feat(components): add ImageEditorModal for editing"
```

### Task 4.3: Create EditableImage wrapper component

**Files:**

- Create: `components/sol/EditableImage.tsx`

**Step 1: Create EditableImage component**

Create `components/sol/EditableImage.tsx`:

```typescript
// ABOUTME: Wrapper for making public images editable by admins
// ABOUTME: Shows edit button on hover when admin is logged in

'use client'

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { Edit2 } from 'lucide-react'
import { ImageEditorModal } from './admin/ImageEditorModal'

type EditableImageProps = ImageProps & {
  imageId: string
  imageType: 'gallery' | 'service' | 'blog' | 'hero'
  imageData?: {
    focalX?: number | null
    focalY?: number | null
    cropX?: number | null
    cropY?: number | null
    cropWidth?: number | null
    cropHeight?: number | null
    cropAspectRatio?: string | null
  }
}

export function EditableImage({
  imageId,
  imageType,
  imageData,
  ...imageProps
}: EditableImageProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Check admin status
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false))
  }, [])

  const handleSave = () => {
    // Refresh the page to show updated image
    window.location.reload()
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image {...imageProps} />

      {/* Edit Button (only for admins) */}
      {isAdmin && isHovered && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute right-2 top-2 z-10 rounded-lg bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
          title="Edit image"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      )}

      {/* Editor Modal */}
      {isEditing && (
        <ImageEditorModal
          imageId={imageId}
          imageType={imageType}
          imageUrl={imageProps.src as string}
          initialData={{
            focalX: imageData?.focalX ?? 0.5,
            focalY: imageData?.focalY ?? 0.5,
            cropX: imageData?.cropX,
            cropY: imageData?.cropY,
            cropWidth: imageData?.cropWidth,
            cropHeight: imageData?.cropHeight,
            cropAspectRatio: imageData?.cropAspectRatio,
          }}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/sol/EditableImage.tsx
git commit -m "feat(components): add EditableImage wrapper with admin editing"
```

---

## Phase 5: ImageUploader Component

### Task 5.1: Create ImageUploader component

**Files:**

- Create: `components/sol/admin/ImageUploader.tsx`

**Step 1: Create comprehensive ImageUploader component**

Create `components/sol/admin/ImageUploader.tsx`:

```typescript
// ABOUTME: Universal image upload component for CMS forms
// ABOUTME: Handles upload, crop, and focal point editing

'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import Cropper, { Area } from 'react-easy-crop'
import { ASPECT_RATIOS, AspectRatioKey } from '@/lib/image-utils'

type ImageData = {
  url: string
  focalX: number
  focalY: number
  cropX?: number | null
  cropY?: number | null
  cropWidth?: number | null
  cropHeight?: number | null
  cropAspectRatio?: string | null
}

type ImageUploaderProps = {
  imageType: 'gallery' | 'service' | 'blog' | 'hero'
  galleryId?: string
  serviceId?: string
  postId?: string
  heroSlideId?: string
  initialImage?: ImageData
  onImageSaved: (imageData: ImageData) => void
  label?: string
}

export function ImageUploader({
  imageType,
  galleryId,
  serviceId,
  postId,
  heroSlideId,
  initialImage,
  onImageSaved,
  label = 'Image',
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialImage?.url || null
  )
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cropping state
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>('original')
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', imageType)

      if (galleryId) formData.append('galleryId', galleryId)
      if (serviceId) formData.append('serviceId', serviceId)
      if (postId) formData.append('postId', postId)
      if (heroSlideId) formData.append('heroSlideId', heroSlideId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setImageUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      setImageUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveCrop = () => {
    if (!imageUrl || !croppedAreaPixels) return

    const imageData: ImageData = {
      url: imageUrl,
      focalX: crop.x,
      focalY: crop.y,
      cropX: croppedAreaPixels.x,
      cropY: croppedAreaPixels.y,
      cropWidth: croppedAreaPixels.width,
      cropHeight: croppedAreaPixels.height,
      cropAspectRatio: aspectRatio === 'original' ? null : aspectRatio,
    }

    onImageSaved(imageData)
    setShowCropper(false)
  }

  const handleRemove = () => {
    setImageUrl(null)
    setShowCropper(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Preview or Upload Area */}
      {!showCropper && imageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
          <Image src={imageUrl} alt="Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow-lg hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : !showCropper ? (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No image uploaded
            </p>
          </div>
        </div>
      ) : null}

      {/* Cropper */}
      {showCropper && imageUrl && (
        <div className="space-y-4">
          <div className="relative h-[400px] bg-gray-100 dark:bg-gray-800">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={ASPECT_RATIOS[aspectRatio].value ?? undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aspect Ratio
            </label>
            <div className="flex gap-2">
              {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAspectRatio(key as AspectRatioKey)}
                  className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                    aspectRatio === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Zoom: {zoom.toFixed(2)}
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCropper(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Apply Crop
            </button>
          </div>
        </div>
      )}

      {/* Upload Controls */}
      {!showCropper && (
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`image-upload-${imageType}`}
          />
          <label
            htmlFor={`image-upload-${imageType}`}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 ${
              isUploading ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : imageUrl ? 'Change' : 'Upload'}
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add components/sol/admin/ImageUploader.tsx
git commit -m "feat(components): add ImageUploader with crop and upload"
```

---

## Phase 6: Integration and Testing

### Task 6.1: Update gallery admin to use ImageUploader

**Files:**

- Modify: `app/admin/galleries/page.tsx` (or wherever gallery images are uploaded)

**Step 1: Import and use ImageUploader**

Replace the existing image upload component with ImageUploader. Example:

```typescript
import { ImageUploader } from '@/components/sol/admin/ImageUploader'

// In the component:
<ImageUploader
  imageType="gallery"
  galleryId={selectedGalleryId}
  onImageSaved={(imageData) => {
    // Handle saved image
    console.log('Image saved:', imageData)
    router.refresh()
  }}
/>
```

**Step 2: Test upload flow**

1. Navigate to admin galleries page
2. Select a gallery
3. Upload an image
4. Adjust crop and focal point
5. Save and verify it appears in gallery

**Step 3: Commit**

```bash
git add app/admin/galleries/
git commit -m "feat(admin): integrate ImageUploader in gallery admin"
```

### Task 6.2: Wrap gallery images with EditableImage

**Files:**

- Modify: Gallery display components (e.g., `components/luna/GalleryGrid.tsx`)

**Step 1: Import and use EditableImage**

Replace `<Image>` with `<EditableImage>` for gallery images:

```typescript
import { EditableImage } from '@/components/sol/EditableImage'

// Instead of:
<Image src={image.url} alt={image.altText} fill />

// Use:
<EditableImage
  imageId={image.id}
  imageType="gallery"
  imageData={{
    focalX: image.focalX,
    focalY: image.focalY,
    cropX: image.cropX,
    cropY: image.cropY,
    cropWidth: image.cropWidth,
    cropHeight: image.cropHeight,
    cropAspectRatio: image.cropAspectRatio,
  }}
  src={image.url}
  alt={image.altText || ''}
  fill
/>
```

**Step 2: Test editing flow**

1. Log in as admin
2. Navigate to a gallery page
3. Hover over an image - edit button should appear
4. Click edit, adjust crop, save
5. Verify changes persist after refresh

**Step 3: Commit**

```bash
git add components/luna/
git commit -m "feat(public): add EditableImage to gallery displays"
```

---

## Testing Checklist

After all implementation:

- [ ] Upload new gallery image with crop → saves correctly
- [ ] Edit existing gallery image → updates correctly
- [ ] Images without crop data → render unchanged
- [ ] Non-admin users → no edit buttons visible
- [ ] Admin logged in → edit buttons appear on hover
- [ ] Edit modal ESC key → closes modal
- [ ] Different aspect ratios → crop constrains correctly
- [ ] Hero slide editing → doesn't affect source gallery image
- [ ] Client galleries → no EditableImage wrapper, no edit access

---

## Final Notes

**Skills to use during implementation:**

- @superpowers:test-driven-development for all new features
- @superpowers:systematic-debugging when issues arise
- @superpowers:verification-before-completion before claiming tasks complete

**Commit frequently:**

- After each task completion
- Keep commits small and focused
- Follow conventional commit format

**Don't skip:**

- Running tests after each implementation step
- Verifying admin auth before allowing edits
- Testing with both admin and non-admin users
