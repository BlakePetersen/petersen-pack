// ABOUTME: Modal for editing homepage sections
// ABOUTME: Handles About, Services, and CTA section edits

'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { ImageUpload } from './ImageUpload'

type HomepageSectionModalProps = {
  section: 'about' | 'services' | 'cta'
  content: any
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export function EditHomepageSectionModal({
  section,
  content,
  isOpen,
  onClose,
  onSave,
}: HomepageSectionModalProps) {
  const [formData, setFormData] = useState(content)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/homepage-content/${section}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: formData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update content')
      }

      onSave()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (path: string[], value: any) => {
    setFormData((prev: any) => {
      const newData = { ...prev }
      let current = newData
      for (let i = 0; i < path.length - 1; i++) {
        current[path[i]] = { ...current[path[i]] }
        current = current[path[i]]
      }
      current[path[path.length - 1]] = value
      return newData
    })
  }

  const updateArrayField = (
    arrayPath: string[],
    index: number,
    field: string,
    value: any
  ) => {
    setFormData((prev: any) => {
      const newData = { ...prev }
      let current = newData
      for (let i = 0; i < arrayPath.length - 1; i++) {
        current[arrayPath[i]] = { ...current[arrayPath[i]] }
        current = current[arrayPath[i]]
      }
      const arrayField = arrayPath[arrayPath.length - 1]
      current[arrayField] = [...current[arrayField]]
      current[arrayField][index] = {
        ...current[arrayField][index],
        [field]: value,
      }
      return newData
    })
  }

  const renderAboutForm = () => (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium">Heading</label>
        <input
          type="text"
          value={formData.heading || ''}
          onChange={(e) => updateField(['heading'], e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> To edit the About section image, use the edit
          button on the image itself or visit{' '}
          <a
            href="/admin/homepage-image"
            className="text-blue-600 underline hover:text-blue-700"
          >
            /admin/homepage-image
          </a>
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Paragraphs</label>
        {formData.paragraphs?.map((paragraph: string, index: number) => (
          <textarea
            key={index}
            value={paragraph}
            onChange={(e) => {
              const newParagraphs = [...formData.paragraphs]
              newParagraphs[index] = e.target.value
              updateField(['paragraphs'], newParagraphs)
            }}
            rows={3}
            className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        ))}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Statistics</label>
        <div className="grid grid-cols-3 gap-4">
          {formData.stats?.map((stat: any, index: number) => (
            <div key={index} className="space-y-2">
              <input
                type="text"
                value={stat.value}
                onChange={(e) =>
                  updateArrayField(['stats'], index, 'value', e.target.value)
                }
                placeholder="Value"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) =>
                  updateArrayField(['stats'], index, 'label', e.target.value)
                }
                placeholder="Label"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Link Text</label>
          <input
            type="text"
            value={formData.linkText || ''}
            onChange={(e) => updateField(['linkText'], e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Link URL</label>
          <input
            type="text"
            value={formData.linkUrl || ''}
            onChange={(e) => updateField(['linkUrl'], e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
    </>
  )

  const addService = () => {
    const newService = {
      icon: 'Camera',
      title: 'New Service',
      description: 'Service description',
    }
    setFormData((prev: any) => ({
      ...prev,
      services: [...(prev.services || []), newService],
    }))
  }

  const removeService = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      services: prev.services.filter((_: any, i: number) => i !== index),
    }))
  }

  const moveService = (index: number, direction: 'up' | 'down') => {
    setFormData((prev: any) => {
      const newServices = [...prev.services]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= newServices.length) return prev
      ;[newServices[index], newServices[newIndex]] = [
        newServices[newIndex],
        newServices[index],
      ]
      return { ...prev, services: newServices }
    })
  }

  const renderServicesForm = () => (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium">Heading</label>
        <input
          type="text"
          value={formData.heading || ''}
          onChange={(e) => updateField(['heading'], e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Subtitle</label>
        <input
          type="text"
          value={formData.subtitle || ''}
          onChange={(e) => updateField(['subtitle'], e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium">Services</label>
          <button
            type="button"
            onClick={addService}
            className="rounded-lg bg-black px-3 py-1 text-sm text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            Add Service
          </button>
        </div>
        <div className="space-y-4">
          {formData.services?.map((service: any, index: number) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-gray-300 p-4 dark:border-gray-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Service {index + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveService(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
                    title="Move up"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveService(index, 'down')}
                    disabled={index === formData.services.length - 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-400 dark:hover:text-white"
                    title="Move down"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove"
                  >
                    <svg
                      className="h-4 w-4"
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
              </div>
              <input
                type="text"
                value={service.title}
                onChange={(e) =>
                  updateArrayField(['services'], index, 'title', e.target.value)
                }
                placeholder="Title"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <input
                type="text"
                value={service.icon}
                onChange={(e) =>
                  updateArrayField(['services'], index, 'icon', e.target.value)
                }
                placeholder="Icon (e.g., Camera, Users, Building2, Sparkles)"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <textarea
                value={service.description}
                onChange={(e) =>
                  updateArrayField(
                    ['services'],
                    index,
                    'description',
                    e.target.value
                  )
                }
                placeholder="Description"
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )

  const renderCtaForm = () => (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium">Heading</label>
        <input
          type="text"
          value={formData.heading || ''}
          onChange={(e) => updateField(['heading'], e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Subtitle</label>
        <input
          type="text"
          value={formData.subtitle || ''}
          onChange={(e) => updateField(['subtitle'], e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Button Text</label>
          <input
            type="text"
            value={formData.buttonText || ''}
            onChange={(e) => updateField(['buttonText'], e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Button URL</label>
          <input
            type="text"
            value={formData.buttonUrl || ''}
            onChange={(e) => updateField(['buttonUrl'], e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
    </>
  )

  const sectionTitles = {
    about: 'Edit About Section',
    services: 'Edit Services Section',
    cta: 'Edit Call to Action',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
          <h2 className="font-serif text-2xl text-gray-900 dark:text-white">
            {sectionTitles[section]}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(90vh-180px)] overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {section === 'about' && renderAboutForm()}
            {section === 'services' && renderServicesForm()}
            {section === 'cta' && renderCtaForm()}
          </div>

          {error && (
            <div className="mx-6 mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-4 border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-black px-6 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-100"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
