// ABOUTME: Combined image upload and focal point picker component
// ABOUTME: Shows image preview with integrated focal point adjustment

'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

type ImageWithFocalPointProps = {
  imageUrl?: string
  focalX: number
  focalY: number
  onImageChange: (url: string) => void
  onFocalChange: (x: number, y: number) => void
  label: string
  aspectRatio: 'desktop' | 'tablet' | 'mobile'
  uploadType?: 'hero' | 'general'
  optional?: boolean
}

const ASPECT_RATIOS = {
  desktop: 'aspect-[21/9]', // Ultrawide desktop
  tablet: 'aspect-[4/3]', // Tablet landscape
  mobile: 'aspect-[9/16]', // Mobile portrait
}

const ASPECT_LABELS = {
  desktop: 'Desktop (widescreen)',
  tablet: 'Tablet (landscape)',
  mobile: 'Mobile (portrait)',
}

export function ImageWithFocalPoint({
  imageUrl,
  focalX,
  focalY,
  onImageChange,
  onFocalChange,
  label,
  aspectRatio,
  uploadType = 'hero',
  optional = false,
}: ImageWithFocalPointProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

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
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', uploadType)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      onImageChange(data.url)
      setPreviewUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      setPreviewUrl(imageUrl || null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onImageChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !previewUrl) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    // Clamp values between 0 and 1
    const clampedX = Math.max(0, Math.min(1, x))
    const clampedY = Math.max(0, Math.min(1, y))

    onFocalChange(clampedX, clampedY)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {optional && (
            <span className="ml-1 text-gray-400 dark:text-gray-500">
              (optional)
            </span>
          )}
        </label>
        {previewUrl && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Focal: {(focalX * 100).toFixed(0)}%, {(focalY * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Preview with Focal Point */}
      {previewUrl ? (
        <div
          ref={imageRef}
          onClick={handleImageClick}
          className={`relative w-full ${ASPECT_RATIOS[aspectRatio]} group cursor-crosshair overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800`}
          title="Click to set focal point"
        >
          {/* Image with cover to match carousel behavior */}
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="pointer-events-none object-cover"
            style={{
              objectPosition: `${focalX * 100}% ${focalY * 100}%`,
            }}
          />

          {/* Static focal point indicator in center */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -ml-3 -mt-3 h-6 w-6">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-red-500 shadow-lg" />
            {/* Inner dot */}
            <div className="absolute inset-0 m-2 rounded-full bg-red-500 shadow-lg" />
            {/* Crosshair */}
            <div className="absolute -left-8 -right-8 top-1/2 h-px bg-red-500 opacity-50" />
            <div className="absolute -bottom-8 -top-8 left-1/2 w-px bg-red-500 opacity-50" />
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
            className="absolute right-2 top-2 z-10 rounded-full bg-red-600 p-1.5 text-white opacity-0 shadow-lg transition-colors hover:bg-red-700 group-hover:opacity-100"
            title="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`relative w-full ${ASPECT_RATIOS[aspectRatio]} flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800`}
        >
          <div className="text-center">
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              {ASPECT_LABELS[aspectRatio]}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              No image uploaded
            </p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id={`image-upload-${label}`}
        />
        <label
          htmlFor={`image-upload-${label}`}
          className={`inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border px-4 py-2 transition-colors ${isUploading ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'} border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300`}
        >
          <Upload className="h-4 w-4" />
          {isUploading ? 'Uploading...' : previewUrl ? 'Change' : 'Upload'}
        </label>

        <input
          type="text"
          value={previewUrl || ''}
          onChange={(e) => {
            setPreviewUrl(e.target.value)
            onImageChange(e.target.value)
          }}
          placeholder="Or paste image URL"
          className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
        />
      </div>

      {/* Sliders */}
      {previewUrl && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
              Horizontal
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={focalX}
              onChange={(e) =>
                onFocalChange(parseFloat(e.target.value), focalY)
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
              Vertical
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={focalY}
              onChange={(e) =>
                onFocalChange(focalX, parseFloat(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
