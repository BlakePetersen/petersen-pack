// ABOUTME: Client component for editing gallery settings
// ABOUTME: Collapsible panel with inline editing

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  name: string | null
  email: string
}

type ClientGallerySettingsProps = {
  galleryId: string
  title: string
  slug: string
  expiresAt: Date | null
  password: string | null
  status: string
  clientId: string
  clients: Client[]
}

export default function ClientGallerySettings({
  galleryId,
  title: initialTitle,
  slug: initialSlug,
  expiresAt: initialExpiresAt,
  password: initialPassword,
  status: initialStatus,
  clientId: initialClientId,
  clients,
}: ClientGallerySettingsProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: initialTitle,
    slug: initialSlug,
    expiresAt: initialExpiresAt
      ? initialExpiresAt.toISOString().split('T')[0]
      : '',
    password: initialPassword || '',
    status: initialStatus,
    clientId: initialClientId,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/client-galleries/${galleryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null,
          password: formData.password || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update gallery')
      }

      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      title: initialTitle,
      slug: initialSlug,
      expiresAt: initialExpiresAt
        ? initialExpiresAt.toISOString().split('T')[0]
        : '',
      password: initialPassword || '',
      status: initialStatus,
      clientId: initialClientId,
    })
    setIsEditing(false)
    setError('')
  }

  const currentClient = clients.find((c) => c.id === initialClientId)

  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Collapsed Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Settings
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Slug:{' '}
              <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">
                {initialSlug}
              </code>
            </span>
            <span>Password: {initialPassword ? '••••' : 'None'}</span>
            <span>Client: {currentClient?.name || currentClient?.email}</span>
          </div>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Title
                  </span>
                  <p className="mt-0.5 font-medium text-gray-900 dark:text-white">
                    {initialTitle}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Slug</span>
                  <p className="mt-0.5 font-medium text-gray-900 dark:text-white">
                    {initialSlug}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Status
                  </span>
                  <p className="mt-0.5 font-medium text-gray-900 dark:text-white">
                    {initialStatus}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Password
                  </span>
                  <p className="mt-0.5 font-medium text-gray-900 dark:text-white">
                    {initialPassword || 'None'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Expires
                  </span>
                  <p className="mt-0.5 font-medium text-gray-900 dark:text-white">
                    {initialExpiresAt
                      ? new Date(initialExpiresAt).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Client
                  </span>
                  <p className="mt-0.5 font-medium text-gray-900 dark:text-white">
                    {currentClient?.name || currentClient?.email || 'Unknown'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Edit settings →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label
                    htmlFor="title"
                    className="mb-1 block text-sm text-gray-600 dark:text-gray-400"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="slug"
                    className="mb-1 block text-sm text-gray-600 dark:text-gray-400"
                  >
                    Slug
                  </label>
                  <input
                    id="slug"
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="mb-1 block text-sm text-gray-600 dark:text-gray-400"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm text-gray-600 dark:text-gray-400"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="No password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="expiresAt"
                    className="mb-1 block text-sm text-gray-600 dark:text-gray-400"
                  >
                    Expires
                  </label>
                  <input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) =>
                      setFormData({ ...formData, expiresAt: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="clientId"
                    className="mb-1 block text-sm text-gray-600 dark:text-gray-400"
                  >
                    Client
                  </label>
                  <select
                    id="clientId"
                    value={formData.clientId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientId: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name || client.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
