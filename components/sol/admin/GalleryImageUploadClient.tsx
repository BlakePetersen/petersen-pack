// ABOUTME: Client component for gallery image upload interface
// ABOUTME: Handles gallery selection and integrates with ImageUploader

'use client'

import { useState } from 'react'
import { ImageUploader } from './ImageUploader'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger.edge'

interface Gallery {
  id: string
  title: string
}

interface GalleryImageUploadClientProps {
  galleries: Gallery[]
}

export default function GalleryImageUploadClient({
  galleries,
}: GalleryImageUploadClientProps) {
  const router = useRouter()
  const [selectedGalleryId, setSelectedGalleryId] = useState('')

  return (
    <div className="space-y-6">
      {/* Gallery Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Gallery *
        </label>
        <select
          value={selectedGalleryId}
          onChange={(e) => setSelectedGalleryId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Choose a gallery...</option>
          {galleries.map((gallery) => (
            <option key={gallery.id} value={gallery.id}>
              {gallery.title}
            </option>
          ))}
        </select>
      </div>

      {/* Image Uploader */}
      {selectedGalleryId && (
        <ImageUploader
          imageType="gallery"
          galleryId={selectedGalleryId}
          onImageSaved={(imageData) => {
            logger.info({ imageData }, 'Image saved')
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
