// ABOUTME: Modal component for editing hero slides from the public site
// ABOUTME: Admin-only functionality to quickly update slide content

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { Button } from '@/components/commons/Button'
import { ImageWithFocalPoint } from './ImageWithFocalPoint'
import { logger } from '@/lib/logger.edge'

type HeroSlide = {
  id: string
  title: string
  imageUrl: string
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

type EditHeroSlideModalProps = {
  slide: HeroSlide
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditHeroSlideModal({
  slide,
  isOpen,
  onClose,
  onSave,
}: EditHeroSlideModalProps) {
  const [formData, setFormData] = useState({
    title: slide.title,
    imageUrl: slide.imageUrl,
    mobileImageUrl: slide.mobileImageUrl || '',
    focalX: slide.focalX,
    focalY: slide.focalY,
    mobileFocalX: slide.mobileFocalX,
    mobileFocalY: slide.mobileFocalY,
    linkUrl: slide.linkUrl || '',
    linkText: slide.linkText || '',
    isActive: slide.isActive,
  })
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/hero-slides/${slide.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to update slide')

      onSave()
      onClose()
    } catch (error) {
      logger.error({ err: error }, 'Error updating slide')
      alert('Failed to update slide. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
            Edit Hero Slide
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          {/* Desktop Image */}
          <ImageWithFocalPoint
            imageUrl={formData.imageUrl}
            focalX={formData.focalX}
            focalY={formData.focalY}
            onImageChange={(url) => setFormData({ ...formData, imageUrl: url })}
            onFocalChange={(x, y) =>
              setFormData({ ...formData, focalX: x, focalY: y })
            }
            label="Desktop Image"
            aspectRatio="desktop"
            uploadType="hero"
          />

          {/* Tablet Image */}
          <ImageWithFocalPoint
            imageUrl={formData.mobileImageUrl || formData.imageUrl}
            focalX={
              formData.mobileImageUrl ? formData.mobileFocalX : formData.focalX
            }
            focalY={
              formData.mobileImageUrl ? formData.mobileFocalY : formData.focalY
            }
            onImageChange={(url) =>
              setFormData({ ...formData, mobileImageUrl: url })
            }
            onFocalChange={(x, y) =>
              setFormData({ ...formData, mobileFocalX: x, mobileFocalY: y })
            }
            label="Tablet Image"
            aspectRatio="tablet"
            uploadType="hero"
            optional
          />

          {/* Mobile Image */}
          <ImageWithFocalPoint
            imageUrl={formData.mobileImageUrl || formData.imageUrl}
            focalX={
              formData.mobileImageUrl ? formData.mobileFocalX : formData.focalX
            }
            focalY={
              formData.mobileImageUrl ? formData.mobileFocalY : formData.focalY
            }
            onImageChange={(url) =>
              setFormData({ ...formData, mobileImageUrl: url })
            }
            onFocalChange={(x, y) =>
              setFormData({ ...formData, mobileFocalX: x, mobileFocalY: y })
            }
            label="Mobile Image"
            aspectRatio="mobile"
            uploadType="hero"
            optional
          />

          {/* Link URL */}
          <div>
            <label
              htmlFor="linkUrl"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Link URL (optional)
            </label>
            <input
              type="text"
              id="linkUrl"
              value={formData.linkUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkUrl: e.target.value })
              }
              placeholder="/portfolio"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Link Text */}
          <div>
            <label
              htmlFor="linkText"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Link Text (optional)
            </label>
            <input
              type="text"
              id="linkText"
              value={formData.linkText}
              onChange={(e) =>
                setFormData({ ...formData, linkText: e.target.value })
              }
              placeholder="View Portfolio"
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Active (visible on homepage)
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Note about advanced editing */}
          <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            For advanced management, use the{' '}
            <Link
              href="/admin/hero-slides"
              className="text-blue-600 hover:underline"
            >
              full admin editor
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
