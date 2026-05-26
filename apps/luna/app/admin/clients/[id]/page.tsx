// ABOUTME: Admin page for managing individual client gallery
// ABOUTME: Clean, focused design with images as the hero element

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import SendClientGalleryEmailButton from '@/components/sol/admin/SendClientGalleryEmailButton'
import ClientGallerySettings from '@/components/sol/admin/ClientGallerySettings'
import ClientGalleryImageManager from '@/components/sol/admin/ClientGalleryImageManager'
import DeleteGalleryButton from '@/components/sol/admin/DeleteGalleryButton'

export default async function ClientGalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const gallery = await prisma.clientGallery.findUnique({
    where: { id },
    include: {
      client: true,
      contract: true,
      images: {
        include: {
          retouchRequests: {
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })

  if (!gallery) {
    notFound()
  }

  const allClients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { id: true, name: true, email: true },
    orderBy: { email: 'asc' },
  })

  const isExpired =
    gallery.expiresAt && new Date(gallery.expiresAt) < new Date()

  const pendingRetouches = gallery.images.filter((img) =>
    img.retouchRequests.some((req) => req.status === 'PENDING')
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/admin/clients"
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              ← Client Galleries
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {gallery.title}
            </h1>
            {isExpired ? (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-400">
                Expired
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                Active
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {gallery.client.name || gallery.client.email}
            {' · '}
            {gallery.images.length}{' '}
            {gallery.images.length === 1 ? 'photo' : 'photos'}
            {gallery.expiresAt && (
              <>
                {' · '}
                {isExpired ? 'Expired' : 'Expires'}{' '}
                {formatDistanceToNow(new Date(gallery.expiresAt), {
                  addSuffix: true,
                })}
              </>
            )}
            {pendingRetouches > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                {pendingRetouches} retouch pending
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <SendClientGalleryEmailButton
            galleryId={gallery.id}
            clientName={gallery.client.name || 'Valued Client'}
            clientEmail={gallery.client.email}
            galleryTitle={gallery.title}
            gallerySlug={gallery.slug}
            password={gallery.password}
            expiresAt={gallery.expiresAt}
            imageCount={gallery.images.length}
          />
          <Link
            href={`/client/${gallery.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Preview
          </Link>
          <DeleteGalleryButton
            galleryId={gallery.id}
            galleryTitle={gallery.title}
          />
        </div>
      </div>

      {/* Settings - Collapsible */}
      <ClientGallerySettings
        galleryId={gallery.id}
        title={gallery.title}
        slug={gallery.slug}
        expiresAt={gallery.expiresAt}
        password={gallery.password}
        status={gallery.status}
        clientId={gallery.clientId}
        clients={allClients}
      />

      {/* Images - The Hero */}
      <ClientGalleryImageManager
        galleryId={gallery.id}
        images={gallery.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          sortOrder: img.sortOrder,
          isFavorite: img.isFavorite,
          isArtistPick: img.isArtistPick,
          retouchRequests: img.retouchRequests.map((req) => ({
            id: req.id,
            status: req.status as
              | 'PENDING'
              | 'IN_PROGRESS'
              | 'COMPLETED'
              | 'DECLINED',
            notes: req.notes,
          })),
        }))}
      />
    </div>
  )
}
