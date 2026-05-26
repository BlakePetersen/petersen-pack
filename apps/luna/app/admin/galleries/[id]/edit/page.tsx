// ABOUTME: Gallery metadata edit page
// ABOUTME: Form for editing gallery title, slug, and description

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import GalleryForm from '@/components/sol/admin/GalleryForm'
import Link from 'next/link'

export default async function EditGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      featured: true,
    },
  })

  if (!gallery) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/admin/galleries/${id}`}
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back to Gallery
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Edit Gallery Settings
        </h1>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <GalleryForm gallery={gallery} />
      </div>
    </div>
  )
}
