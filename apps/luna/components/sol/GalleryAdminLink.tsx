// ABOUTME: Admin edit link for gallery pages
// ABOUTME: Shows edit button for admins to manage galleries

'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Edit } from 'lucide-react'

type GalleryAdminLinkProps = {
  galleryId: string
}

export default function GalleryAdminLink({ galleryId }: GalleryAdminLinkProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  if (!isAdmin) return null

  return (
    <Link
      href={`/admin/galleries/${galleryId}`}
      className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
    >
      <Edit className="h-4 w-4" />
      Edit Gallery
    </Link>
  )
}
