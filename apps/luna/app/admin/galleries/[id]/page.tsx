// ABOUTME: Gallery edit page with image management
// ABOUTME: Provides drag-drop reordering, inline editing, and bulk actions

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import GalleryPublishControls from '@/components/sol/admin/GalleryPublishControls'

const GalleryImageManager = dynamic(
  () => import('@/components/sol/admin/GalleryImageManager'),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-16 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded bg-gray-200" />
          ))}
        </div>
      </div>
    ),
  }
)

export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      _count: {
        select: { images: true },
      },
    },
  })

  if (!gallery) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {gallery.title}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  gallery.status === 'PUBLISHED'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}
              >
                {gallery.status === 'PUBLISHED' ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {gallery._count?.images || 0} images
            </p>
          </div>
          <div className="flex items-center gap-3">
            <GalleryPublishControls
              galleryId={gallery.id}
              gallerySlug={gallery.slug}
              status={gallery.status}
            />
            <Link
              href={`/admin/galleries/${gallery.id}/edit`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Edit Settings
            </Link>
          </div>
        </div>
      </div>

      <GalleryImageManager gallery={gallery} />
    </div>
  )
}
