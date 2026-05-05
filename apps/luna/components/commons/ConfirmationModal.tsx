// ABOUTME: Molecule - Confirmation modal for successful actions
// ABOUTME: Displays success message with icon and action button

import { ReactNode } from 'react'
import { Button } from './Button'

type ConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  icon?: ReactNode
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  icon,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        {/* Icon */}
        {icon && <div className="mb-4 flex justify-center">{icon}</div>}

        {/* Title */}
        <h3 className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>

        {/* Message */}
        <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
          {message}
        </p>

        {/* Close Button */}
        <Button onClick={onClose} variant="primary" className="w-full">
          Close
        </Button>
      </div>
    </div>
  )
}
