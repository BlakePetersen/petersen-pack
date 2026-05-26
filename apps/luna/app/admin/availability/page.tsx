// ABOUTME: Admin page for managing availability slots
// ABOUTME: Allows Ashley to add/edit/remove available time slots for bookings

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ButtonLink } from '@/components/commons'
import DeleteSlotButton from '@/components/sol/admin/DeleteSlotButton'

export default async function AvailabilityPage() {
  const slots = await prisma.availabilitySlot.findMany({
    where: {
      date: {
        gte: new Date(),
      },
    },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Availability Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your available time slots for client bookings
          </p>
        </div>
        <ButtonLink href="/admin/availability/new">Add Availability</ButtonLink>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
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
            No availability slots yet
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get started by creating your first available time slot
          </p>
          <div className="mt-6">
            <ButtonLink href="/admin/availability/new">
              Add Availability
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="rounded-lg border border-gray-200 bg-white p-gutter shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(slot.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    {slot.isAvailable ? (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Available
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <span className="flex items-center gap-1">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {slot._count.bookings} booking
                      {slot._count.bookings !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {slot.notes && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {slot.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/availability/${slot.id}/edit`}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    Edit
                  </Link>
                  <DeleteSlotButton slotId={slot.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
