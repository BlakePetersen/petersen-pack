// ABOUTME: Pricing category creation and editing form component
// ABOUTME: Handles category input for pricing management

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PricingCategoryFormProps {
  category?: {
    id: string
    name: string
    slug: string
    description: string | null
    isActive: boolean
  }
}

export default function PricingCategoryForm({
  category,
}: PricingCategoryFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    isActive: category?.isActive ?? true,
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: category ? prev.slug : generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const url = category
        ? `/api/admin/pricing/categories/${category.id}`
        : '/api/admin/pricing/categories'
      const method = category ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save category')
      }

      router.push('/admin/pricing')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!category) return
    if (
      !confirm(
        'Are you sure you want to delete this category? All packages in this category will also be deleted.'
      )
    )
      return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(
        `/api/admin/pricing/categories/${category.id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete category')
      }

      router.push('/admin/pricing')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Category Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Headshots"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          URL Slug *
        </label>
        <input
          type="text"
          required
          value={formData.slug}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, slug: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="headshots"
        />
        <p className="mt-1 text-sm text-gray-500">
          URL: /pricing#{formData.slug || 'slug'}
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Professional headshots for actors, corporate, and LinkedIn"
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex gap-4 border-t border-gray-200 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving...'
            : category
              ? 'Update Category'
              : 'Create Category'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/pricing')}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        {category && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="ml-auto rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Delete Category
          </button>
        )}
      </div>
    </form>
  )
}
