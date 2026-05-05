// ABOUTME: Form component for creating/editing client galleries
// ABOUTME: Handles client gallery details, access controls, and expiration

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientGalleryForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    password: '',
    expiresInDays: '30',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/client-galleries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create gallery')
      }

      const data = await response.json()
      router.push(`/admin/clients/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Gallery Details
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Gallery Title *
            </label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Smith Family Wedding"
            />
            {formData.title && (
              <p className="mt-1 text-sm text-gray-500">
                URL: /client/{generateSlug(formData.title)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Client Information
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="clientName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Client Name *
            </label>
            <input
              id="clientName"
              type="text"
              required
              value={formData.clientName}
              onChange={(e) =>
                setFormData({ ...formData, clientName: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label
              htmlFor="clientEmail"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Client Email *
            </label>
            <input
              id="clientEmail"
              type="email"
              required
              value={formData.clientEmail}
              onChange={(e) =>
                setFormData({ ...formData, clientEmail: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="john@example.com"
            />
            <p className="mt-1 text-sm text-gray-500">
              A user account will be created for this email if it doesn&apos;t
              exist
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Access Control
        </h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Gallery Password (Optional)
            </label>
            <input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Leave empty for email-only access"
            />
            <p className="mt-1 text-sm text-gray-500">
              If set, clients will need this password in addition to logging in
            </p>
          </div>

          <div>
            <label
              htmlFor="expiresInDays"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Expires In
            </label>
            <select
              id="expiresInDays"
              value={formData.expiresInDays}
              onChange={(e) =>
                setFormData({ ...formData, expiresInDays: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="0">Never</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Gallery will be automatically hidden after this period
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Gallery'}
        </button>
      </div>
    </form>
  )
}
