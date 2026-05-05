// ABOUTME: Gallery publish/unpublish and preview link controls
// ABOUTME: Provides UI for managing gallery visibility and generating preview links

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger.edge'

interface GalleryPublishControlsProps {
  galleryId: string
  gallerySlug: string
  status: 'DRAFT' | 'PUBLISHED'
}

interface PreviewToken {
  id: string
  token: string
  expiresAt: string
}

export default function GalleryPublishControls({
  galleryId,
  gallerySlug,
  status,
}: GalleryPublishControlsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [previewToken, setPreviewToken] = useState<PreviewToken | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const handlePublish = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/galleries/${galleryId}/publish`,
        {
          method: 'POST',
        }
      )
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to publish')
    }
    setIsLoading(false)
  }

  const handleUnpublish = async () => {
    if (
      !confirm(
        'Unpublish this gallery? It will no longer be visible on the public site.'
      )
    ) {
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/galleries/${galleryId}/unpublish`,
        {
          method: 'POST',
        }
      )
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to unpublish')
    }
    setIsLoading(false)
  }

  const handleGeneratePreview = async (duration: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/preview-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceType: 'gallery',
          resourceId: galleryId,
          duration,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        setPreviewToken(data)
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to generate preview')
    }
    setIsLoading(false)
  }

  const previewUrl = previewToken
    ? `${window.location.origin}/preview/portfolio/${gallerySlug}?token=${previewToken.token}`
    : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      {status === 'DRAFT' ? (
        <button
          onClick={handlePublish}
          disabled={isLoading}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Publishing...' : 'Publish'}
        </button>
      ) : (
        <button
          onClick={handleUnpublish}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {isLoading ? 'Unpublishing...' : 'Unpublish'}
        </button>
      )}

      <button
        onClick={() => setShowPreviewModal(true)}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        Share Preview
      </button>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Generate Preview Link
            </h3>

            {!previewToken ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a shareable link to preview this gallery. Choose how
                  long the link should be valid:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGeneratePreview('1h')}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    1 Hour
                  </button>
                  <button
                    onClick={() => handleGeneratePreview('24h')}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    24 Hours
                  </button>
                  <button
                    onClick={() => handleGeneratePreview('7d')}
                    disabled={isLoading}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    7 Days
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share this link with anyone to let them preview the gallery:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={previewUrl}
                    className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                  />
                  <button
                    onClick={handleCopy}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Expires: {new Date(previewToken.expiresAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPreviewModal(false)
                  setPreviewToken(null)
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
