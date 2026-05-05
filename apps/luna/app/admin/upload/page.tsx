// ABOUTME: Image upload page for admin
// ABOUTME: Interface for uploading images to galleries

import { prisma } from '@/lib/prisma'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const GalleryImageUploadClient = dynamic(
  () => import('@/components/sol/admin/GalleryImageUploadClient')
)

export default async function UploadPage() {
  const galleries = await prisma.gallery.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: { title: 'asc' },
  })

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Upload Images
      </h1>

      {galleries.length === 0 ? (
        <div className="rounded-lg bg-white p-gutter-lg text-center shadow dark:bg-gray-800">
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            You need to create a gallery before uploading images.
          </p>
          <Link
            href="/admin/galleries/new"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Create Your First Gallery
          </Link>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-gutter shadow dark:bg-gray-800">
          <GalleryImageUploadClient galleries={galleries} />
        </div>
      )}
    </div>
  )
}
