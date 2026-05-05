// ABOUTME: Pricing package creation and editing form component
// ABOUTME: Handles package input with features management

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PricingPackageFormProps {
  pkg?: {
    id: string
    categoryId: string
    name: string
    price: number
    duration: string
    features: string[]
    isPopular: boolean
    isActive: boolean
  }
  categories: Array<{
    id: string
    name: string
  }>
  categoryId?: string
}

export default function PricingPackageForm({
  pkg,
  categories,
  categoryId: initialCategoryId,
}: PricingPackageFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    categoryId: pkg?.categoryId || initialCategoryId || '',
    name: pkg?.name || '',
    price: pkg?.price || 0,
    duration: pkg?.duration || '',
    features: pkg?.features || [''],
    isPopular: pkg?.isPopular || false,
    isActive: pkg?.isActive ?? true,
  })

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }))
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!formData.categoryId) {
        throw new Error('Please select a category')
      }

      const filteredFeatures = formData.features.filter((f) => f.trim() !== '')

      const url = pkg
        ? `/api/admin/pricing/packages/${pkg.id}`
        : '/api/admin/pricing/packages'
      const method = pkg ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: filteredFeatures,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save package')
      }

      router.push('/admin/pricing')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!pkg) return
    if (!confirm('Are you sure you want to delete this package?')) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/pricing/packages/${pkg.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete package')
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
        <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category *
        </label>
        <select
          required
          value={formData.categoryId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Package Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="Premium Headshots"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-gray-500 dark:text-gray-400">
              $
            </span>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  price: parseInt(e.target.value) || 0,
                }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-8 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
              placeholder="500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Duration *
          </label>
          <input
            type="text"
            required
            value={formData.duration}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, duration: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
            placeholder="60 minutes"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Features
        </label>
        <div className="space-y-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
                placeholder="Feature description"
              />
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="rounded-lg bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFeature}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          + Add Feature
        </button>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPopular}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isPopular: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Mark as Popular
          </span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Active
          </span>
        </label>
      </div>

      <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isSubmitting
            ? 'Saving...'
            : pkg
              ? 'Update Package'
              : 'Create Package'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/pricing')}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>

        {pkg && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="ml-auto rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Delete Package
          </button>
        )}
      </div>
    </form>
  )
}
