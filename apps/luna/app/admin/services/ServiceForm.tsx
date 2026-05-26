// ABOUTME: Shared form component for creating and editing services
// ABOUTME: Handles form state, validation, and API submission

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface ProcessStep {
  id: string
  title: string
  stepNumber: number
}

interface InfoCard {
  id: string
  title: string
}

interface ServiceFormProps {
  service?: {
    id: string
    name: string
    slug: string
    description: string
    heroImage: string | null
    isActive: boolean
    sortOrder: number
    processSteps: Array<{ processStepId: string }>
    infoCards: Array<{ infoCardId: string }>
  }
  processSteps: ProcessStep[]
  infoCards: InfoCard[]
}

export function ServiceForm({
  service,
  processSteps,
  infoCards,
}: ServiceFormProps) {
  const router = useRouter()
  const isEditing = !!service

  const [name, setName] = useState(service?.name || '')
  const [slug, setSlug] = useState(service?.slug || '')
  const [description, setDescription] = useState(service?.description || '')
  const [heroImage, setHeroImage] = useState(service?.heroImage || '')
  const [isActive, setIsActive] = useState(service?.isActive ?? true)
  const [selectedProcessSteps, setSelectedProcessSteps] = useState<string[]>(
    service?.processSteps.map((ps) => ps.processStepId) || []
  )
  const [selectedInfoCards, setSelectedInfoCards] = useState<string[]>(
    service?.infoCards.map((ic) => ic.infoCardId) || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!isEditing) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        name,
        slug,
        description,
        heroImage: heroImage || null,
        isActive,
        sortOrder: service?.sortOrder ?? 0,
        processStepIds: selectedProcessSteps,
        infoCardIds: selectedInfoCards,
      }

      const res = await fetch(
        isEditing ? `/api/admin/services/${service.id}` : '/api/admin/services',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save service')
      }

      router.push('/admin/services')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleProcessStep = (id: string) => {
    setSelectedProcessSteps((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleInfoCard = (id: string) => {
    setSelectedInfoCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h2>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Service Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              placeholder="e.g., Portrait Photography"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              URL Slug
            </label>
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              placeholder="e.g., portrait-photography"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This will be used in the URL: /services/{slug || 'your-slug'}
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              placeholder="Describe this service..."
            />
          </div>

          <div>
            <label
              htmlFor="heroImage"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Hero Image URL
            </label>
            <input
              type="url"
              id="heroImage"
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              placeholder="https://..."
            />
            {heroImage && (
              <div className="relative mt-4 h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src={heroImage}
                  alt="Hero preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Active (visible on the public site)
            </label>
          </div>
        </div>
      </div>

      {processSteps.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Process Steps
          </h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Select the process steps to display on this service page
          </p>

          <div className="space-y-3">
            {processSteps.map((step) => (
              <label
                key={step.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedProcessSteps.includes(step.id)}
                  onChange={() => toggleProcessStep(step.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold dark:bg-gray-700">
                  {step.stepNumber}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {step.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {infoCards.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Info Cards
          </h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Select the info cards to display on this service page
          </p>

          <div className="space-y-3">
            {infoCards.map((card) => (
              <label
                key={card.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedInfoCards.includes(card.id)}
                  onChange={() => toggleInfoCard(card.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900 dark:text-white">
                  {card.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/services"
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving...'
            : isEditing
              ? 'Save Changes'
              : 'Create Service'}
        </button>
      </div>
    </form>
  )
}
