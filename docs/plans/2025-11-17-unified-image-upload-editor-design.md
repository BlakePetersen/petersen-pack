# Unified Image Upload and Editor Design

## Overview

A unified image management system for all CMS content that provides:

- Single upload component used across all admin forms
- Crop and focal point editing during upload
- On-the-fly editing of any public-facing image while logged in as admin
- Context-specific crop overrides (hero slides can crop differently than source gallery images)
- No modifications to client gallery images

## Component Architecture

### ImageUploader (CMS admin component)

Used in all CMS forms for uploading new images.

**Features:**

- File upload via drag-drop or file picker
- Upload to Vercel Blob with Sharp optimization
- Crop interface with preset aspect ratios (1:1, 4:3, 16:9, 21:9, original)
- Focal point selector (click or drag on preview)
- Live preview of crop and focal point
- Saves crop bounds and focal point to database

**Props:**

```typescript
{
  imageType: 'gallery' | 'service' | 'blog' | 'hero'
  galleryId?: string
  serviceId?: string
  postId?: string
  heroSlideId?: string
  initialImage?: {
    url: string
    focalX: number
    focalY: number
    cropX?: number
    cropY?: number
    cropWidth?: number
    cropHeight?: number
    cropAspectRatio?: string
  }
  onImageSaved: (imageData) => void
}
```

### EditableImage (public-facing wrapper)

Wraps any `<Image>` component on the public site to make it editable.

**Features:**

- Displays image normally for non-admin users
- Shows subtle "Edit" button on hover when admin is logged in
- Clicking opens ImageEditorModal
- Passes through all standard Next.js Image props

**Props:**

```typescript
{
  src: string
  alt: string
  imageId: string
  imageType: 'gallery' | 'service' | 'blog' | 'hero'
  // All standard Next.js Image props
}
```

**Does not apply to:**

- Client gallery images (ClientImage model)
- Any client-facing assets

### ImageEditorModal (modal overlay)

Full-screen modal for editing existing images.

**Features:**

- Same crop and focal point controls as ImageUploader
- Fetches current image metadata from database
- Save button updates via PATCH API
- ESC key or close button dismisses modal
- Page refreshes or updates client-side state after save

## Database Schema

### New Crop Fields

Add to these models:

- `Image` (gallery images)
- `BlogPostImage` (blog images)
- `ServiceImage` (service images)
- `HeroSlide` (hero carousel - already has own focalX/focalY)

**Do not add to:**

- `ClientImage` (must remain pristine, no crops)

**Fields:**

```prisma
cropX           Float?  // 0-1 range, left edge as percentage
cropY           Float?  // 0-1 range, top edge as percentage
cropWidth       Float?  // 0-1 range, width as percentage
cropHeight      Float?  // 0-1 range, height as percentage
cropAspectRatio String? // e.g., "16:9", "1:1", "original"
```

**Defaults:**

- All fields nullable, default null
- Null crop fields = display full image (backward compatible)

### Context-Specific Overrides

When a model references another image, the referencing model gets its own crop and focal fields that override the source.

**Example:**

- Gallery Image #123: `cropX: 0.1, cropY: 0.2` (cropped for portfolio)
- HeroSlide references Image #123: own `cropX: 0, cropY: 0, cropWidth: 1, cropHeight: 0.4` (different crop for hero)
- Editing hero slide crop does not modify gallery image crop

## API Layer

### Enhanced /api/upload (existing, enhance)

**Current:** Accepts file, optimizes with Sharp, uploads to Vercel Blob

**Add:**

- Accept optional crop parameters
- Accept focal point parameters
- Save to appropriate database model when creating record

### New /api/images/[id] (PATCH)

**Purpose:** Update crop and focal point for existing images

**Accepts:**

- Image ID (route parameter)
- Image type (query: `gallery`, `service`, `blog`, `hero`)
- Crop and focal point data in body

**Security:**

- Validates admin session before allowing updates
- Returns 403 if not admin

**Returns:** Updated image data

### New /api/admin/session (GET)

**Purpose:** Check if current user is admin

**Returns:**

```typescript
{
  isAdmin: boolean
  userId?: string
}
```

**Used by:** EditableImage component to determine whether to show edit buttons

## UI Flow

### CMS Upload Flow

1. Admin selects file via drag-drop or file picker
2. Client-side preview displays immediately
3. Upload to Vercel Blob happens in background
4. Once uploaded, crop interface becomes active
5. Admin selects aspect ratio preset or "original"
6. Drag crop area handles or click to set focal point
7. Live preview updates as they adjust
8. On save, crop bounds and focal point save to database

### Public Site Edit Flow

1. Admin logged in, browsing public site
2. Hovers over any CMS image → "Edit" button appears (top-right corner)
3. Clicks edit → ImageEditorModal opens full-screen
4. Modal shows current image with existing crop/focal point applied
5. Same crop and focal point controls as upload flow
6. Save button calls PATCH /api/images/[id]
7. Modal closes, page refreshes image
8. For referenced images (HeroSlide), saves to reference record, not source

### Visual Design

- **Edit button:** Small, semi-transparent, visible only on hover
- **Modal:** Dark overlay, centered editor with white controls panel
- **Crop handles:** Corner and edge handles, constrained to selected aspect ratio
- **Focal point:** Red crosshair that updates as user clicks

## Implementation Details

### Crop Library

Use `react-easy-crop` for the cropping interface:

- Well-maintained
- Supports touch
- Handles aspect ratio constraints

### Image Rendering with Crop

When an image has crop data, use container-clipping approach:

```typescript
<div style={{
  position: 'relative',
  width: '100%',
  aspectRatio: displayAspectRatio,
  overflow: 'hidden'
}}>
  <Image
    src={url}
    fill
    style={{
      objectFit: 'cover',
      objectPosition: `${focalX * 100}% ${focalY * 100}%`,
      transform: `scale(${1 / cropWidth}, ${1 / cropHeight})`,
      transformOrigin: `${(focalX - cropX) / cropWidth * 100}% ${(focalY - cropY) / cropHeight * 100}%`
    }}
  />
</div>
```

### Helper Function

Create `getImageStyles(imageData)` utility that calculates correct CSS based on crop data.

- All image components use this helper for consistency
- Handles backward compatibility (null crops)

### Session Check

Use server components or API route to check admin status.
Cache result client-side to avoid repeated checks on every image.

## Migration and Rollout

### Phase 1: Database Migration

1. Create Prisma migration adding crop fields
2. All fields nullable with null defaults
3. Run migration (backward compatible, no downtime)

### Phase 2: Core Components

1. Build ImageUploader with upload, crop, focal point
2. Create getImageStyles() helper
3. Update /api/upload to accept and save crop/focal data
4. Create /api/images/[id] PATCH endpoint
5. Create /api/admin/session endpoint

### Phase 3: Admin Editing

1. Build ImageEditorModal
2. Build EditableImage wrapper
3. Test with one image type (gallery images)

### Phase 4: Rollout to CMS Forms

Replace existing upload components one at a time:

1. Gallery image manager
2. Hero slide form
3. Service image upload
4. Blog post image upload

Each replacement is independent.

### Phase 5: Public Site Integration

1. Wrap public-facing images with EditableImage
2. Test extensively
3. Monitor for rendering issues with existing images

### Testing Checklist

- [ ] Upload new images with crops → saves correctly
- [ ] Edit existing images → updates correctly
- [ ] Images without crop data → render unchanged
- [ ] Non-admin users → no edit buttons visible
- [ ] Client galleries → no crop fields, no edit buttons

## Error Handling and Edge Cases

### Upload Failures

- Network errors → show retry button
- File size exceeded (>10MB) → client-side validation before upload
- Invalid file types → reject with clear message
- Sharp processing errors → fallback to original without optimization

### Database Errors

- Failed to save crop data → warn user (image URL already saved)
- Concurrent edits → last-write-wins (acceptable for single admin)
- Missing image record → graceful fallback, show placeholder

### Rendering Edge Cases

- Image deleted from Blob but DB record exists → Next.js Image error boundary
- Invalid crop bounds → clamp to valid range (0-1)
- Aspect ratio mismatch → prioritize container aspect ratio
- Missing focal point data → default to center (0.5, 0.5)

### Session and Permissions

- Admin session expires mid-edit → show login prompt on save
- Non-admin tries to access edit API → 403 Forbidden
- Edit button briefly visible before session check → acceptable (API will reject)

### Client Gallery Protection

- Never render EditableImage on client gallery pages
- Route guards prevent ClientImage updates via edit API
- Code review checkpoint: ensure no crop fields on ClientImage model

### Browser Compatibility

- CSS transform/clip works in all modern browsers
- Graceful degradation: if CSS fails, full image displays

## Performance

- No server-side image manipulation at render time
- All cropping is CSS-based (fast, no additional requests)
- Original full-resolution images stay in Vercel Blob
- Browser caching works normally
- Backward compatible with existing images
