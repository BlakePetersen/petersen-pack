# Admin Form Validation Design

**Date:** 2025-11-15
**Status:** Approved

## Problem

Admin forms lack real-time validation feedback. Users discover errors only after submission fails. Forms use inconsistent validation approaches, creating confusion.

## Goals

- Provide real-time validation feedback as users interact with forms
- Use consistent validation across all admin forms
- Validate data client-side before submission
- Maintain accessibility standards

## Solution Overview

Standardize all admin forms on react-hook-form with Zod schemas. Validate fields on blur. Provide clear, immediate error messages.

## Architecture

### Validation Schema Organization

Store all Zod schemas in `lib/validations/`:

- One file per form type: `gallery.ts`, `hero-slide.ts`, `blog-post.ts`
- Each file exports the schema, input type, and custom validators
- Follow the pattern established by `contract.ts`

Structure:

```
lib/validations/
  ├── common.ts          # Shared validators
  ├── contract.ts        # Exists
  ├── gallery.ts         # New
  ├── hero-slide.ts      # New
  ├── blog-post.ts       # New
  └── ...
```

### Common Validators

Create `lib/validations/common.ts` with reusable validators:

- `slugSchema` - URL-safe strings (lowercase, hyphens, no special characters)
- `urlSchema` - Valid URL format (optional, allows empty)
- `imageUrlSchema` - Image URL with common extensions
- `dateRangeSchema` - Dates within reasonable ranges
- `fileSizeSchema` - File size limits based on type

## Form Implementation Pattern

### Standard Setup

Every admin form follows this pattern:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  galleryFormSchema,
  type GalleryFormInput,
} from '@/lib/validations/gallery'

export default function GalleryForm({ gallery }: Props) {
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
      // ...
    },
  })
}
```

### Error Display

Render error messages consistently under each field:

```typescript
{errors.fieldName && (
  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
    {errors.fieldName.message}
  </p>
)}
```

### Special Cases

- **Auto-generated slugs:** Use `watch()` and `setValue()` to update slug when title changes
- **File uploads:** Validate file type and size before upload, update form with URL after upload
- **Multi-step forms:** ContractForm keeps step state, validates per-step fields

## Validation Rules

### GalleryForm

```typescript
export const galleryFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must be lowercase letters, numbers, and hyphens only'
    )
    .max(100, 'Slug too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  featured: z.boolean(),
})
```

### HeroSlideForm

```typescript
export const heroSlideFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200),
    galleryId: z.string().optional().nullable(),
    imageId: z.string().optional().nullable(),
    imageUrl: z
      .string()
      .url('Must be a valid URL')
      .optional()
      .or(z.literal('')),
    linkUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    linkText: z.string().max(100).optional(),
    sortOrder: z.number().int().min(0, 'Must be 0 or greater'),
    isActive: z.boolean(),
  })
  .refine((data) => data.galleryId || data.imageId || data.imageUrl, {
    message: 'Must provide gallery, image, or upload URL',
    path: ['imageUrl'],
  })
```

### Common Patterns

- Optional URL fields: `.url().optional().or(z.literal(''))`
- Slug validation: Ensure URL-safe characters
- Cross-field validation: Use `.refine()` for complex rules

## User Experience

### Visual Feedback

- Invalid fields get red border on blur
- Error messages appear immediately below fields in red text
- Submit button shows loading state and disables during submission
- No success state on valid fields (less visual noise)

### Field Styling

```typescript
<input
  {...register('slug')}
  className={`w-full rounded-lg border px-4 py-2 focus:outline-none ${
    errors.slug
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500'
  }`}
  aria-invalid={errors.slug ? 'true' : 'false'}
  aria-describedby={errors.slug ? 'slug-error' : undefined}
/>
{errors.slug && (
  <p id="slug-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
    {errors.slug.message}
  </p>
)}
```

### Submit Behavior

- Form prevents submission if validation fails
- On submit error, scroll to first invalid field
- Server errors display in global error banner at top
- Success redirects remain unchanged (push to list page, refresh)

### Accessibility

- Add `aria-invalid` to fields with errors
- Link error messages with `aria-describedby`
- Ensure error messages have proper IDs for screen readers

## Implementation Strategy

### Migration Approach

1. Create shared validation infrastructure
2. Update forms one-by-one
3. Test each form before moving to next
4. Update existing ContractForm for consistency

### Migration Order

From simplest to most complex:

1. GalleryForm (4 fields)
2. TestimonialForm
3. PricingPackageForm, PricingCategoryForm, PricingAddOnForm
4. BlogPostForm
5. HeroSlideForm (file upload, conditional logic)
6. ClientGalleryForm
7. ContractForm (refine existing validation)

### Testing

- Test manually in dev environment after each form
- Verify both valid and invalid inputs
- Check error messages display correctly
- Ensure submit behavior works properly

### Backward Compatibility

- Forms keep same API contracts
- Server-side validation remains as final safety net
- Existing form data structures unchanged

## Success Criteria

- All admin forms use react-hook-form with Zod schemas
- Validation errors appear on blur
- Error messages provide clear, actionable feedback
- Forms prevent invalid data submission
- Consistent UX across all admin forms
