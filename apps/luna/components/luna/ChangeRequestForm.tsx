// ABOUTME: Molecule - Change request form for submitted galleries
// ABOUTME: Allows clients to request modifications to their gallery selections

'use client'

import { useState } from 'react'
import { Button } from '@/components/commons'
import { logger } from '@/lib/logger.edge'

type ChangeRequestFormProps = {
  galleryId: string
  onSuccess: () => void
  onCancel: () => void
}

export default function ChangeRequestForm({
  galleryId,
  onSuccess,
  onCancel,
}: ChangeRequestFormProps) {
  const [requestType, setRequestType] = useState<
    'FAVORITES' | 'RETOUCH' | 'OTHER'
  >('FAVORITES')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `/api/client-galleries/${galleryId}/change-request`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType,
            description,
          }),
        }
      )

      if (response.ok) {
        onSuccess()
      } else {
        throw new Error('Failed to submit change request')
      }
    } catch (error) {
      logger.error({ err: error }, 'Error submitting change request')
      alert('Failed to submit change request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="requestType"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          What would you like to change?
        </label>
        <select
          id="requestType"
          value={requestType}
          onChange={(e) => setRequestType(e.target.value as typeof requestType)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="FAVORITES">Favorite Images</option>
          <option value="RETOUCH">Retouch Requests</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Please describe the changes you&apos;d like to make
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          placeholder="Example: I'd like to add image #5 to my favorites and remove image #12 from the retouch list."
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !description.trim()}
          className="flex-1"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  )
}
