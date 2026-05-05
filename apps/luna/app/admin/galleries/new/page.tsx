// ABOUTME: Create new gallery page
// ABOUTME: Form interface for creating a new gallery

import GalleryForm from '@/components/sol/admin/GalleryForm'
import Link from 'next/link'

export default function NewGalleryPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/galleries"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Galleries
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Create New Gallery
        </h1>
      </div>

      <div className="rounded-lg bg-white p-gutter shadow">
        <GalleryForm />
      </div>
    </div>
  )
}
