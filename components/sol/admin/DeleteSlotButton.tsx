// ABOUTME: Client component for deleting availability slots
// ABOUTME: Handles confirmation dialog and form submission

'use client'

import { logger } from '@/lib/logger.edge'

export default function DeleteSlotButton({ slotId }: { slotId: string }) {
  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!confirm('Are you sure you want to delete this availability slot?')) {
      return
    }

    try {
      const response = await fetch(`/api/availability/${slotId}/delete`, {
        method: 'POST',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete slot')
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to delete')
      alert('Failed to delete slot')
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-600 transition-colors hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
    >
      Delete
    </button>
  )
}
