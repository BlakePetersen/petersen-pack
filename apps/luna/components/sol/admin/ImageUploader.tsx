// ABOUTME: Universal image upload component for CMS forms
// ABOUTME: Handles upload, crop, and focal point editing

'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import Cropper, { Area } from 'react-easy-crop'
import { ASPECT_RATIOS, AspectRatioKey } from '@/lib/image-utils'

type ImageData = {
  url: string
  focalX: number
  focalY: number
  cropX?: number | null
  cropY?: number | null
  cropWidth?: number | null
  cropHeight?: number | null
  cropAspectRatio?: string | null
}

type ImageUploaderProps = {
  imageType: 'gallery' | 'service' | 'blog' | 'hero'
  galleryId?: string
  serviceId?: string
  postId?: string
  heroSlideId?: string
  initialImage?: ImageData
  onImageSaved: (imageData: ImageData) => void
  label?: string
}

export function ImageUploader({
  imageType,
  galleryId,
  serviceId,
  postId,
  heroSlideId,
  initialImage,
  onImageSaved,
  label = 'Image',
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialImage?.url || null
  )
  const [imageId, setImageId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cropping state
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspectRatio, setAspectRatio] = useState<AspectRatioKey>('original')
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedArea(croppedArea)
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', imageType)

      if (galleryId) formData.append('galleryId', galleryId)
      if (serviceId) formData.append('serviceId', serviceId)
      if (postId) formData.append('postId', postId)
      if (heroSlideId) formData.append('heroSlideId', heroSlideId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setImageUrl(data.url)
      // Store image ID if available (gallery images have ID, hero/general do not)
      if (data.id) {
        setImageId(data.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      setImageUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveCrop = async () => {
    if (!imageUrl || !croppedArea) return

    const imageData: ImageData = {
      url: imageUrl,
      focalX: crop.x,
      focalY: crop.y,
      cropX: croppedArea.x / 100,
      cropY: croppedArea.y / 100,
      cropWidth: croppedArea.width / 100,
      cropHeight: croppedArea.height / 100,
      cropAspectRatio: aspectRatio === 'original' ? null : aspectRatio,
    }

    // If we have an imageId, save crop data to database
    if (imageId) {
      try {
        const response = await fetch(
          `/api/images/${imageId}?type=${imageType}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              focalX: imageData.focalX,
              focalY: imageData.focalY,
              cropX: imageData.cropX,
              cropY: imageData.cropY,
              cropWidth: imageData.cropWidth,
              cropHeight: imageData.cropHeight,
              cropAspectRatio: imageData.cropAspectRatio,
            }),
          }
        )

        if (!response.ok) {
          throw new Error('Failed to save crop data')
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to save crop data'
        )
        return
      }
    }

    onImageSaved(imageData)
    setShowCropper(false)
  }

  const handleRemove = () => {
    setImageUrl(null)
    setShowCropper(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Preview or Upload Area */}
      {!showCropper && imageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
          <Image src={imageUrl} alt="Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow-lg hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : !showCropper ? (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No image uploaded
            </p>
          </div>
        </div>
      ) : null}

      {/* Cropper */}
      {showCropper && imageUrl && (
        <div className="space-y-4">
          <div className="relative h-[400px] bg-gray-100 dark:bg-gray-800">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={ASPECT_RATIOS[aspectRatio].value ?? undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Aspect Ratio
            </label>
            <div className="flex gap-2">
              {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAspectRatio(key as AspectRatioKey)}
                  className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                    aspectRatio === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Zoom: {zoom.toFixed(2)}
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCropper(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Apply Crop
            </button>
          </div>
        </div>
      )}

      {/* Upload Controls */}
      {!showCropper && (
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`image-upload-${imageType}`}
          />
          <label
            htmlFor={`image-upload-${imageType}`}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 ${
              isUploading ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : imageUrl ? 'Change' : 'Upload'}
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
