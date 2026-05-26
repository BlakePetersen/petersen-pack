// ABOUTME: Wrapper for making public images editable by admins
// ABOUTME: Shows edit button on hover when admin is logged in

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image, { ImageProps } from 'next/image'
import { Edit2 } from 'lucide-react'
import { ImageEditorModal } from './admin/ImageEditorModal'
import { getImageStyles } from '@/lib/image-utils'

type EditableImageProps = ImageProps & {
  imageId: string
  imageType: 'gallery' | 'service' | 'blog' | 'hero' | 'standalone'
  imageData?: {
    focalX?: number | null
    focalY?: number | null
    cropX?: number | null
    cropY?: number | null
    cropWidth?: number | null
    cropHeight?: number | null
    cropAspectRatio?: string | null
    flipHorizontal?: boolean | null
    flipVertical?: boolean | null
  }
  displayAspectRatio?: string
}

export function EditableImage({
  imageId,
  imageType,
  imageData,
  displayAspectRatio,
  ...imageProps
}: EditableImageProps) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Check admin status
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin))
      .catch(() => setIsAdmin(false))
  }, [])

  const handleSave = () => {
    router.refresh()
  }

  // Get crop/flip styles if imageData is provided
  const styles = imageData
    ? getImageStyles(
        {
          url: imageProps.src as string,
          focalX: imageData.focalX,
          focalY: imageData.focalY,
          cropX: imageData.cropX,
          cropY: imageData.cropY,
          cropWidth: imageData.cropWidth,
          cropHeight: imageData.cropHeight,
          cropAspectRatio: imageData.cropAspectRatio,
          flipHorizontal: imageData.flipHorizontal,
          flipVertical: imageData.flipVertical,
        },
        displayAspectRatio
      )
    : null

  // Check if we have crop data - if so, we manage positioning ourselves
  const hasCrop =
    imageData?.cropX != null &&
    imageData?.cropY != null &&
    imageData?.cropWidth != null &&
    imageData?.cropHeight != null

  // Extract fill and className, plus width/height for non-fill mode

  const { fill, className, width, height, ...restImageProps } =
    imageProps as ImageProps & { fill?: boolean }

  // Determine if we should use fill mode:
  // - If fill is explicitly true, use fill
  // - If fill is explicitly false, don't use fill
  // - If fill is undefined but width/height are provided, don't use fill (use dimensions)
  // - If fill is undefined and no width/height, use fill
  const hasExplicitDimensions = width != null && height != null
  const shouldUseFill =
    fill === true || (fill === undefined && !hasExplicitDimensions)

  // Remove aspectRatio from container styles (parent handles it)
  const containerStyle =
    hasCrop && styles?.container
      ? {
          ...styles.container,
          aspectRatio: undefined, // Parent container sets this
        }
      : undefined

  return (
    <div
      className="group relative h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={containerStyle}
    >
      {hasCrop ? (
        // When cropped, the container handles sizing via overflow
        // The image uses exact positioning from getImageStyles
        <img
          {...restImageProps}
          src={imageProps.src as string}
          alt={imageProps.alt}
          style={{ ...styles?.image }}
        />
      ) : shouldUseFill ? (
        // Use fill mode
        <Image
          {...restImageProps}
          fill={true}
          className={className}
          style={{ ...styles?.image }}
          alt={imageProps.alt}
        />
      ) : (
        // Use provided width/height
        <Image
          {...restImageProps}
          width={width}
          height={height}
          className={className}
          style={{ ...styles?.image }}
          alt={imageProps.alt}
        />
      )}

      {/* Edit Button (only for admins) */}
      {isAdmin && isHovered && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              e.stopPropagation()
              setIsEditing(true)
            }
          }}
          role="button"
          tabIndex={0}
          className="absolute right-2 top-2 z-10 cursor-pointer rounded-lg bg-black/50 p-2 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
          title="Edit image"
        >
          <Edit2 className="h-4 w-4" />
        </div>
      )}

      {/* Editor Modal */}
      {isEditing && (
        <ImageEditorModal
          imageId={imageId}
          imageType={imageType}
          imageUrl={imageProps.src as string}
          initialData={{
            focalX: imageData?.focalX ?? 0.5,
            focalY: imageData?.focalY ?? 0.5,
            cropX: imageData?.cropX,
            cropY: imageData?.cropY,
            cropWidth: imageData?.cropWidth,
            cropHeight: imageData?.cropHeight,
            cropAspectRatio: imageData?.cropAspectRatio,
            flipHorizontal: imageData?.flipHorizontal ?? false,
            flipVertical: imageData?.flipVertical ?? false,
          }}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
