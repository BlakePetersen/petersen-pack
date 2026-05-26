// ABOUTME: Image upload component for forms
// ABOUTME: Handles file selection, preview, and upload to server

'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

type ImageUploadProps = {
  currentImageUrl?: string
  onImageChange: (url: string) => void
  label?: string
  uploadType?: 'hero' | 'general'
}

export function ImageUpload({
  currentImageUrl,
  onImageChange,
  label = 'Image',
  uploadType = 'general',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  )
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setPreviewUrl(currentImageUrl || null)
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

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="space-y-3">
        {/* Preview */}
        {previewUrl && (
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
            <div className="relative h-48 w-full">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow-lg transition-colors hover:bg-red-700"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload Button and URL Input Side by Side */}
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

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}
