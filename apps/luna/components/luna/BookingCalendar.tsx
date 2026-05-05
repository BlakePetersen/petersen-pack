// ABOUTME: Interactive calendar component for viewing and booking available time slots
// ABOUTME: Groups slots by date and allows users to select a slot for booking

'use client'

import { useState } from 'react'
import { BookingForm } from './BookingForm'
import { trackBookingStart } from '@/lib/analytics'

type AvailabilitySlot = {
  id: string
  date: Date
  startTime: string
  endTime: string
  isAvailable: boolean
  notes: string | null
  _count: {
    bookings: number
  }
}

type BookingCalendarProps = {
  slots: AvailabilitySlot[]
}

export default function BookingCalendar({ slots }: BookingCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  )
  const [availableSlots, setAvailableSlots] =
    useState<AvailabilitySlot[]>(slots)

  const handleBookingSuccess = () => {
    // Remove the booked slot from available slots
    if (selectedSlot) {
      setAvailableSlots((prev) =>
        prev.filter((slot) => slot.id !== selectedSlot.id)
      )
      // Wait a moment to show success message, then go back to calendar
      setTimeout(() => {
        setSelectedSlot(null)
      }, 2000)
    }
  }

  // Group slots by date
  const slotsByDate = availableSlots.reduce(
    (acc, slot) => {
      const dateKey = new Date(slot.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(slot)
      return acc
    },
    {} as Record<string, AvailabilitySlot[]>
  )

  if (availableSlots.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          No availability at this time
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please check back later or contact Ashley directly for scheduling
          options
        </p>
      </div>
    )
  }

  if (selectedSlot) {
    return (
      <div>
        <button
          onClick={() => setSelectedSlot(null)}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to available slots
        </button>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Selected Time Slot
          </h2>
          <div className="mt-4 flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {selectedSlot.startTime} - {selectedSlot.endTime}
            </span>
          </div>
          {selectedSlot.notes && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {selectedSlot.notes}
            </p>
          )}
        </div>

        <div className="mt-8">
          <BookingForm
            slotId={selectedSlot.id}
            onSuccess={handleBookingSuccess}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {Object.entries(slotsByDate).map(([date, dateSlots]) => (
        <div key={date} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-orange-400">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {date}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {dateSlots.length} {dateSlots.length === 1 ? 'slot' : 'slots'}{' '}
                available
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dateSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => {
                  trackBookingStart()
                  setSelectedSlot(slot)
                }}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:border-gray-900 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-300"
              >
                <div className="absolute right-0 top-0 h-20 w-20 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-cyan-500/10 to-orange-400/10 transition-transform group-hover:scale-150" />

                <div className="relative">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700">
                      <svg
                        className="h-5 w-5 text-gray-600 dark:text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                      Available
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {slot.startTime}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      to {slot.endTime}
                    </p>
                  </div>

                  {slot.notes && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {slot.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white">
                    <span>Select this time</span>
                    <svg
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
