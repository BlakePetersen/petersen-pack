// ABOUTME: Admin page for managing homepage hero carousel slides
// ABOUTME: Create, edit, reorder, and delete hero slides

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ButtonLink } from '@/components/commons'

export const metadata = {
  title: 'Hero Slides | Admin',
  description: 'Manage homepage hero carousel slides',
}

export default async function HeroSlidesPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hero Slides</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage homepage hero carousel slides
          </p>
        </div>
        <ButtonLink href="/admin/hero-slides/new">Add New Slide</ButtonLink>
      </div>

      {slides.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-gutter-lg text-center dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <svg
              className="h-8 w-8 text-gray-400"
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
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            No Hero Slides
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Create your first hero slide to display on the homepage.
          </p>
          <ButtonLink href="/admin/hero-slides/new">
            Create First Slide
          </ButtonLink>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex-shrink-0">
                <img
                  src={slide.imageUrl || ''}
                  alt={slide.title}
                  className="h-24 w-40 rounded object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {slide.title}
                  </h3>
                  {!slide.isActive && (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      Inactive
                    </span>
                  )}
                </div>
                {slide.linkUrl && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Links to: {slide.linkUrl}
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Sort Order: {slide.sortOrder}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/hero-slides/${slide.id}`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
