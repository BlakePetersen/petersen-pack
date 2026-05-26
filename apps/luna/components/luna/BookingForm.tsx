// ABOUTME: Form component for submitting booking requests
// ABOUTME: Collects client information and session details for a selected time slot

'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/commons'

// Valid session types for the booking form dropdown
const SESSION_TYPES = [
  'Headshots',
  'Branding & Commercial',
  'Lifestyle & Family',
  'Animals & Pets',
  'Boudoir',
  'Underwater',
  'Yoga & Dance',
  'Other',
] as const

type BookingFormProps = {
  slotId: string
  onSuccess?: () => void
}

export function BookingForm({ slotId, onSuccess }: BookingFormProps) {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get('service')

  // Get initial service type from URL param if it matches a valid option
  const getInitialServiceType = (): string => {
    if (!serviceParam) return ''
    // Check if it's a valid session type
    if (
      SESSION_TYPES.includes(serviceParam as (typeof SESSION_TYPES)[number])
    ) {
      return serviceParam
    }
    return ''
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [serviceType, setServiceType] = useState(getInitialServiceType)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      availabilitySlotId: slotId,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      serviceType: formData.get('serviceType') as string,
      message: formData.get('message') as string,
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to submit booking')
      }

      setIsSubmitted(true)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center dark:border-green-900 dark:bg-green-900/20">
        <svg
          className="mx-auto h-12 w-12 text-green-600 dark:text-green-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
          Booking Request Submitted!
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Thank you for your booking request. Ashley will review it and get back
          to you shortly via email.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Information
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please provide your details to complete the booking request
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-900 dark:text-white"
          >
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 dark:text-white"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-900 dark:text-white"
          >
            Phone (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
          />
        </div>

        <div>
          <label
            htmlFor="serviceType"
            className="block text-sm font-medium text-gray-900 dark:text-white"
          >
            Session Type *
          </label>
          <select
            id="serviceType"
            name="serviceType"
            required
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
          >
            <option value="">Select a session type</option>
            {SESSION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-900 dark:text-white"
        >
          Additional Details (Optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-white dark:focus:ring-white"
          placeholder="Tell Ashley more about what you're looking for..."
        />
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Requesting...' : 'Request Session'}
        </Button>
      </div>
    </form>
  )
}
