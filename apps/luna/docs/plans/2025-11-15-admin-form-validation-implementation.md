# Admin Form Validation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add client-side validation to all admin forms using react-hook-form and Zod schemas with real-time feedback on blur.

**Architecture:** Create shared Zod validators in `lib/validations/`, migrate each form to use react-hook-form with zodResolver, display validation errors immediately below fields with consistent styling.

**Tech Stack:** react-hook-form, Zod, @hookform/resolvers/zod

---

## Task 1: Create Common Validation Utilities

**Files:**

- Create: `lib/validations/common.ts`

**Step 1: Create common validation utilities file**

```typescript
// ABOUTME: Shared Zod validators for common field types
// ABOUTME: Used across all admin form schemas

import { z } from 'zod'

/**
 * Validates URL-safe slugs (lowercase, numbers, hyphens only)
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug too long')
  .regex(
    /^[a-z0-9-]+$/,
    'Slug must be lowercase letters, numbers, and hyphens only'
  )

/**
 * Validates optional URLs (allows empty string)
 */
export const optionalUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .optional()
  .or(z.literal(''))

/**
 * Validates required URLs
 */
export const requiredUrlSchema = z.string().url('Must be a valid URL')

/**
 * Validates image URLs with common extensions
 */
export const imageUrlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(url) ||
      url.includes('blob.vercel-storage.com') ||
      url.includes('cloudinary.com'),
    'Must be a valid image URL'
  )

/**
 * Validates dates within reasonable ranges
 */
export const dateRangeSchema = (
  minYearsAgo: number = 5,
  maxYearsAhead: number = 5
) => {
  const minDate = new Date()
  minDate.setFullYear(minDate.getFullYear() - minYearsAgo)

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + maxYearsAhead)

  return z.coerce
    .date()
    .min(minDate, `Date must be within the last ${minYearsAgo} years`)
    .max(maxDate, `Date must be within the next ${maxYearsAhead} years`)
}

/**
 * Validates positive currency amounts (in cents)
 */
export const currencySchema = z.coerce
  .number()
  .int('Amount must be a whole number')
  .positive('Amount must be positive')

/**
 * Validates non-negative integers
 */
export const nonNegativeIntSchema = z.coerce
  .number()
  .int('Must be a whole number')
  .min(0, 'Must be 0 or greater')
```

**Step 2: Commit common validators**

```bash
git add lib/validations/common.ts
git commit -m "feat: add common Zod validators for forms

Create reusable validators for slugs, URLs, dates, and currency.
These will be shared across all admin form schemas.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Create GalleryForm Validation Schema

**Files:**

- Create: `lib/validations/gallery.ts`

**Step 1: Create gallery validation schema**

```typescript
// ABOUTME: Zod validation schema for gallery creation and editing
// ABOUTME: Used in GalleryForm component and gallery API routes

import { z } from 'zod'
import { slugSchema } from './common'

export const galleryFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  slug: slugSchema,
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
  featured: z.boolean(),
})

export type GalleryFormInput = z.infer<typeof galleryFormSchema>
```

**Step 2: Commit gallery schema**

```bash
git add lib/validations/gallery.ts
git commit -m "feat: add gallery form validation schema

Define Zod schema for gallery title, slug, description, and featured fields.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Migrate GalleryForm to use react-hook-form

**Files:**

- Modify: `components/sol/admin/GalleryForm.tsx`

**Step 1: Update GalleryForm to use react-hook-form**

Replace the entire file content with:

```typescript
// ABOUTME: Gallery creation and editing form component
// ABOUTME: Handles gallery metadata input with validation

'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  galleryFormSchema,
  type GalleryFormInput,
} from '@/lib/validations/gallery'

interface GalleryFormProps {
  gallery?: {
    id: string
    title: string
    slug: string
    description: string | null
    featured: boolean
  }
}

export default function GalleryForm({ gallery }: GalleryFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GalleryFormInput>({
    resolver: zodResolver(galleryFormSchema),
    mode: 'onBlur',
    defaultValues: {
      title: gallery?.title || '',
      slug: gallery?.slug || '',
      description: gallery?.description || '',
      featured: gallery?.featured || false,
    },
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setValue('title', title)
    if (!gallery) {
      setValue('slug', generateSlug(title))
    }
  }

  const onSubmit = async (data: GalleryFormInput) => {
    try {
      const url = gallery ? `/api/galleries/${gallery.id}` : '/api/galleries'
      const method = gallery ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save gallery')
      }

      router.push('/admin/galleries')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Gallery Title *
        </label>
        <input
          type="text"
          {...register('title')}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={`w-full rounded-lg border px-4 py-2 focus:outline-none ${
            errors.title
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          placeholder="Summer Wedding 2024"
          aria-invalid={errors.title ? 'true' : 'false'}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p
            id="title-error"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL Slug *
        </label>
        <input
          type="text"
          {...register('slug')}
          className={`w-full rounded-lg border px-4 py-2 focus:outline-none ${
            errors.slug
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          placeholder="summer-wedding-2024"
          aria-invalid={errors.slug ? 'true' : 'false'}
          aria-describedby={errors.slug ? 'slug-error' : undefined}
        />
        {errors.slug && (
          <p
            id="slug-error"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {errors.slug.message}
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          URL: /portfolio/{watch('slug') || 'slug'}
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className={`w-full rounded-lg border px-4 py-2 focus:outline-none ${
            errors.description
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
          } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
          placeholder="Optional description for this gallery..."
          aria-invalid={errors.description ? 'true' : 'false'}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p
            id="description-error"
            className="mt-1 text-sm text-red-600 dark:text-red-400"
          >
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          {...register('featured')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="featured"
          className="ml-2 text-sm text-gray-700 dark:text-gray-300"
        >
          Feature on homepage
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving...'
            : gallery
              ? 'Update Gallery'
              : 'Create Gallery'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
```

**Step 2: Commit migrated GalleryForm**

```bash
git add components/sol/admin/GalleryForm.tsx
git commit -m "feat: migrate GalleryForm to react-hook-form with Zod validation

Replace manual state management with react-hook-form.
Add real-time validation on blur with clear error messages.
Display validation errors below fields with red styling.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Create HeroSlideForm Validation Schema

**Files:**

- Create: `lib/validations/hero-slide.ts`

**Step 1: Create hero slide validation schema**

```typescript
// ABOUTME: Zod validation schema for hero slide creation and editing
// ABOUTME: Used in HeroSlideForm component and hero slide API routes

import { z } from 'zod'
import { optionalUrlSchema, nonNegativeIntSchema } from './common'

export const heroSlideFormSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or less'),
    galleryId: z.string().optional().nullable(),
    imageId: z.string().optional().nullable(),
    imageUrl: optionalUrlSchema,
    linkUrl: optionalUrlSchema,
    linkText: z
      .string()
      .max(100, 'Link text must be 100 characters or less')
      .optional()
      .or(z.literal('')),
    sortOrder: nonNegativeIntSchema,
    isActive: z.boolean(),
  })
  .refine((data) => data.galleryId || data.imageId || data.imageUrl, {
    message: 'Must provide gallery, image, or upload URL',
    path: ['imageUrl'],
  })

export type HeroSlideFormInput = z.infer<typeof heroSlideFormSchema>
```

**Step 2: Commit hero slide schema**

```bash
git add lib/validations/hero-slide.ts
git commit -m "feat: add hero slide form validation schema

Define Zod schema with cross-field validation ensuring at least one image source.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Create Testimonial Validation Schema

**Files:**

- Create: `lib/validations/testimonial.ts`

**Step 1: Check TestimonialForm structure**

Run: `grep -A 20 "interface\|type" components/sol/admin/TestimonialForm.tsx`

**Step 2: Create testimonial validation schema**

```typescript
// ABOUTME: Zod validation schema for testimonial creation and editing
// ABOUTME: Used in TestimonialForm component and testimonial API routes

import { z } from 'zod'
import { optionalUrlSchema } from './common'

export const testimonialFormSchema = z.object({
  clientName: z
    .string()
    .min(1, 'Client name is required')
    .max(100, 'Name must be 100 characters or less'),
  content: z
    .string()
    .min(1, 'Testimonial content is required')
    .max(1000, 'Content must be 1000 characters or less'),
  imageUrl: optionalUrlSchema,
  featured: z.boolean(),
  displayOrder: z.coerce
    .number()
    .int('Must be a whole number')
    .min(0, 'Must be 0 or greater'),
})

export type TestimonialFormInput = z.infer<typeof testimonialFormSchema>
```

**Step 3: Commit testimonial schema**

```bash
git add lib/validations/testimonial.ts
git commit -m "feat: add testimonial form validation schema

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Create Pricing Validation Schemas

**Files:**

- Create: `lib/validations/pricing.ts`

**Step 1: Check pricing form structures**

Run: `grep -A 20 "interface\|type" components/sol/admin/PricingPackageForm.tsx components/sol/admin/PricingCategoryForm.tsx components/sol/admin/PricingAddOnForm.tsx | head -60`

**Step 2: Create pricing validation schemas**

```typescript
// ABOUTME: Zod validation schemas for pricing forms
// ABOUTME: Used in PricingPackageForm, PricingCategoryForm, and PricingAddOnForm

import { z } from 'zod'
import { currencySchema, nonNegativeIntSchema } from './common'

export const pricingPackageFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Package name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be 1000 characters or less'),
  price: currencySchema,
  sessionDuration: z
    .string()
    .min(1, 'Session duration is required')
    .max(50, 'Duration must be 50 characters or less'),
  imagesIncluded: nonNegativeIntSchema,
  retouchesIncluded: nonNegativeIntSchema,
  featured: z.boolean(),
  displayOrder: nonNegativeIntSchema,
  categoryId: z.string().optional().nullable(),
})

export const pricingCategoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  displayOrder: nonNegativeIntSchema,
})

export const pricingAddOnFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Add-on name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be 500 characters or less'),
  price: currencySchema,
  displayOrder: nonNegativeIntSchema,
})

export type PricingPackageFormInput = z.infer<typeof pricingPackageFormSchema>
export type PricingCategoryFormInput = z.infer<typeof pricingCategoryFormSchema>
export type PricingAddOnFormInput = z.infer<typeof pricingAddOnFormSchema>
```

**Step 3: Commit pricing schemas**

```bash
git add lib/validations/pricing.ts
git commit -m "feat: add pricing form validation schemas

Define schemas for packages, categories, and add-ons.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Create BlogPost Validation Schema

**Files:**

- Create: `lib/validations/blog-post.ts`

**Step 1: Check BlogPostForm structure**

Run: `grep -A 30 "interface\|type" components/sol/admin/BlogPostForm.tsx`

**Step 2: Create blog post validation schema**

```typescript
// ABOUTME: Zod validation schema for blog post creation and editing
// ABOUTME: Used in BlogPostForm component and blog post API routes

import { z } from 'zod'
import { slugSchema, imageUrlSchema } from './common'

export const blogPostFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  slug: slugSchema,
  excerpt: z
    .string()
    .min(1, 'Excerpt is required')
    .max(500, 'Excerpt must be 500 characters or less'),
  content: z.string().min(1, 'Content is required'),
  featuredImageUrl: z
    .string()
    .refine(
      (url) =>
        !url ||
        /\.(jpg|jpeg|png|webp|gif)$/i.test(url) ||
        url.includes('blob.vercel-storage.com'),
      'Must be a valid image URL'
    )
    .optional()
    .or(z.literal('')),
  published: z.boolean(),
  categoryId: z.string().optional().nullable(),
})

export type BlogPostFormInput = z.infer<typeof blogPostFormSchema>
```

**Step 3: Commit blog post schema**

```bash
git add lib/validations/blog-post.ts
git commit -m "feat: add blog post form validation schema

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Create ClientGallery Validation Schema

**Files:**

- Create: `lib/validations/client-gallery.ts`

**Step 1: Check ClientGalleryForm structure**

Run: `grep -A 30 "interface\|type" components/sol/admin/ClientGalleryForm.tsx`

**Step 2: Create client gallery validation schema**

```typescript
// ABOUTME: Zod validation schema for client gallery creation and editing
// ABOUTME: Used in ClientGalleryForm component and client gallery API routes

import { z } from 'zod'
import { slugSchema, dateRangeSchema } from './common'

export const clientGalleryFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  slug: slugSchema,
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .or(z.literal('')),
  clientId: z.string().min(1, 'Client is required'),
  shootDate: dateRangeSchema(),
  expiresAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean(),
})

export type ClientGalleryFormInput = z.infer<typeof clientGalleryFormSchema>
```

**Step 3: Commit client gallery schema**

```bash
git add lib/validations/client-gallery.ts
git commit -m "feat: add client gallery form validation schema

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Update ContractForm for Consistency

**Files:**

- Modify: `components/sol/admin/ContractForm.tsx`

**Step 1: Update ContractForm mode to onBlur**

Find the line:

```typescript
const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contractFormSchema),
```

Replace with:

```typescript
const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormInput>({
    resolver: zodResolver(contractFormSchema),
    mode: 'onBlur',
```

**Step 2: Update submit button to use isSubmitting**

Find:

```typescript
disabled = { isSubmitting }
```

Ensure it's using `formState.isSubmitting` from react-hook-form instead of local state.

**Step 3: Commit ContractForm updates**

```bash
git add components/sol/admin/ContractForm.tsx
git commit -m "refactor: update ContractForm for consistency

Use onBlur validation mode and formState.isSubmitting.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Manual Testing Checklist

**Test Each Form:**

1. **GalleryForm** (`/admin/galleries/new`)
   - Leave title empty and blur → See "Title is required"
   - Enter title with special chars, blur slug field → See slug validation error
   - Enter 201 character title → See length error
   - Fill valid data and submit → Gallery created successfully

2. **TestimonialForm** (`/admin/testimonials/new`)
   - Leave client name empty → See error on blur
   - Enter 1001 character content → See length error
   - Fill valid data → Testimonial created

3. **PricingPackageForm** (`/admin/pricing/packages/new`)
   - Enter negative price → See "must be positive" error
   - Leave name empty → See required error
   - Fill valid data → Package created

4. **BlogPostForm** (`/admin/blog/new`)
   - Enter slug with uppercase → See slug format error
   - Leave title empty → See required error
   - Fill valid data → Post created

5. **ClientGalleryForm** (`/admin/client-galleries/new`)
   - Enter invalid slug → See format error
   - Select no client → See "Client is required"
   - Fill valid data → Gallery created

6. **HeroSlideForm** (`/admin/hero-slides/new`)
   - Leave all image fields empty → See "Must provide gallery, image, or upload URL"
   - Enter negative sort order → See validation error
   - Fill valid data → Slide created

7. **ContractForm** (`/admin/contracts/new`)
   - Verify onBlur validation works
   - Enter negative amounts → See errors
   - Fill valid data → Contract created

**Expected Results:**

- All forms validate on blur
- Error messages display immediately below fields in red
- Invalid fields have red borders
- Submit button disables during submission
- No form submits with invalid data

---

## Task 11: Final Commit and Summary

**Step 1: Run type check**

```bash
pnpm type-check
```

Expected: No TypeScript errors

**Step 2: Create final summary commit**

```bash
git commit --allow-empty -m "docs: admin form validation complete

All admin forms now use react-hook-form with Zod validation:
- GalleryForm
- HeroSlideForm
- TestimonialForm
- PricingPackageForm, PricingCategoryForm, PricingAddOnForm
- BlogPostForm
- ClientGalleryForm
- ContractForm (updated for consistency)

Real-time validation on blur with clear error messages.
Consistent UX across all forms.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Notes for Implementation

**DRY Principle:**

- All common validators are in `lib/validations/common.ts`
- No duplication of validation logic
- Reuse schemas across components and API routes

**YAGNI Principle:**

- Only validate what's necessary
- No over-engineered validation rules
- Keep schemas simple and maintainable

**Testing:**

- Manual testing checklist covers all forms
- Test both valid and invalid inputs
- Verify error messages are clear and helpful

**Commits:**

- Small, focused commits after each task
- Clear commit messages describing changes
- Frequent commits to track progress

**Common Issues:**

- If TypeScript errors occur, check import paths
- If validation doesn't trigger, verify `mode: 'onBlur'` is set
- If errors don't display, check error message rendering
