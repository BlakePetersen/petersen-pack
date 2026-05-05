// ABOUTME: Enhanced hero slide form with focal points and mobile images
// ABOUTME: Includes image positioning, mobile variant, and device previews

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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
  mobileImageUrl: string | null
  focalX: number
  focalY: number
  mobileFocalX: number
  mobileFocalY: number
  linkUrl: string | null
  linkText: string | null
  sortOrder: number
  isActive: boolean
}

type HeroSlideFormProps = {
  slide?: HeroSlide
}

type PreviewMode = 'desktop' | 'tablet' | 'mobile'

export default function HeroSlideFormEnhanced({ slide }: HeroSlideFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [galleries, setGalleries] = useState<
    Array<{ id: string; title: string; slug: string }>
  >([])
  const [galleryImages, setGalleryImages] = useState<
    Array<{ id: string; url: string; altText: string | null }>
  >([])
  const [imageSourceTab, setImageSourceTab] = useState<'gallery' | 'upload'>(
    'gallery'
  )
  const [selectedGalleryForPicker, setSelectedGalleryForPicker] = useState<
    string | null
  >(null)
  const previewImageRef = useRef<HTMLDivElement>(null)
  const desktopImageRef = useRef<HTMLDivElement>(null)
  const mobileImageRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    title: slide?.title || '',
    galleryId: slide?.galleryId || null,
    imageId: slide?.imageId || null,
    imageUrl: slide?.imageUrl || '',
    mobileImageUrl: slide?.mobileImageUrl || '',
    focalX: slide?.focalX ?? 0.5,
    focalY: slide?.focalY ?? 0.5,
    mobileFocalX: slide?.mobileFocalX ?? 0.5,
    mobileFocalY: slide?.mobileFocalY ?? 0.5,
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
        imageUrl: image.url,
        mobileImageUrl: '',
        linkUrl: `/portfolio/${gallery.slug}`,
        linkText: gallery.title,
      }))
      setSelectedGalleryForPicker(null)
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[], isMobile: boolean = false) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setIsUploading(true)
      setError(null)

      try {
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)
        uploadFormData.append('type', 'hero')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await response.json()

        setFormData((prev) => ({
          ...prev,
          [isMobile ? 'mobileImageUrl' : 'imageUrl']: data.url,
        }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image')
      } finally {
        setIsUploading(false)
      }
    },
    []
  )

  const {
    getRootProps: getDesktopRootProps,
    getInputProps: getDesktopInputProps,
    isDragActive: isDesktopDragActive,
  } = useDropzone({
    onDrop: (files) => onDrop(files, false),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  })

  const {
    getRootProps: getMobileRootProps,
    getInputProps: getMobileInputProps,
    isDragActive: isMobileDragActive,
  } = useDropzone({
    onDrop: (files) => onDrop(files, true),
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  })

  const handleFocalPointClick = (
    e: React.MouseEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement | null>,
    isMobile: boolean = false
  ) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    if (isMobile) {
      setFormData((prev) => ({
        ...prev,
        mobileFocalX: Math.max(0, Math.min(1, x)),
        mobileFocalY: Math.max(0, Math.min(1, y)),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        focalX: Math.max(0, Math.min(1, x)),
        focalY: Math.max(0, Math.min(1, y)),
      }))
    }
  }

  const handleGenerateMobileImage = async () => {
    if (!formData.imageUrl) {
      setError('Please upload a desktop image first')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-mobile-hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: formData.imageUrl,
          focalX: formData.focalX,
          focalY: formData.focalY,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate mobile image')
      }

      const data = await response.json()

      setFormData((prev) => ({
        ...prev,
        mobileImageUrl: data.url,
        mobileFocalX: 0.5,
        mobileFocalY: 0.5,
      }))

      setPreviewMode('mobile')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate mobile image'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.imageUrl) {
      setError('Please upload a desktop image')
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
            ? parseFloat(value)
            : value,
    }))
  }

  const currentImage =
    previewMode === 'mobile' && formData.mobileImageUrl
      ? formData.mobileImageUrl
      : formData.imageUrl

  const isMobilePreview = previewMode === 'mobile' && !!formData.mobileImageUrl
  const currentFocalX = isMobilePreview
    ? formData.mobileFocalX
    : formData.focalX
  const currentFocalY = isMobilePreview
    ? formData.mobileFocalY
    : formData.focalY

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Preview Section */}
      {currentImage && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Preview
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  previewMode === 'desktop'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('tablet')}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  previewMode === 'tablet'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Tablet
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-lg border-2 border-gray-300 bg-black dark:border-gray-600"
            style={{
              aspectRatio:
                previewMode === 'mobile'
                  ? '9/16'
                  : previewMode === 'tablet'
                    ? '4/3'
                    : '16/9',
              maxWidth:
                previewMode === 'mobile'
                  ? '375px'
                  : previewMode === 'tablet'
                    ? '768px'
                    : '100%',
              margin: '0 auto',
            }}
          >
            <div
              ref={previewImageRef}
              className="relative h-full w-full cursor-crosshair"
              onClick={(e) =>
                handleFocalPointClick(e, previewImageRef, isMobilePreview)
              }
            >
              <Image
                src={currentImage}
                alt="Preview"
                fill
                className="pointer-events-none object-cover"
                style={{
                  objectPosition: `${currentFocalX * 100}% ${currentFocalY * 100}%`,
                }}
              />

              {/* Focal Point Marker */}
              <div
                className="pointer-events-none absolute z-10 -ml-4 -mt-4 h-8 w-8"
                style={{
                  left: `${currentFocalX * 100}%`,
                  top: `${currentFocalY * 100}%`,
                }}
              >
                <div className="h-full w-full rounded-full border-4 border-white shadow-lg" />
                <div className="absolute inset-2 rounded-full bg-blue-600" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/75 px-2 py-1 text-xs text-white">
                  {Math.round(currentFocalX * 100)}%,{' '}
                  {Math.round(currentFocalY * 100)}%
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content Preview */}
              <div className="absolute inset-0 flex items-end p-8">
                <div className="max-w-2xl">
                  <h1
                    className={`font-serif font-light leading-tight text-white ${
                      previewMode === 'mobile'
                        ? 'text-3xl'
                        : 'text-5xl md:text-6xl'
                    }`}
                  >
                    {formData.title || 'Title'}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Source Selection */}
      <div className="mb-6">
        <label className="mb-4 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Image Source
        </label>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setImageSourceTab('gallery')}
            className={`px-4 pb-3 text-sm font-medium transition-colors ${
              imageSourceTab === 'gallery'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Load from Gallery
          </button>
          <button
            type="button"
            onClick={() => {
              setImageSourceTab('upload')
              setSelectedGalleryForPicker(null)
            }}
            className={`px-4 pb-3 text-sm font-medium transition-colors ${
              imageSourceTab === 'upload'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Manual Upload
          </button>
        </div>

        {/* Gallery Tab Content */}
        {imageSourceTab === 'gallery' && (
          <div className="space-y-6">
            {/* Gallery Selection */}
            <div>
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

            {/* Current Selection Display */}
            {(formData.galleryId || formData.imageId) && (
              <div className="rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-300">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Image Loaded
                </div>
                {formData.galleryId && (
                  <div className="text-sm text-green-700 dark:text-green-400">
                    Gallery:{' '}
                    {galleries.find((g) => g.id === formData.galleryId)?.title}
                  </div>
                )}
                {formData.title && (
                  <div className="text-sm text-green-700 dark:text-green-400">
                    Title: {formData.title}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload Tab Content - placeholder, actual upload form is below */}
        {imageSourceTab === 'upload' && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload your own images using the forms below
            </p>
          </div>
        )}
      </div>

      {/* Desktop Image Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Desktop Image *{' '}
          <span className="text-xs text-gray-500">(16:9 recommended)</span>
        </label>

        {formData.imageUrl ? (
          <div className="space-y-4">
            <div
              ref={desktopImageRef}
              onClick={(e) => handleFocalPointClick(e, desktopImageRef, false)}
              className="relative aspect-video w-full cursor-crosshair overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600"
            >
              <Image
                src={formData.imageUrl}
                alt="Desktop hero"
                fill
                className="object-cover"
              />
              {/* Focal Point Marker */}
              <div
                className="pointer-events-none absolute -ml-4 -mt-4 h-8 w-8"
                style={{
                  left: `${formData.focalX * 100}%`,
                  top: `${formData.focalY * 100}%`,
                }}
              >
                <div className="h-full w-full rounded-full border-4 border-white shadow-lg" />
                <div className="absolute inset-2 rounded-full bg-blue-600" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Click on image to set focal point • Focal: X:
                {(formData.focalX * 100).toFixed(0)}% Y:
                {(formData.focalY * 100).toFixed(0)}%
              </p>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    imageUrl: '',
                    focalX: 0.5,
                    focalY: 0.5,
                  }))
                }
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div
            {...getDesktopRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDesktopDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
            }`}
          >
            <input {...getDesktopInputProps()} />
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
              ) : isDesktopDragActive ? (
                <span>Drop image here...</span>
              ) : (
                <>
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, WebP up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Mobile Image Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Mobile Image (Optional){' '}
          <span className="text-xs text-gray-500">(Square, 1080x1080)</span>
        </label>

        {formData.mobileImageUrl ? (
          <div className="space-y-4">
            <div
              ref={mobileImageRef}
              onClick={(e) => handleFocalPointClick(e, mobileImageRef, true)}
              className="relative mx-auto aspect-square w-64 cursor-crosshair overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600"
            >
              <Image
                src={formData.mobileImageUrl}
                alt="Mobile hero"
                fill
                className="pointer-events-none object-cover"
                style={{
                  objectPosition: `${formData.mobileFocalX * 100}% ${formData.mobileFocalY * 100}%`,
                }}
              />
              {/* Mobile Focal Point Marker */}
              <div
                className="pointer-events-none absolute -ml-3 -mt-3 h-6 w-6"
                style={{
                  left: `${formData.mobileFocalX * 100}%`,
                  top: `${formData.mobileFocalY * 100}%`,
                }}
              >
                <div className="border-3 h-full w-full rounded-full border-white shadow-lg" />
                <div className="absolute inset-1.5 rounded-full bg-blue-600" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Click on image to set mobile focal point • X:
                {(formData.mobileFocalX * 100).toFixed(0)}% Y:
                {(formData.mobileFocalY * 100).toFixed(0)}%
              </p>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    mobileImageUrl: '',
                    mobileFocalX: 0.5,
                    mobileFocalY: 0.5,
                  }))
                }
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Remove mobile image
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGenerateMobileImage}
              disabled={!formData.imageUrl || isUploading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? 'Generating...' : 'Generate from Desktop Image'}
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>
            <div
              {...getMobileRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isMobileDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
              }`}
            >
              <input {...getMobileInputProps()} />
              <svg
                className="mx-auto h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {isUploading ? (
                  <span className="font-semibold text-blue-600">
                    Uploading...
                  </span>
                ) : (
                  <>Upload a custom mobile image</>
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the form fields */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            disabled={isLoading || isUploading}
            className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : slide ? 'Update Slide' : 'Create Slide'}
          </button>
        </div>
      </div>
    </form>
  )
}
