// ABOUTME: Image upload component with drag-and-drop
// ABOUTME: Handles multiple image uploads to a selected gallery

'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'

interface ImageUploadProps {
  galleries: Array<{
    id: string
    title: string
  }>
}

interface UploadingFile {
  file: File
  progress: number
  error?: string
}

export default function ImageUpload({ galleries }: ImageUploadProps) {
  const router = useRouter()
  const [selectedGalleryId, setSelectedGalleryId] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!selectedGalleryId) {
        alert('Please select a gallery first')
        return
      }

      setIsUploading(true)
      const newFiles = acceptedFiles.map((file) => ({
        file,
        progress: 0,
      }))
      setUploadingFiles(newFiles)

      // Upload all files in parallel
      const uploadPromises = acceptedFiles.map(async (file, i) => {
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('galleryId', selectedGalleryId)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Upload failed')
          }

          setUploadingFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, progress: 100 } : f))
          )
        } catch (error) {
          setUploadingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, error: 'Failed to upload' } : f
            )
          )
        }
      })

      await Promise.all(uploadPromises)

      setIsUploading(false)
      setTimeout(() => {
        setUploadingFiles([])
        router.refresh()
      }, 2000)
    },
    [selectedGalleryId, router]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: true,
  })

  return (
    <div className="space-y-6">
      {/* Gallery Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Gallery *
        </label>
        <select
          value={selectedGalleryId}
          onChange={(e) => setSelectedGalleryId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          disabled={isUploading}
        >
          <option value="">Choose a gallery...</option>
          {galleries.map((gallery) => (
            <option key={gallery.id} value={gallery.id}>
              {gallery.title}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Dropzone */}
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500'
        } ${!selectedGalleryId || isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        <svg
          className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        {isDragActive ? (
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Drop images here...
          </p>
        ) : (
          <div>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Drag and drop images here, or click to select
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Supports: JPG, PNG, WebP
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-white">
            Uploading Images
          </h3>
          {uploadingFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-700"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {file.file.name}
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-600">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      file.error
                        ? 'bg-red-500'
                        : file.progress === 100
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              </div>
              {file.error && (
                <span className="text-sm text-red-600 dark:text-red-400">
                  {file.error}
                </span>
              )}
              {file.progress === 100 && !file.error && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  ✓ Complete
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
