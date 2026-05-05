// ABOUTME: Modal displaying retouch pricing information with "don't show again" option
// ABOUTME: Shows pricing and allows users to dismiss permanently per gallery

'use client'

import { useState } from 'react'

interface RetouchPricingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onDontShowAgain: () => void
  price: string
}

function RetouchPricingModal({
  isOpen,
  onClose,
  onConfirm,
  onDontShowAgain,
  price = '$50',
}: RetouchPricingModalProps) {
  const [dontShow, setDontShow] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    if (dontShow) {
      onDontShowAgain()
    }
    onConfirm()
  }

  const handleClose = () => {
    if (dontShow) {
      onDontShowAgain()
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 p-4"
      onClick={handleClose}
    >
      <div
        className="inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="retouch-modal-title"
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 pb-4 pt-5 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h3
                id="retouch-modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Professional Retouching
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Additional service pricing
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-400"
              aria-label="Close modal"
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
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Retouch Price:{' '}
                  <span className="text-lg font-bold">{price}</span> per image
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>Professional retouching includes:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Color correction and enhancement</li>
              <li>Blemish and spot removal</li>
              <li>Lighting adjustments</li>
              <li>Professional skin smoothing</li>
              <li>Background cleanup</li>
            </ul>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Turnaround time: 3-5 business days
            </p>
          </div>

          {/* Don't show again checkbox */}
          <div className="mt-6 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Don&apos;t show this message again for this gallery
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 bg-gray-50 px-6 py-4 dark:bg-gray-900">
          <button
            onClick={handleClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Request Retouch
          </button>
        </div>
      </div>
    </div>
  )
}
