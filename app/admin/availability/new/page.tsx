// ABOUTME: Form to create new availability slots
// ABOUTME: Admin interface for adding available time slots

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ButtonLink } from '@/components/commons'

async function createAvailability(formData: FormData) {
  'use server'

  const date = formData.get('date') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const notes = formData.get('notes') as string

  await prisma.availabilitySlot.create({
    data: {
      date: new Date(date),
      startTime,
      endTime,
      isAvailable: true,
      notes: notes || null,
    },
  })

  redirect('/admin/availability')
}

export default function NewAvailabilityPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Add Availability
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new time slot for client bookings
        </p>
      </div>

      <div className="max-w-2xl">
        <form
          action={createAvailability}
          className="space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-gray-400 dark:focus:ring-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-gray-400 dark:focus:ring-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-gray-400 dark:focus:ring-gray-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-gray-400 dark:focus:ring-gray-400"
              placeholder="Any special notes about this time slot..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-400 dark:focus:ring-offset-gray-800"
            >
              Create Availability
            </button>
            <ButtonLink href="/admin/availability" variant="outline">
              Cancel
            </ButtonLink>
          </div>
        </form>
      </div>
    </div>
  )
}
