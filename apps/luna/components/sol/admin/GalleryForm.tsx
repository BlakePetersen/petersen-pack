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
          aria-describedby={
            errors.description ? 'description-error' : undefined
          }
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
