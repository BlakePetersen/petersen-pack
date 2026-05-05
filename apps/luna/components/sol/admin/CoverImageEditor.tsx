// ABOUTME: Cover image editor with focal point selector
// ABOUTME: Allows setting a focal point by clicking on the image

'use client'

import { useState, useRef } from 'react'
import { Upload, X, Target } from 'lucide-react'
import Image from 'next/image'
import { logger } from '@/lib/logger.edge'

type CoverImageEditorProps = {
  imageUrl: string
  focalX: number
  focalY: number
  onImageChange: (url: string) => void
  onFocalPointChange: (x: number, y: number) => void
}

export function CoverImageEditor({
  imageUrl,
  focalX,
  focalY,
  onImageChange,
  onFocalPointChange,
}: CoverImageEditorProps) {
  const [isSettingFocalPoint, setIsSettingFocalPoint] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSettingFocalPoint || !imageContainerRef.current) return

    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    // Clamp values between 0 and 1
    const clampedX = Math.max(0, Math.min(1, x))
    const clampedY = Math.max(0, Math.min(1, y))

    onFocalPointChange(clampedX, clampedY)
    setIsSettingFocalPoint(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      onImageChange(data.url)
    } catch (error) {
      logger.error({ err: error }, 'Upload error')
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    onImageChange('')
    onFocalPointChange(0.5, 0.5)
  }

  return (
    <div className="space-y-3">
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Cover Image
      </label>

      {imageUrl ? (
        <div className="space-y-3">
          {/* Image preview with focal point */}
          <div
            ref={imageContainerRef}
            onClick={handleImageClick}
            className={`relative aspect-video w-full overflow-hidden rounded-lg border-2 ${
              isSettingFocalPoint
                ? 'cursor-crosshair border-blue-500'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <Image
              src={imageUrl}
              alt="Cover image preview"
              fill
              className="object-cover"
              style={{
                objectPosition: `${focalX * 100}% ${focalY * 100}%`,
              }}
            />

            {/* Focal point indicator */}
            <div
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500/50 shadow-lg"
              style={{
                left: `${focalX * 100}%`,
                top: `${focalY * 100}%`,
              }}
            >
              <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
            </div>

            {isSettingFocalPoint && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="rounded bg-black/70 px-3 py-1 text-sm text-white">
                  Click to set focal point
                </span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsSettingFocalPoint(!isSettingFocalPoint)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isSettingFocalPoint
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Target className="h-4 w-4" />
              {isSettingFocalPoint ? 'Click image...' : 'Set Focal Point'}
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Replace'}
            </button>

            <button
              type="button"
              onClick={handleRemoveImage}
              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Focal point: {Math.round(focalX * 100)}% x{' '}
            {Math.round(focalY * 100)}%
          </p>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500 dark:hover:bg-gray-700"
        >
          <Upload className="mb-2 h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isUploading ? 'Uploading...' : 'Click to upload cover image'}
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* URL input as fallback */}
      <div>
        <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">
          Or enter image URL directly:
        </label>
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => onImageChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  )
}
