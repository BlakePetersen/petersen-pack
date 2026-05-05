// ABOUTME: Gallery management page for admin
// ABOUTME: Lists all galleries with create, edit, and delete actions

import { prisma } from '@/lib/prisma'
import dynamic from 'next/dynamic'

const GalleryListManager = dynamic(
  () => import('@/components/sol/admin/GalleryListManager'),
  {
    loading: () => (
      <div className="animate-pulse space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-10 w-48 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-12 w-40 rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-lg bg-gray-200 dark:bg-gray-800"
            />
          ))}
        </div>
      </div>
    ),
  }
)

export default async function GalleriesPage() {
  const galleries = await prisma.gallery.findMany({
    include: {
      _count: {
        select: { images: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return <GalleryListManager initialGalleries={galleries} />
}
