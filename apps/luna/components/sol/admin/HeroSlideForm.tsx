// ABOUTME: Form component for creating and editing hero slides
// ABOUTME: Handles hero slide CRUD with image URL and link management

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { logger } from '@/lib/logger.edge'

type HeroSlide = {
  id: string
  title: string
  galleryId: string | null
  imageId: string | null
  imageUrl: string | null
  linkUrl: string | null
  linkText: string | null
  sortOrder: number
  isActive: boolean
}

type HeroSlideFormProps = {
  slide?: HeroSlide
}

export default function HeroSlideForm({ slide }: HeroSlideFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [galleries, setGalleries] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([])
  const [galleryImages, setGalleryImages] = useState<
    Array<{ id: string; url: string; altText: string | null }>
  >([])
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
    slide?.imageUrl || null
  )
  const [showGalleryPicker, setShowGalleryPicker] = useState(false)
  const [selectedGalleryForPicker, setSelectedGalleryForPicker] = useState<
    string | null
  >(null)
  const [formData, setFormData] = useState({
    title: slide?.title || '',
    galleryId: slide?.galleryId || null,
    imageId: slide?.imageId || null,
    imageUrl: slide?.imageUrl || '',
    linkUrl: slide?.linkUrl || '',
    linkText: slide?.linkText || '',
    sortOrder: slide?.sortOrder || 0,
    isActive: slide?.isActive ?? true,
  })

  // Fetch galleries on mount
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await fetch('/api/galleries')
        if (response.ok) {
          const data = await response.json()
          setGalleries(data)
        }
      } catch (err) {
        logger.error({ err: err }, 'Failed to fetch galleries')
      }
    }
    fetchGalleries()
  }, [])

  // Fetch images when gallery is selected for the picker
  useEffect(() => {
    if (!selectedGalleryForPicker) {
      setGalleryImages([])
      return
    }

    const fetchGalleryImages = async () => {
      try {
        const response = await fetch(
          `/api/galleries/${selectedGalleryForPicker}`
        )
        if (response.ok) {
          const data = await response.json()
          setGalleryImages(data.images || [])
        }
      } catch (err) {
        logger.error({ err: err }, 'Failed to fetch gallery images')
      }
    }
    fetchGalleryImages()
  }, [selectedGalleryForPicker])

  const handleLoadGalleryData = (galleryId: string, imageId: string) => {
    const gallery = galleries.find((g) => g.id === galleryId)
    const image = galleryImages.find((i) => i.id === imageId)

    if (gallery && image) {
      setFormData((prev) => ({
        ...prev,
        title: gallery.title,
        galleryId: gallery.id,
        imageId: image.id,
        imageUrl: '',
        linkUrl: `/portfolio/${gallery.slug}`,
        linkText: gallery.title,
      }))
      setUploadedImageUrl(null)
      setShowGalleryPicker(false)
      setSelectedGalleryForPicker(null)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'hero')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      setUploadedImageUrl(data.url)
      setFormData((prev) => ({ ...prev, imageUrl: data.url }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate that at least one image source is provided
    if (!formData.galleryId && !formData.imageId && !formData.imageUrl) {
      setError('Please select a gallery, choose an image, or upload an image')
      return
    }

    setIsLoading(true)

    try {
      const url = slide
        ? `/api/admin/hero-slides/${slide.id}`
        : '/api/admin/hero-slides'

      const method = slide ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save hero slide')
      }

      router.push('/admin/hero-slides')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save hero slide')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!slide) return

    if (
      !confirm(
        'Are you sure you want to delete this hero slide? This action cannot be undone.'
      )
    ) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete hero slide')
      }

      router.push('/admin/hero-slides')
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete hero slide'
      )
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseInt(value)
            : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Timeless Portraits"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Image Source
        </label>

        {/* Load from Gallery Button */}
        <div className="mb-4 flex gap-4">
          <button
            type="button"
            onClick={() => setShowGalleryPicker(true)}
            className="flex-1 rounded-lg border-2 border-blue-600 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            Load from Gallery
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                galleryId: null,
                imageId: null,
                imageUrl: '',
                title: '',
                linkUrl: '',
                linkText: '',
              }))
              setUploadedImageUrl(null)
            }}
            className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Manual Upload
          </button>
        </div>

        {/* Gallery Picker Modal */}
        {showGalleryPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Select Gallery & Image
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowGalleryPicker(false)
                    setSelectedGalleryForPicker(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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

              {/* Gallery Selection */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose Gallery
                </label>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {galleries.map((gallery) => (
                    <button
                      key={gallery.id}
                      type="button"
                      onClick={() => setSelectedGalleryForPicker(gallery.id)}
                      className={`rounded-lg border-2 p-3 text-left transition-colors ${
                        selectedGalleryForPicker === gallery.id
                          ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {gallery.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        /portfolio/{gallery.slug}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Selection */}
              {selectedGalleryForPicker && galleryImages.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Choose Image
                  </label>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {galleryImages.map((image, idx) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() =>
                          handleLoadGalleryData(
                            selectedGalleryForPicker,
                            image.id
                          )
                        }
                        className="group relative aspect-square overflow-hidden rounded-lg border-2 border-gray-300 transition-all hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-400"
                      >
                        <Image
                          src={image.url}
                          alt={image.altText || `Image ${idx + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Selection Display */}
        {(formData.galleryId || formData.imageId) && (
          <div className="mb-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Selection:
            </div>
            {formData.galleryId && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Gallery:{' '}
                {galleries.find((g) => g.id === formData.galleryId)?.title}
              </div>
            )}
            {formData.imageId && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Image ID: {formData.imageId}
              </div>
            )}
          </div>
        )}

        {/* Manual Upload */}
        {!formData.galleryId && !formData.imageId && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload Image
            </label>

            {uploadedImageUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600">
                  <Image
                    src={uploadedImageUrl}
                    alt="Hero slide preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedImageUrl(null)
                    setFormData((prev) => ({ ...prev, imageUrl: '' }))
                  }}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                }`}
              >
                <input {...getInputProps()} />
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {isUploading ? (
                    <span className="font-semibold text-blue-600">
                      Uploading...
                    </span>
                  ) : isDragActive ? (
                    <span>Drop image here...</span>
                  ) : (
                    <>
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, WebP up to 10MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="linkUrl"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Link URL
          </label>
          <input
            type="text"
            id="linkUrl"
            name="linkUrl"
            value={formData.linkUrl}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="/portfolio/portraits"
          />
        </div>

        <div>
          <label
            htmlFor="linkText"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Link Text
          </label>
          <input
            type="text"
            id="linkText"
            name="linkText"
            value={formData.linkText}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="View Gallery"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="sortOrder"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Sort Order *
          </label>
          <input
            type="number"
            id="sortOrder"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Lower numbers appear first
          </p>
        </div>

        <div className="flex items-center">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t pt-6 dark:border-gray-700">
        <div>
          {slide && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="rounded-lg bg-red-600 px-6 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : slide ? 'Update Slide' : 'Create Slide'}
          </button>
        </div>
      </div>
    </form>
  )
}
