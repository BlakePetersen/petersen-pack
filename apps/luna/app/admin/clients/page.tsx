// ABOUTME: Admin page for managing client galleries
// ABOUTME: List, create, and manage private client photo galleries

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'

export default async function AdminClientsPage() {
  const clientGalleries = await prisma.clientGallery.findMany({
    include: {
      client: true,
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Galleries</h1>
          <p className="mt-2 text-gray-600">
            Manage private photo galleries for clients
          </p>
        </div>
        <Link
          href="/admin/clients/create"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Create Client Gallery
        </Link>
      </div>

      {clientGalleries.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No client galleries yet
          </h3>
          <p className="mt-2 text-gray-500">
            Create a private gallery to share photos with your clients
          </p>
          <Link
            href="/admin/clients/create"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Create Your First Gallery
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clientGalleries.map((gallery) => (
            <div
              key={gallery.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {gallery.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {gallery.client.name || gallery.client.email}
                    </p>
                  </div>
                  {gallery.password && (
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      🔒 Protected
                    </span>
                  )}
                </div>

                <div className="mb-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Images:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {gallery.images.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatDistanceToNow(new Date(gallery.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {gallery.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span>Expires:</span>
                      <span
                        className={`font-semibold ${
                          new Date(gallery.expiresAt) < new Date()
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {formatDistanceToNow(new Date(gallery.expiresAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/clients/${gallery.id}`}
                    className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Manage
                  </Link>
                  <Link
                    href={`/client/${gallery.slug}`}
                    target="_blank"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    View
                  </Link>
                </div>

                <div className="mt-3 rounded bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Gallery Link:
                  </p>
                  <Link
                    href={`/client/${gallery.slug}`}
                    target="_blank"
                    className="mt-1 block break-all text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    /client/{gallery.slug}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
