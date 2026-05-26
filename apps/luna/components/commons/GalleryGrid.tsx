// ABOUTME: Gallery grid component with lightbox
// ABOUTME: Displays images in masonry-style grid with fullscreen modal

'use client'

import { useState, useEffect, useRef } from 'react'
import { EditableImage } from '@/components/sol/EditableImage'
import { cardStyles } from './Card'
import Lightbox from './Lightbox'

interface ImageData {
  id: string
  url: string
  altText: string | null
  width: number | null
  height: number | null
  focalX?: number | null
  focalY?: number | null
  cropX?: number | null
  cropY?: number | null
  cropWidth?: number | null
  cropHeight?: number | null
  cropAspectRatio?: string | null
}

interface GalleryGridProps {
  images: ImageData[]
  title?: string
}

export default function GalleryGrid({ images, title }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set())
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up'>('down')
  const imageRefs = useRef<(HTMLButtonElement | null)[]>([])
  const lastScrollY = useRef(0)

  // Track scroll direction
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down')
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up')
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Distribute images across columns more evenly
  const distributeImages = () => {
    const columns: number[][] = [[], [], []] // 3 columns
    const columnHeights = [0, 0, 0]

    images.forEach((image, index) => {
      const aspectRatio =
        image.width && image.height ? image.width / image.height : 1
      const estimatedHeight = 400 / aspectRatio // Approximate rendered height

      // Find column with least height
      const shortestColumnIndex = columnHeights.indexOf(
        Math.min(...columnHeights)
      )

      columns[shortestColumnIndex].push(index)
      columnHeights[shortestColumnIndex] += estimatedHeight
    })

    return columns
  }

  const columnDistribution = distributeImages()

  // Intersection Observer to detect when images scroll into view
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    imageRefs.current.forEach((ref, index) => {
      if (!ref) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleImages((prev) => new Set(prev).add(index))
          }
        },
        { threshold: 0.1 }
      )

      observer.observe(ref)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [images.length])

  // Helper to get column index for an image
  const getColumnIndex = (imageIndex: number): number => {
    for (let colIdx = 0; colIdx < columnDistribution.length; colIdx++) {
      if (columnDistribution[colIdx].includes(imageIndex)) {
        return colIdx
      }
    }
    return 0
  }

  // Render function for individual image
  const renderImage = (index: number) => {
    const image = images[index]
    const columnIndex = getColumnIndex(index)
    const columnDelay = columnIndex * 50 // 0ms, 50ms, 100ms
    const isVisible = visibleImages.has(index)

    return (
      <button
        key={image.id}
        ref={(el) => {
          imageRefs.current[index] = el
        }}
        className={`group relative w-full hover:z-10 hover:scale-[1.33] ${cardStyles.base} ${cardStyles.shadow} ${cardStyles.shadowHover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
          isVisible
            ? 'translate-y-0 opacity-100'
            : scrollDirection === 'down'
              ? 'translate-y-8 opacity-0'
              : '-translate-y-8 opacity-0'
        }`}
        onClick={() => setSelectedIndex(index)}
        aria-label={
          image.altText || `Gallery image ${index + 1} of ${images.length}`
        }
        style={{
          transition:
            'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease-out, z-index 0s 0.8s',
          transitionDelay: `${columnDelay}ms`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transitionDelay = `${columnDelay}ms, ${columnDelay}ms, 0s, 0s`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transitionDelay = `${columnDelay}ms, ${columnDelay}ms, 0s, 0.8s`
        }}
      >
        <EditableImage
          imageId={image.id}
          imageType="gallery"
          imageData={{
            focalX: image.focalX,
            focalY: image.focalY,
            cropX: image.cropX,
            cropY: image.cropY,
            cropWidth: image.cropWidth,
            cropHeight: image.cropHeight,
            cropAspectRatio: image.cropAspectRatio,
          }}
          src={image.url}
          alt={image.altText || `Gallery image ${index + 1}`}
          width={image.width || 800}
          height={image.height || 600}
          className="w-full object-cover transition-transform duration-[1400ms] group-hover:scale-[1.15]"
          style={{ transitionTimingFunction: 'cubic-bezier(0, 0, 0.1, 1)' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading={index < 6 ? undefined : 'lazy'}
          placeholder="blur"
          blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='1'/%3E%3C/filter%3E%3Crect width='8' height='6' fill='%239ca3af' filter='url(%23b)'/%3E%3C/svg%3E"
        />
        {/* Hover glint overlay */}
        <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />
      </button>
    )
  }

  return (
    <>
      {/* Grid - 3 explicit columns with balanced distribution */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Column 1 */}
        <div className="flex flex-col gap-8">
          {columnDistribution[0].map((imageIndex) => renderImage(imageIndex))}
        </div>

        {/* Column 2 */}
        <div className="hidden flex-col gap-8 md:flex">
          {columnDistribution[1].map((imageIndex) => renderImage(imageIndex))}
        </div>

        {/* Column 3 */}
        <div className="hidden flex-col gap-8 lg:flex">
          {columnDistribution[2].map((imageIndex) => renderImage(imageIndex))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <Lightbox
          images={images.map((img) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            width: img.width,
            height: img.height,
          }))}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onNavigate={setSelectedIndex}
          title={title}
        />
      )}
    </>
  )
}
