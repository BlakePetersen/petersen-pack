// ABOUTME: Client component for managing gallery images
// ABOUTME: Supports delete, reorder, alt text, favorites, artist picks, and retouch status

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ClientGalleryUploadButton from './ClientGalleryUploadButton'

type RetouchStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED'

type RetouchRequest = {
  id: string
  status: RetouchStatus
  notes: string | null
}

type ImageType = {
  id: string
  url: string
  altText: string | null
  sortOrder: number
  isFavorite: boolean
  isArtistPick: boolean
  retouchRequests: RetouchRequest[]
}

type ClientGalleryImageManagerProps = {
  galleryId: string
  images: ImageType[]
}

const retouchStatusConfig: Record<
  RetouchStatus,
  { bg: string; label: string }
> = {
  PENDING: { bg: 'bg-amber-500', label: 'Pending' },
  IN_PROGRESS: { bg: 'bg-blue-500', label: 'In Progress' },
  COMPLETED: { bg: 'bg-green-600', label: 'Completed' },
  DECLINED: { bg: 'bg-red-500', label: 'Declined' },
}

export default function ClientGalleryImageManager({
  galleryId,
  images: initialImages,
}: ClientGalleryImageManagerProps) {
  const router = useRouter()
  const [images, setImages] = useState(initialImages)
  const [editingAlt, setEditingAlt] = useState<string | null>(null)
  const [altText, setAltText] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [retouchMenuOpen, setRetouchMenuOpen] = useState<string | null>(null)

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    setIsLoading(imageId)
    setError('')

    try {
      const response = await fetch(`/api/admin/client-images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete image')
      }

      setImages(images.filter((img) => img.id !== imageId))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  const handleToggleFavorite = async (image: ImageType) => {
    setIsLoading(image.id)
    setError('')

    try {
      const response = await fetch(`/api/admin/client-images/${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !image.isFavorite }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update favorite')
      }

      setImages(
        images.map((img) =>
          img.id === image.id ? { ...img, isFavorite: !img.isFavorite } : img
        )
      )
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  const handleToggleArtistPick = async (image: ImageType) => {
    setIsLoading(image.id)
    setError('')

    try {
      const response = await fetch(`/api/admin/client-images/${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArtistPick: !image.isArtistPick }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update artist pick')
      }

      setImages(
        images.map((img) =>
          img.id === image.id
            ? { ...img, isArtistPick: !img.isArtistPick }
            : img
        )
      )
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  const handleRetouchStatusChange = async (
    retouchId: string,
    imageId: string,
    newStatus: RetouchStatus
  ) => {
    setIsLoading(imageId)
    setError('')
    setRetouchMenuOpen(null)

    try {
      const response = await fetch(
        `/api/admin/retouch-requests/${retouchId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update retouch status')
      }

      setImages(
        images.map((img) =>
          img.id === imageId
            ? {
                ...img,
                retouchRequests: img.retouchRequests.map((req) =>
                  req.id === retouchId ? { ...req, status: newStatus } : req
                ),
              }
            : img
        )
      )
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  const handleEditAlt = (image: ImageType) => {
    setEditingAlt(image.id)
    setAltText(image.altText || '')
  }

  const handleSaveAlt = async (imageId: string) => {
    setIsLoading(imageId)
    setError('')

    try {
      const response = await fetch(`/api/admin/client-images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update alt text')
      }

      setImages(
        images.map((img) => (img.id === imageId ? { ...img, altText } : img))
      )
      setEditingAlt(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(null)
    }
  }

  const handleDragStart = (e: React.DragEvent, imageId: string) => {
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input')) {
      e.preventDefault()
      return
    }
    setDraggedId(imageId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetId: string) => {
      e.preventDefault()

      if (!draggedId || draggedId === targetId) {
        setDraggedId(null)
        return
      }

      const draggedIndex = images.findIndex((img) => img.id === draggedId)
      const targetIndex = images.findIndex((img) => img.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedId(null)
        return
      }

      const reorderedImages = [...images]
      const [draggedImage] = reorderedImages.splice(draggedIndex, 1)
      reorderedImages.splice(targetIndex, 0, draggedImage)

      setImages(reorderedImages)
      setDraggedId(null)

      try {
        const response = await fetch(
          `/api/admin/client-galleries/${galleryId}/reorder`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageIds: reorderedImages.map((img) => img.id),
            }),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to save new order')
        }

        router.refresh()
      } catch {
        setImages(initialImages)
        setError('Failed to reorder images')
      }
    },
    [draggedId, images, galleryId, initialImages, router]
  )

  const getLatestRetouchRequest = (image: ImageType): RetouchRequest | null => {
    if (image.retouchRequests.length === 0) return null
    return image.retouchRequests[0]
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Images
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag to reorder
          </p>
        </div>
        <ClientGalleryUploadButton galleryId={galleryId} />
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {images.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No images yet
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Upload photos to share with your client
          </p>
          <div className="mt-4">
            <ClientGalleryUploadButton galleryId={galleryId} variant="large" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {images.map((image) => {
            const latestRetouch = getLatestRetouchRequest(image)

            return (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, image.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, image.id)}
                className={`group relative aspect-square cursor-move overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-all duration-200 dark:bg-gray-900 ${
                  draggedId === image.id
                    ? 'scale-95 opacity-50 ring-2 ring-blue-500'
                    : 'ring-1 ring-gray-200 hover:shadow-lg hover:ring-2 hover:ring-gray-300 dark:ring-gray-700 dark:hover:ring-gray-500'
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText || 'Gallery image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />

                {/* Top row: Retouch status (left) + Pick icons (right) */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                  {/* Retouch status badge */}
                  {latestRetouch ? (
                    <div className="relative">
                      <button
                        type="button"
                        draggable="false"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation()
                          e.preventDefault()
                          setRetouchMenuOpen(
                            retouchMenuOpen === latestRetouch.id
                              ? null
                              : latestRetouch.id
                          )
                        }}
                        className={`rounded-md px-2 py-1 text-xs font-semibold text-white shadow-md transition-transform hover:scale-105 ${retouchStatusConfig[latestRetouch.status].bg}`}
                        title="Click to change status"
                      >
                        {retouchStatusConfig[latestRetouch.status].label}
                      </button>

                      {retouchMenuOpen === latestRetouch.id && (
                        <div
                          className="absolute left-0 top-full z-20 mt-1 min-w-[120px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {(
                            Object.keys(retouchStatusConfig) as RetouchStatus[]
                          ).map((status) => (
                            <button
                              key={status}
                              type="button"
                              draggable="false"
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handleRetouchStatusChange(
                                  latestRetouch.id,
                                  image.id,
                                  status
                                )
                              }}
                              disabled={isLoading === image.id}
                              className={`block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                latestRetouch.status === status
                                  ? 'font-bold text-gray-900 dark:text-white'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {retouchStatusConfig[status].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Artist Pick + Client Favorite icons */}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      draggable="false"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleToggleArtistPick(image)
                      }}
                      disabled={isLoading === image.id}
                      className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all hover:scale-110 ${
                        image.isArtistPick
                          ? 'bg-purple-500 text-white'
                          : 'bg-black/40 text-white/80 hover:bg-black/60'
                      } ${isLoading === image.id ? 'opacity-50' : ''}`}
                      title={
                        image.isArtistPick
                          ? 'Remove artist pick'
                          : 'Mark as artist pick'
                      }
                    >
                      <StarIcon
                        className="h-4 w-4"
                        filled={image.isArtistPick}
                      />
                    </button>

                    <button
                      type="button"
                      draggable="false"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleToggleFavorite(image)
                      }}
                      disabled={isLoading === image.id}
                      className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all hover:scale-110 ${
                        image.isFavorite
                          ? 'bg-red-500 text-white'
                          : 'bg-black/40 text-white/80 hover:bg-black/60'
                      } ${isLoading === image.id ? 'opacity-50' : ''}`}
                      title={
                        image.isFavorite
                          ? 'Remove client favorite'
                          : 'Mark as client favorite'
                      }
                    >
                      <HeartIcon
                        className="h-4 w-4"
                        filled={image.isFavorite}
                      />
                    </button>
                  </div>
                </div>

                {/* Bottom overlay with action buttons */}
                <div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 opacity-0 transition-all duration-200 group-hover:opacity-100"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  {editingAlt === image.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Alt text"
                        className="w-full rounded border-0 bg-white/90 px-2 py-1.5 text-xs text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                        draggable="false"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          draggable="false"
                          onClick={() => handleSaveAlt(image.id)}
                          disabled={isLoading === image.id}
                          className="flex-1 rounded bg-white px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-100 disabled:opacity-50"
                        >
                          {isLoading === image.id ? '...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          draggable="false"
                          onClick={() => setEditingAlt(null)}
                          className="flex-1 rounded bg-white/20 px-2 py-1 text-xs font-medium text-white hover:bg-white/30"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        draggable="false"
                        onClick={() => handleEditAlt(image)}
                        disabled={isLoading === image.id}
                        className="flex-1 rounded bg-white/20 px-2 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-white/30 disabled:opacity-50"
                      >
                        Alt text
                      </button>
                      <button
                        type="button"
                        draggable="false"
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={isLoading === image.id}
                        className="rounded bg-red-500/80 px-2 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-red-500 disabled:opacity-50"
                      >
                        {isLoading === image.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function HeartIcon({
  className,
  filled,
}: {
  className?: string
  filled?: boolean
}) {
  return (
    <svg
      className={className}
      fill={filled ? 'currentColor' : 'none'}
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
  )
}

function StarIcon({
  className,
  filled,
}: {
  className?: string
  filled?: boolean
}) {
  return (
    <svg
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  )
}
