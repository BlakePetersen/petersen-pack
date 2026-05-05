// ABOUTME: Client component for uploading About section image
// ABOUTME: Handles image upload and linking to HomepageContent

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditableImage } from '@/components/sol/EditableImage'
import { logger } from '@/lib/logger.edge'

type ImageData = {
  id: string
  url: string
  altText: string | null
  width: number | null
  height: number | null
  focalX: number | null
  focalY: number | null
  cropX: number | null
  cropY: number | null
  cropWidth: number | null
  cropHeight: number | null
  cropAspectRatio: string | null
  flipHorizontal: boolean | null
  flipVertical: boolean | null
}

interface HomepageImageUploadClientProps {
  currentImage: ImageData | null
}

export function HomepageImageUploadClient({
  currentImage,
}: HomepageImageUploadClientProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="space-y-8">
      {currentImage ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Image</h2>
          <div
            className="relative max-w-md overflow-hidden rounded-lg bg-gray-200"
            style={{
              aspectRatio:
                currentImage.cropAspectRatio?.replace(':', ' / ') || '3 / 4',
            }}
          >
            <EditableImage
              imageId={currentImage.id}
              imageType="standalone"
              imageData={{
                focalX: currentImage.focalX,
                focalY: currentImage.focalY,
                cropX: currentImage.cropX,
                cropY: currentImage.cropY,
                cropWidth: currentImage.cropWidth,
                cropHeight: currentImage.cropHeight,
                cropAspectRatio: currentImage.cropAspectRatio,
                flipHorizontal: currentImage.flipHorizontal,
                flipVertical: currentImage.flipVertical,
              }}
              displayAspectRatio={
                currentImage.cropAspectRatio?.replace(':', ' / ') || undefined
              }
              src={currentImage.url}
              alt={currentImage.altText || 'About section image'}
              width={800}
              height={1066}
              className="object-cover"
            />
          </div>
          <p className="text-sm text-gray-600">
            Click the edit button on the image to adjust crop and focal point
          </p>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">
            No image set for the About section yet
          </p>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {currentImage ? 'Replace Image' : 'Upload Image'}
        </h2>
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
        )}
        <div className="flex gap-3">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return

              if (file.size > 10 * 1024 * 1024) {
                setError('Image must be less than 10MB')
                return
              }

              setUploading(true)
              setError(null)

              try {
                logger.info({ name: file.name }, 'Uploading file')
                // Upload to server as standalone image (creates DB record)
                const formData = new FormData()
                formData.append('file', file)
                formData.append('type', 'standalone')

                const uploadResponse = await fetch('/api/upload', {
                  method: 'POST',
                  body: formData,
                })

                if (!uploadResponse.ok) {
                  throw new Error('Failed to upload image')
                }

                const uploadData = await uploadResponse.json()
                logger.info({ uploadData }, 'Upload response')

                // Link the uploaded image to the About section
                const linkResponse = await fetch(
                  '/api/admin/homepage-content/about',
                  {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageId: uploadData.id }),
                  }
                )

                if (!linkResponse.ok) {
                  throw new Error('Failed to link image')
                }

                const linkData = await linkResponse.json()
                logger.info({ linkData }, 'Link response')

                logger.info('Refreshing page...')
                router.refresh()

                // Clear the file input
                e.target.value = ''
              } catch (err) {
                logger.error({ err: err }, 'Error uploading image')
                setError(
                  err instanceof Error ? err.message : 'Failed to upload image'
                )
              } finally {
                setUploading(false)
              }
            }}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
        {uploading && (
          <p className="text-sm text-gray-600">
            Uploading and linking image...
          </p>
        )}
      </div>
    </div>
  )
}
