// ABOUTME: Premium gallery component for post-final-payment experience
// ABOUTME: Luxury-themed image gallery with download functionality and champagne gold aesthetic

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { logger } from '@/lib/logger.edge'

type PremiumImage = {
  id: string
  url: string
  altText: string | null
  width: number | null
  height: number | null
  downloaded: boolean
}

type PremiumGalleryProps = {
  images: PremiumImage[]
  galleryId: string
  downloadQuotaRemaining: number
}

export default function PremiumGallery({
  images,
  galleryId,
  downloadQuotaRemaining: initialQuota,
}: PremiumGalleryProps) {
  const [downloadQuotaRemaining, setDownloadQuotaRemaining] =
    useState(initialQuota)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleDownload = async (imageId: string) => {
    if (downloadQuotaRemaining <= 0) {
      alert('Download quota exhausted. Please contact your photographer.')
      return
    }

    try {
      const response = await fetch(`/api/client-images/${imageId}/download`)

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Download failed')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `image-${imageId}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setDownloadQuotaRemaining((prev) => prev - 1)
    } catch (error) {
      logger.error({ err: error }, 'Download error')
      alert('Failed to download image')
    }
  }

  return (
    <div className="premium-gallery-container min-h-screen">
      {/* Header */}
      <header className="border-b border-[#d4af37]/20 bg-black">
        <div className="container mx-auto px-6 py-8">
          <h1 className="premium-header mb-2">Your Collection Awaits</h1>
          <p className="text-[#d4af37]/70">
            {images.length} {images.length === 1 ? 'image' : 'images'} ready for
            download
          </p>
          <p className="mt-2 text-body-sm text-[#d4af37]">
            Downloads remaining: {downloadQuotaRemaining}
          </p>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="container mx-auto px-6 py-12">
        {downloadQuotaRemaining === 0 && (
          <div className="mb-8 rounded-lg border border-[#d4af37]/30 bg-[#d4af37]/10 p-6">
            <h3 className="mb-2 font-serif text-heading-md text-[#d4af37]">
              Download Quota Exhausted
            </h3>
            <p className="text-white/80">
              You have used all your available downloads. Please contact your
              photographer for additional downloads.
            </p>
          </div>
        )}

        <div className="premium-grid">
          {images.map((image, index) => (
            <div key={image.id} className="premium-card animate-fade-in-up">
              <button
                onClick={() => setSelectedIndex(index)}
                className="group relative block h-full w-full overflow-hidden"
                aria-label={`View ${image.altText || `image ${index + 1}`}`}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `Gallery image ${index + 1}`}
                  width={image.width || 800}
                  height={image.height || 600}
                  className="h-full w-full object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  loading={index < 6 ? undefined : 'lazy'}
                />
              </button>

              {/* Download Button */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload(image.id)
                  }}
                  disabled={downloadQuotaRemaining === 0}
                  className="premium-download-btn"
                  aria-label={`Download ${image.altText || `image ${index + 1}`}`}
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            className="absolute right-4 top-4 text-4xl text-[#d4af37] hover:text-[#d4af37]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
            onClick={() => setSelectedIndex(null)}
            aria-label="Close lightbox"
          >
            ×
          </button>

          {/* Image counter */}
          <div
            className="absolute left-1/2 top-4 -translate-x-1/2 text-[#d4af37]"
            aria-live="polite"
            aria-atomic="true"
          >
            Image {selectedIndex + 1} of {images.length}
          </div>

          {/* Previous button */}
          {selectedIndex > 0 && (
            <button
              className="absolute left-4 text-5xl text-[#d4af37] hover:text-[#d4af37]/70"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex(selectedIndex - 1)
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Next button */}
          {selectedIndex < images.length - 1 && (
            <button
              className="absolute right-4 text-5xl text-[#d4af37] hover:text-[#d4af37]/70"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex(selectedIndex + 1)
              }}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={selectedIndex}
              src={images[selectedIndex].url}
              alt={images[selectedIndex].altText || ''}
              width={images[selectedIndex].width || 1200}
              height={images[selectedIndex].height || 800}
              className="h-auto max-h-[90vh] w-auto max-w-[90vw] animate-fade-in object-contain"
              quality={95}
            />
          </div>

          {/* Download button in lightbox */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDownload(images[selectedIndex].id)
            }}
            disabled={downloadQuotaRemaining === 0}
            className="premium-download-btn absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download High Resolution
          </button>
        </div>
      )}
    </div>
  )
}
