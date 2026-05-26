// ABOUTME: Admin page for managing testimonials
// ABOUTME: Lists all testimonials with edit and delete options

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function TestimonialsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage client testimonials and reviews
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Add Testimonial
        </Link>
      </div>

      <div className="grid gap-4">
        {testimonials.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              No testimonials yet
            </p>
            <Link
              href="/admin/testimonials/new"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Create your first testimonial
            </Link>
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {testimonial.clientName}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {testimonial.projectType}
                    </span>
                    {!testimonial.isActive && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-gray-600 dark:text-gray-300">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Rating: {'★'.repeat(testimonial.rating)}
                      {'☆'.repeat(5 - testimonial.rating)}
                    </span>
                    <span>Sort Order: {testimonial.sortOrder}</span>
                  </div>
                </div>
                <Link
                  href={`/admin/testimonials/${testimonial.id}`}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
