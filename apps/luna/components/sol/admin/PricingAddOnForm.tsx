// ABOUTME: Pricing add-on creation and editing form component
// ABOUTME: Handles add-on input for pricing management

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PricingAddOnFormProps {
  addOn?: {
    id: string
    name: string
    price: string
    unit: string
    isActive: boolean
  }
}

export default function PricingAddOnForm({ addOn }: PricingAddOnFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: addOn?.name || '',
    price: addOn?.price || '',
    unit: addOn?.unit || '',
    isActive: addOn?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const url = addOn
        ? `/api/admin/pricing/addons/${addOn.id}`
        : '/api/admin/pricing/addons'
      const method = addOn ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save add-on')
      }

      router.push('/admin/pricing')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!addOn) return
    if (!confirm('Are you sure you want to delete this add-on?')) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/pricing/addons/${addOn.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete add-on')
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
          Add-on Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="Rush Delivery (7 days)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Price *
          </label>
          <input
            type="text"
            required
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, price: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="200 or varies"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter a number or text like &quot;varies&quot;
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Unit *
          </label>
          <input
            type="text"
            required
            value={formData.unit}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, unit: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="per session"
          />
        </div>
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
            : addOn
              ? 'Update Add-on'
              : 'Create Add-on'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/admin/pricing')}
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        {addOn && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="ml-auto rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Delete Add-on
          </button>
        )}
      </div>
    </form>
  )
}
