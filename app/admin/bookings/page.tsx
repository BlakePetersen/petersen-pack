// ABOUTME: Admin page for viewing and managing booking requests
// ABOUTME: Allows Ashley to review, confirm, or cancel client bookings

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { sendBookingStatusUpdate } from '@/lib/email'

async function updateBookingStatus(formData: FormData) {
  'use server'

  const bookingId = formData.get('bookingId') as string
  const status = formData.get('status') as
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'COMPLETED'

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      availabilitySlot: true,
    },
  })

  // Send email notification for confirmed or cancelled bookings
  if (status === 'CONFIRMED' || status === 'CANCELLED') {
    await sendBookingStatusUpdate({
      name: booking.name,
      email: booking.email,
      serviceType: booking.serviceType,
      sessionDuration: booking.sessionDuration,
      availabilitySlot: {
        date: booking.availabilitySlot.date,
        startTime: booking.availabilitySlot.startTime,
        endTime: booking.availabilitySlot.endTime,
      },
      status,
    })
  }

  redirect('/admin/bookings')
}

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      availabilitySlot: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booking Requests</h1>
        <p className="mt-2 text-gray-600">
          Review and manage client booking requests
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No booking requests yet
          </h3>
          <p className="mt-2 text-gray-600">
            When clients book sessions, they&apos;ll appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-lg border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {booking.name}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {booking.email}
                  </p>

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {booking.email}
                    </div>
                    {booking.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {booking.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                      {new Date(
                        booking.availabilitySlot.date
                      ).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                      {booking.availabilitySlot.startTime} -{' '}
                      {booking.availabilitySlot.endTime}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {booking.serviceType}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
                      {booking.sessionDuration} hour
                      {booking.sessionDuration !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {booking.message}
                      </p>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Requested{' '}
                    {new Date(booking.createdAt).toLocaleString('en-US')}
                  </p>
                </div>

                {booking.status === 'PENDING' && (
                  <div className="ml-4 flex gap-2">
                    <form action={updateBookingStatus}>
                      <input
                        type="hidden"
                        name="bookingId"
                        value={booking.id}
                      />
                      <input type="hidden" name="status" value="CONFIRMED" />
                      <button
                        type="submit"
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      >
                        Confirm
                      </button>
                    </form>
                    <form action={updateBookingStatus}>
                      <input
                        type="hidden"
                        name="bookingId"
                        value={booking.id}
                      />
                      <input type="hidden" name="status" value="CANCELLED" />
                      <button
                        type="submit"
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
