// ABOUTME: Button component that opens the client gallery upload modal
// ABOUTME: Wrapper for ClientGalleryImageUpload modal

'use client'

import { useState } from 'react'
import ClientGalleryImageUpload from './ClientGalleryImageUpload'

interface ClientGalleryUploadButtonProps {
  galleryId: string
  variant?: 'default' | 'large'
}

export default function ClientGalleryUploadButton({
  galleryId,
  variant = 'default',
}: ClientGalleryUploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (variant === 'large') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Upload Your First Image
        </button>
        {isOpen && (
          <ClientGalleryImageUpload
            galleryId={galleryId}
            onClose={() => setIsOpen(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Upload Images
      </button>
      {isOpen && (
        <ClientGalleryImageUpload
          galleryId={galleryId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
