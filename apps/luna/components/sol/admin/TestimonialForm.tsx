// ABOUTME: Form component for creating and editing testimonials
// ABOUTME: Handles testimonial CRUD with validation

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Testimonial = {
  id: string
  clientName: string
  clientPhoto: string | null
  projectType: string
  serviceType: string | null
  location: string | null
  quote: string
  rating: number
  featured: boolean
  videoUrl: string | null
  caseStudyUrl: string | null
  sortOrder: number
  isActive: boolean
}

type TestimonialFormProps = {
  testimonial?: Testimonial
}

export default function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    clientName: testimonial?.clientName || '',
    clientPhoto: testimonial?.clientPhoto || '',
    projectType: testimonial?.projectType || '',
    serviceType: testimonial?.serviceType || '',
    location: testimonial?.location || '',
    quote: testimonial?.quote || '',
    rating: testimonial?.rating || 5,
    featured: testimonial?.featured ?? false,
    videoUrl: testimonial?.videoUrl || '',
    caseStudyUrl: testimonial?.caseStudyUrl || '',
    sortOrder: testimonial?.sortOrder || 0,
    isActive: testimonial?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    setIsLoading(true)

    try {
      const url = testimonial
        ? `/api/admin/testimonials/${testimonial.id}`
        : '/api/admin/testimonials'

      const method = testimonial ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save testimonial')
      }

      router.push('/admin/testimonials')
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save testimonial'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!testimonial) return

    if (
      !confirm(
        'Are you sure you want to delete this testimonial? This action cannot be undone.'
      )
    ) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/admin/testimonials/${testimonial.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete testimonial')
      }

      router.push('/admin/testimonials')
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete testimonial'
      )
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value)
            : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="clientName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Client Name *
        </label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="John Smith"
        />
      </div>

      <div>
        <label
          htmlFor="clientPhoto"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Client Photo URL
        </label>
        <input
          type="url"
          id="clientPhoto"
          name="clientPhoto"
          value={formData.clientPhoto}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="https://example.com/photo.jpg"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Optional - Add with client permission only
        </p>
      </div>

      <div>
        <label
          htmlFor="projectType"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Project Type *
        </label>
        <input
          type="text"
          id="projectType"
          name="projectType"
          value={formData.projectType}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="e.g., Family Portrait, Wedding, Headshot"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="serviceType"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Service Type
          </label>
          <input
            type="text"
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="e.g., Wedding, Family, Maternity"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            For filtering on service pages
          </p>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="e.g., San Francisco, CA"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="quote"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Testimonial Quote *
        </label>
        <textarea
          id="quote"
          name="quote"
          value={formData.quote}
          onChange={handleChange}
          required
          rows={4}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="Working with Ashley was an amazing experience..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="videoUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Video Testimonial URL
          </label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="https://youtube.com/..."
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optional - Link to video testimonial
          </p>
        </div>

        <div>
          <label
            htmlFor="caseStudyUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Case Study URL
          </label>
          <input
            type="url"
            id="caseStudyUrl"
            name="caseStudyUrl"
            value={formData.caseStudyUrl}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="/blog/client-story-slug"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optional - Link to full story/blog post
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="rating"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Rating (1-5) *
          </label>
          <input
            type="number"
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            required
            min="1"
            max="5"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="sortOrder"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Sort Order *
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Lower numbers appear first
          </p>
        </div>

        <div className="flex items-end">
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t pt-6 dark:border-gray-700">
        <div>
          {testimonial && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : testimonial ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </form>
  )
}
