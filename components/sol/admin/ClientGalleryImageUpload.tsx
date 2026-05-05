// ABOUTME: Client gallery image upload component with drag-and-drop
// ABOUTME: Handles multiple image uploads to a client gallery

'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger.edge'

interface ClientGalleryImageUploadProps {
  galleryId: string
  onClose: () => void
}

interface UploadingFile {
  file: File
  progress: number
  error?: string
}

export default function ClientGalleryImageUpload({
  galleryId,
  onClose,
}: ClientGalleryImageUploadProps) {
  const router = useRouter()
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

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

          const response = await fetch(
            `/api/admin/client-galleries/${galleryId}/upload`,
            {
              method: 'POST',
              body: formData,
            }
          )

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            logger.error({ err: errorData }, 'Upload failed')
            throw new Error(errorData.error || 'Upload failed')
          }

          setUploadingFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, progress: 100 } : f))
          )
        } catch (error) {
          logger.error({ err: error }, 'Error uploading file')
          setUploadingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    error:
                      error instanceof Error
                        ? error.message
                        : 'Failed to upload',
                  }
                : f
            )
          )
        }
      })

      await Promise.all(uploadPromises)

      setIsUploading(false)

      // Check if any uploads failed
      const hasErrors = uploadingFiles.some((f) => f.error)

      if (!hasErrors) {
        setTimeout(() => {
          setUploadingFiles([])
          router.refresh()
          onClose()
        }, 1000)
      }
    },
    [galleryId, router, onClose, uploadingFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: true,
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) {
          onClose()
        }
      }}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Upload Images</h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Upload Dropzone */}
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-400"
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
            <p className="text-lg text-gray-700">Drop images here...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-700">
                Drag and drop images here, or click to select
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Supports: JPG, PNG, WebP
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploadingFiles.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-medium text-gray-700">
              Uploading {uploadingFiles.length} file
              {uploadingFiles.length > 1 ? 's' : ''}...
            </h3>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {uploadingFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded bg-gray-50 p-3"
                >
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm text-gray-900">
                      {f.file.name}
                    </p>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full transition-all ${
                          f.error
                            ? 'bg-red-500'
                            : f.progress === 100
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                        }`}
                        style={{ width: `${f.error ? 100 : f.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {f.error ? (
                      <svg
                        className="h-5 w-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : f.progress === 100 ? (
                      <svg
                        className="h-5 w-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
