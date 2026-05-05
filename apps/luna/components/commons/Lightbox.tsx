// ABOUTME: Unified lightbox component for image galleries
// ABOUTME: Features parallax, fade transitions, swipe gestures, and keyboard controls

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'

interface LightboxImage {
  id?: string
  url: string
  altText?: string | null
  width?: number | null
  height?: number | null
}

interface LightboxProps {
  images: LightboxImage[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
  title?: string
  unoptimized?: boolean
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
  title,
  unoptimized = false,
}: LightboxProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [displayIndex, setDisplayIndex] = useState(currentIndex)
  const [imageOpacity, setImageOpacity] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  // Detect touch device via lazy initial state (avoids lint error about setState in effect)
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // Open animation
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  // Navigate: instant swap, fade in new image
  const goToImage = useCallback(
    (index: number) => {
      if (index === displayIndex) return

      // Immediately swap to new image
      setDisplayIndex(index)
      setImageOpacity(0)
      setIsTransitioning(true)
      onNavigate(index)
    },
    [displayIndex, onNavigate]
  )

  // When new image loads, fade it in
  const handleImageLoad = useCallback(() => {
    // Fade in the new image
    requestAnimationFrame(() => {
      setImageOpacity(1)
    })
    // Mark transition complete after fade in
    setTimeout(() => {
      setIsTransitioning(false)
    }, 100)
  }, [])

  const nextImage = useCallback(() => {
    const next = (displayIndex + 1) % images.length
    goToImage(next)
  }, [displayIndex, images.length, goToImage])

  const prevImage = useCallback(() => {
    const prev = (displayIndex - 1 + images.length) % images.length
    goToImage(prev)
  }, [displayIndex, images.length, goToImage])

  // Close with animation
  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }, [onClose])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        nextImage()
      }
      if (e.key === 'ArrowLeft') prevImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [handleClose, nextImage, prevImage])

  // Mouse move for parallax (desktop only)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isTouchDevice) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setMousePosition({ x, y })
    },
    [isTouchDevice]
  )

  // Touch handlers for swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const minSwipeDistance = 50

      // Only navigate if horizontal swipe is dominant
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > minSwipeDistance
      ) {
        if (deltaX > 0) {
          prevImage()
        } else {
          nextImage()
        }
      }

      touchStartRef.current = null
    },
    [nextImage, prevImage]
  )

  // Preload adjacent images
  useEffect(() => {
    if (images.length <= 1) return

    const preloadImage = (src: string) => {
      const img = new window.Image()
      img.src = src
    }

    const nextIdx = (displayIndex + 1) % images.length
    const prevIdx = (displayIndex - 1 + images.length) % images.length

    preloadImage(images[nextIdx].url)
    preloadImage(images[prevIdx].url)
  }, [displayIndex, images])

  const currentImage = images[displayIndex]

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center transition-all duration-300 ease-out ${
        isVisible ? 'bg-black/95' : 'bg-black/0'
      }`}
      onClick={handleClose}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close button - larger on mobile for easier tapping */}
      <button
        className={`absolute right-3 top-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-black/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-4 md:top-4 md:h-10 md:w-10 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          handleClose()
        }}
        aria-label="Close lightbox"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Title and counter */}
      <div
        className={`absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-5 py-2 backdrop-blur-sm transition-all duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-center gap-3">
          {title && (
            <span className="text-sm font-medium text-white">{title}</span>
          )}
          <span className="text-sm text-white/70">
            {displayIndex + 1} of {images.length}
          </span>
        </div>
      </div>

      {/* Previous button - larger touch target on mobile */}
      {images.length > 1 && (
        <button
          className={`absolute left-2 z-20 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-black/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:left-4 md:h-12 md:w-12 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${isTransitioning ? 'pointer-events-none' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            prevImage()
          }}
          aria-label="Previous image"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Next button - larger touch target on mobile */}
      {images.length > 1 && (
        <button
          className={`absolute right-2 z-20 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-black/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:right-4 md:h-12 md:w-12 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${isTransitioning ? 'pointer-events-none' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            nextImage()
          }}
          aria-label="Next image"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Image container - single layer that fades out/in */}
      <div
        className={`relative flex items-center justify-center transition-all duration-300 ease-out ${
          isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        style={{
          width: '90vw',
          height: '80vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-center"
          style={{
            opacity: imageOpacity,
            transition: 'opacity 100ms ease-out',
          }}
        >
          <div className="relative overflow-hidden shadow-2xl">
            <Image
              src={currentImage.url}
              alt={currentImage.altText || 'Gallery image'}
              width={currentImage.width || 1200}
              height={currentImage.height || 800}
              className="h-auto max-h-[80vh] w-auto max-w-[90vw] object-contain"
              style={
                isTouchDevice
                  ? undefined
                  : {
                      transform: `scale(1.02) translate(${(mousePosition.x - 0.5) * -20}px, ${(mousePosition.y - 0.5) * -20}px)`,
                      transition:
                        'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }
              }
              quality={95}
              priority
              unoptimized={unoptimized}
              onLoad={handleImageLoad}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
