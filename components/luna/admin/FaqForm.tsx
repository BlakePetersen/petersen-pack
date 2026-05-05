// ABOUTME: FAQ create/edit form with rich text editor
// ABOUTME: Handles form validation and submission for FAQ data

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RichTextEditor } from './RichTextEditor'

interface Service {
  id: string
  name: string
  slug: string
}

interface Faq {
  id: string
  question: string
  answer: any
  category: string
  serviceId: string | null
  sortOrder: number
  isActive: boolean
  service?: Service | null
}

interface FaqFormProps {
  faq?: Faq
  services: Service[]
}

const categories = [
  { value: 'GENERAL', label: 'General' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'PRICING', label: 'Pricing' },
  { value: 'PROCESS', label: 'Process' },
  { value: 'POLICIES', label: 'Policies' },
]

export function FaqForm({ faq, services }: FaqFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState(() => {
    // Handle answer which may be object or string
    let answerJson: string
    if (faq?.answer) {
      if (typeof faq.answer === 'string') {
        answerJson = faq.answer
      } else {
        answerJson = JSON.stringify(faq.answer)
      }
    } else {
      answerJson = JSON.stringify({ type: 'doc', content: [] })
    }

    return {
      question: faq?.question || '',
      answer: answerJson,
      category: faq?.category || 'GENERAL',
      serviceId: faq?.serviceId || 'null',
      sortOrder: faq?.sortOrder ?? 0,
      isActive: faq?.isActive ?? true,
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.question.trim()) {
      setError('Question is required')
      setLoading(false)
      return
    }

    if (formData.question.length < 5 || formData.question.length > 500) {
      setError('Question must be between 5 and 500 characters')
      setLoading(false)
      return
    }

    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer,
        category: formData.category,
        serviceId: formData.serviceId === 'null' ? null : formData.serviceId,
        sortOrder: formData.sortOrder,
        isActive: formData.isActive,
      }

      const url = faq ? `/api/admin/faqs/${faq.id}` : '/api/admin/faqs'
      const method = faq ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save FAQ')
      }

      router.push('/admin/faqs')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Question <span className="text-red-500">*</span>
            </label>
            <input
              id="question"
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              placeholder="What should I bring to my session?"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formData.question.length}/500 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="answer"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Answer <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={formData.answer}
              onChange={(json) => setFormData({ ...formData, answer: json })}
              placeholder="Write your answer here..."
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="service"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Service <span className="text-red-500">*</span>
              </label>
              <select
                id="service"
                value={formData.serviceId}
                onChange={(e) =>
                  setFormData({ ...formData, serviceId: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                required
              >
                <option value="null">General FAQ</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                General FAQs appear on /faq page. Service FAQs appear on service
                pages.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label
                htmlFor="sortOrder"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Sort Order
              </label>
              <input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Lower numbers appear first
              </p>
            </div>

            <div>
              <label
                htmlFor="isActive"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <div className="mt-3 flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Active (visible to public)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : faq ? 'Update FAQ' : 'Create FAQ'}
        </button>
      </div>
    </form>
  )
}
