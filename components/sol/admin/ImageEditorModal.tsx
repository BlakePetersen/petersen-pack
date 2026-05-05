// ABOUTME: Modal for editing image crop, zoom, and flip
// ABOUTME: Uses react-advanced-cropper for reliable state persistence

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  X,
  RotateCcw,
  FlipHorizontal2,
  FlipVertical2,
  Upload,
} from 'lucide-react'
import { Cropper, CropperRef } from 'react-advanced-cropper'
import 'react-advanced-cropper/dist/style.css'
import { ASPECT_RATIOS, AspectRatioKey } from '@/lib/image-utils'

type ImageEditorModalProps = {
  imageId: string
  imageType: 'gallery' | 'service' | 'blog' | 'hero' | 'standalone'
  imageUrl: string
  initialData: {
    focalX: number
    focalY: number
    cropX?: number | null
    cropY?: number | null
    cropWidth?: number | null
    cropHeight?: number | null
    cropAspectRatio?: string | null
    flipHorizontal?: boolean
    flipVertical?: boolean
  }
  onClose: () => void
  onSave: () => void
}

export function ImageEditorModal({
  imageId,
  imageType,
  imageUrl,
  initialData,
  onClose,
  onSave,
}: ImageEditorModalProps) {
  const cropperRef = useRef<CropperRef>(null)

  // Determine initial aspect ratio
  // If there's a saved cropAspectRatio, check if actual crop matches it
  const getInitialAspectRatio = (): AspectRatioKey => {
    if (!initialData.cropAspectRatio) {
      return 'original'
    }

    // If we have crop dimensions, check if they match the saved aspect ratio
    if (initialData.cropWidth && initialData.cropHeight) {
      const actualRatio = initialData.cropWidth / initialData.cropHeight
      const savedKey = initialData.cropAspectRatio as AspectRatioKey
      const savedRatioValue = ASPECT_RATIOS[savedKey]?.value

      // If saved aspect ratio doesn't match actual crop (tolerance 0.01), use custom
      if (savedRatioValue && Math.abs(actualRatio - savedRatioValue) > 0.01) {
        return 'custom'
      }
    }

    return (initialData.cropAspectRatio as AspectRatioKey) || 'original'
  }

  const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>(
    getInitialAspectRatio()
  )
  const [flipHorizontal, setFlipHorizontal] = useState(
    initialData.flipHorizontal || false
  )
  const [flipVertical, setFlipVertical] = useState(
    initialData.flipVertical || false
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if we have existing crop data to restore
  // Must have all crop values AND cropWidth/cropHeight must be > 0
  const hasExistingCrop =
    initialData.cropX != null &&
    initialData.cropY != null &&
    initialData.cropWidth != null &&
    initialData.cropHeight != null &&
    initialData.cropWidth > 0 &&
    initialData.cropHeight > 0

  // Calculate default coordinates from saved data
  // react-advanced-cropper uses pixel coordinates, but we'll use the
  // defaultCoordinates callback which receives image dimensions
  const getDefaultCoordinates = useCallback(
    (state: { imageSize: { width: number; height: number } }) => {
      const { width, height } = state.imageSize

      if (!hasExistingCrop) {
        // No saved crop - return null to use default behavior
        return null
      }

      return {
        left: (initialData.cropX ?? 0) * width,
        top: (initialData.cropY ?? 0) * height,
        width: (initialData.cropWidth ?? 1) * width,
        height: (initialData.cropHeight ?? 1) * height,
      }
    },
    [hasExistingCrop, initialData]
  )

  // Apply saved flip transforms after image loads
  useEffect(() => {
    if (imageLoaded && cropperRef.current) {
      const cropper = cropperRef.current
      // Apply saved flip state
      if (initialData.flipHorizontal || initialData.flipVertical) {
        cropper.flipImage(
          initialData.flipHorizontal || false,
          initialData.flipVertical || false
        )
      }
    }
  }, [imageLoaded, initialData.flipHorizontal, initialData.flipVertical])

  // Handle flip toggle
  const handleFlipHorizontal = useCallback(() => {
    if (cropperRef.current) {
      const newFlip = !flipHorizontal
      setFlipHorizontal(newFlip)
      cropperRef.current.flipImage(newFlip, flipVertical)
    }
  }, [flipHorizontal, flipVertical])

  const handleFlipVertical = useCallback(() => {
    if (cropperRef.current) {
      const newFlip = !flipVertical
      setFlipVertical(newFlip)
      cropperRef.current.flipImage(flipHorizontal, newFlip)
    }
  }, [flipHorizontal, flipVertical])

  // Reset to original (no crop, no flip)
  const handleReset = useCallback(() => {
    if (cropperRef.current) {
      cropperRef.current.reset()
      setFlipHorizontal(false)
      setFlipVertical(false)
      setAspectRatio('original')
    }
  }, [])

  // Handle aspect ratio change
  const handleAspectRatioChange = useCallback((key: AspectRatioKey) => {
    setAspectRatio(key)
    // The cropper will update via the stencilProps
  }, [])

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('imageId', imageId)
      formData.append('imageType', imageType)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      // Update the image URL and reset crop settings
      setCurrentImageUrl(data.url)
      setImageLoaded(false)
      handleReset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSave = async () => {
    if (!cropperRef.current) {
      setError('Cropper not ready')
      return
    }

    const coordinates = cropperRef.current.getCoordinates()
    const imageState = cropperRef.current.getImage()

    if (!coordinates || !imageState) {
      setError('Could not get crop data')
      return
    }

    setIsSaving(true)
    setError(null)

    // Convert pixel coordinates to 0-1 range
    const payload = {
      cropX: coordinates.left / imageState.width,
      cropY: coordinates.top / imageState.height,
      cropWidth: coordinates.width / imageState.width,
      cropHeight: coordinates.height / imageState.height,
      cropAspectRatio:
        aspectRatio === 'original' || aspectRatio === 'custom'
          ? null
          : aspectRatio,
      flipHorizontal,
      flipVertical,
    }

    try {
      const response = await fetch(`/api/images/${imageId}?type=${imageType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save image')
      }

      onSave()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Get aspect ratio value for stencil
  const aspectRatioValue =
    aspectRatio === 'custom' || aspectRatio === 'original'
      ? undefined
      : (ASPECT_RATIOS[aspectRatio].value ?? undefined)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl bg-gray-900 shadow-2xl">
        {/* Left Pane - Cropper */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-white">Edit Image</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cropper */}
          <div className="relative min-h-0 flex-1 overflow-hidden bg-gray-800">
            {isUploading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-gray-400">Uploading...</div>
              </div>
            ) : (
              <div className="h-full w-full">
                <Cropper
                  ref={cropperRef}
                  src={currentImageUrl}
                  {...(!hasExistingCrop
                    ? {}
                    : { defaultCoordinates: getDefaultCoordinates })}
                  stencilProps={{
                    aspectRatio: aspectRatioValue,
                    grid: true,
                  }}
                  onReady={() => setImageLoaded(true)}
                  className="h-full w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Controls */}
        <div className="flex w-72 flex-shrink-0 flex-col border-l border-gray-700 bg-gray-900">
          {/* Close button */}
          <div className="flex justify-end border-b border-gray-700 px-4 py-4">
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Controls */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            {/* Aspect Ratio */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400">
                Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() =>
                      handleAspectRatioChange(key as AspectRatioKey)
                    }
                    className={`rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                      aspectRatio === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flip */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400">
                Flip
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleFlipHorizontal}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-xs font-medium transition-colors ${
                    flipHorizontal
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FlipHorizontal2 className="h-3.5 w-3.5" />
                  Horizontal
                </button>
                <button
                  onClick={handleFlipVertical}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-2 text-xs font-medium transition-colors ${
                    flipVertical
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FlipVertical2 className="h-3.5 w-3.5" />
                  Vertical
                </button>
              </div>
            </div>

            {/* Reset */}
            <div>
              <button
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-600 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Original
              </button>
            </div>

            {/* Replace Image */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-400">
                Replace Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-600 px-3 py-2 text-sm font-medium text-gray-300 hover:border-gray-500 hover:bg-gray-800"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload New Image'}
              </label>
            </div>

            {/* Error */}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
