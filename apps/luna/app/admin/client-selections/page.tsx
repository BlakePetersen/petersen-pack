// ABOUTME: Admin page for viewing client image selections and retouch requests
// ABOUTME: Displays favorited images and retouch requests grouped by gallery

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { logger } from '@/lib/logger.edge'

type ClientImage = {
  id: string
  url: string
  altText: string | null
  width: number | null
  height: number | null
  isFavorite: boolean
  createdAt: Date
}

type GalleryWithFavorites = {
  id: string
  title: string
  slug: string
  client: {
    name: string | null
    email: string
  }
  images: ClientImage[]
}

type RetouchRequest = {
  id: string
  notes: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  clientImage: {
    id: string
    url: string
    altText: string | null
    width: number | null
    height: number | null
    clientGallery: {
      id: string
      title: string
      slug: string
      client: {
        name: string | null
        email: string
      }
    }
  }
}

export default function ClientSelectionsPage() {
  const [favorites, setFavorites] = useState<GalleryWithFavorites[]>([])
  const [retouchRequests, setRetouchRequests] = useState<RetouchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'favorites' | 'retouch'>(
    'favorites'
  )

  useEffect(() => {
    fetchSelections()
  }, [])

  const fetchSelections = async () => {
    try {
      const response = await fetch('/api/admin/client-selections')
      const data = await response.json()
      setFavorites(data.favorites)
      setRetouchRequests(data.retouchRequests)
    } catch (error) {
      logger.error({ err: error }, 'Error fetching client selections')
    } finally {
      setLoading(false)
    }
  }

  const updateRetouchStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/retouch-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Update local state
        setRetouchRequests((prev) =>
          prev.map((req) => (req.id === requestId ? { ...req, status } : req))
        )
      }
    } catch (error) {
      logger.error({ err: error }, 'Error updating retouch status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'DECLINED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Client Selections
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View client-favorited images and retouch requests
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`border-b-2 px-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'favorites'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Favorited Images (
            {favorites.reduce((sum, g) => sum + g.images.length, 0)})
          </button>
          <button
            onClick={() => setActiveTab('retouch')}
            className={`border-b-2 px-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === 'retouch'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Retouch Requests ({retouchRequests.length})
          </button>
        </nav>
      </div>

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="space-y-8">
          {favorites.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No favorites yet
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Clients haven&apos;t marked any images as favorites yet
              </p>
            </div>
          ) : (
            favorites.map((gallery) => (
              <div
                key={gallery.id}
                className="rounded-lg border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Gallery Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {gallery.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Client: {gallery.client.name || gallery.client.email}
                    </p>
                    <Link
                      href={`/client/${gallery.slug}`}
                      target="_blank"
                      className="mt-1 inline-block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Gallery →
                    </Link>
                  </div>
                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
                    {gallery.images.length} favorites
                  </span>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {gallery.images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-700"
                    >
                      <Image
                        src={image.url}
                        alt={image.altText || 'Favorited image'}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Retouch Requests Tab */}
      {activeTab === 'retouch' && (
        <div className="space-y-4">
          {retouchRequests.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No retouch requests
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Clients haven&apos;t requested any retouching yet
              </p>
            </div>
          ) : (
            retouchRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={request.clientImage.url}
                      alt={
                        request.clientImage.altText || 'Image for retouching'
                      }
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {request.clientImage.clientGallery.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Client:{' '}
                          {request.clientImage.clientGallery.client.name ||
                            request.clientImage.clientGallery.client.email}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(request.status)}`}
                      >
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>

                    {request.notes && (
                      <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Notes:</span>{' '}
                        {request.notes}
                      </p>
                    )}

                    <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                      Requested:{' '}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>

                    {/* Status Update Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          updateRetouchStatus(request.id, 'PENDING')
                        }
                        disabled={request.status === 'PENDING'}
                        className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() =>
                          updateRetouchStatus(request.id, 'IN_PROGRESS')
                        }
                        disabled={request.status === 'IN_PROGRESS'}
                        className="rounded bg-yellow-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() =>
                          updateRetouchStatus(request.id, 'COMPLETED')
                        }
                        disabled={request.status === 'COMPLETED'}
                        className="rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Completed
                      </button>
                      <button
                        onClick={() =>
                          updateRetouchStatus(request.id, 'DECLINED')
                        }
                        disabled={request.status === 'DECLINED'}
                        className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Declined
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
