// ABOUTME: Client dashboard page showing all assigned galleries
// ABOUTME: Displays user's galleries with preview images and access links

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - database not available at build time
export const dynamic = 'force-dynamic'
import GlobalFooter from '@/components/commons/GlobalFooter'
import { Container } from '@/components/commons'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'My Galleries | Client Portal',
  description: 'View and access all your photo galleries.',
}

async function getClientData(userId: string) {
  const galleries = await prisma.clientGallery.findMany({
    where: {
      clientId: userId,
    },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: {
          url: true,
          altText: true,
          isFavorite: true,
        },
      },
      _count: {
        select: {
          images: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const galleryIds = galleries.map((g) => g.id)

  const [pendingRetouches, pendingChangeRequests] = await Promise.all([
    // Get count of pending retouch requests
    prisma.retouchRequest.count({
      where: {
        clientGalleryId: { in: galleryIds },
        status: 'PENDING',
      },
    }),
    // Get count of pending change requests
    prisma.changeRequest.count({
      where: {
        clientGalleryId: { in: galleryIds },
        status: 'PENDING',
      },
    }),
  ])

  return { galleries, pendingRetouches, pendingChangeRequests }
}

export default async function ClientDashboardPage() {
  const session = await auth()

  // Redirect if not logged in
  if (!session?.user) {
    redirect('/login?callbackUrl=/client-portal/dashboard')
  }

  // If admin, redirect to admin panel
  if (session.user.role === 'ADMIN') {
    redirect('/admin')
  }

  const { galleries, pendingRetouches, pendingChangeRequests } =
    await getClientData(session.user.id!)

  // Calculate pending tasks
  const pendingGalleries = galleries.filter((g) => g.status === 'PENDING')
  const draftGalleries = galleries.filter((g) => g.status === 'DRAFT')
  const galleriesNeedingFavorites = galleries.filter((g) => {
    const hasFavorites = g.images.some((img) => img.isFavorite)
    return g.status === 'APPROVED' && !hasFavorites && g._count.images > 0
  })

  const hasPendingTasks =
    pendingGalleries.length > 0 ||
    pendingRetouches > 0 ||
    pendingChangeRequests > 0 ||
    galleriesNeedingFavorites.length > 0

  return (
    <>
      <main className="min-h-screen">
        <section className="px-gutter pb-section pt-page-top">
          <Container>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome, {session.user.name}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your galleries and complete pending tasks
              </p>
            </div>

            {/* Pending Tasks Section */}
            {hasPendingTasks && (
              <div className="mb-12">
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                  Pending Tasks
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Gallery Reviews */}
                  {pendingGalleries.length > 0 && (
                    <Link
                      href="#pending-galleries"
                      className="group rounded-lg border-2 border-orange-200 bg-orange-50 p-6 transition-all hover:border-orange-300 dark:border-orange-900 dark:bg-orange-950 dark:hover:border-orange-800"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                          <svg
                            className="h-6 w-6 text-orange-600 dark:text-orange-400"
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
                        <div>
                          <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                            Gallery Review
                          </h3>
                          <p className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                            {pendingGalleries.length}{' '}
                            {pendingGalleries.length === 1
                              ? 'gallery needs'
                              : 'galleries need'}{' '}
                            your review
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Favorites Selection */}
                  {galleriesNeedingFavorites.length > 0 && (
                    <Link
                      href="#galleries"
                      className="group rounded-lg border-2 border-blue-200 bg-blue-50 p-6 transition-all hover:border-blue-300 dark:border-blue-900 dark:bg-blue-950 dark:hover:border-blue-800"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                          <svg
                            className="h-6 w-6 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                            Select Favorites
                          </h3>
                          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                            {galleriesNeedingFavorites.length}{' '}
                            {galleriesNeedingFavorites.length === 1
                              ? 'gallery awaits'
                              : 'galleries await'}{' '}
                            your selections
                          </p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Pending Retouches */}
                  {pendingRetouches > 0 && (
                    <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6 dark:border-purple-900 dark:bg-purple-950">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                          <svg
                            className="h-6 w-6 text-purple-600 dark:text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                            Retouch Requests
                          </h3>
                          <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                            {pendingRetouches}{' '}
                            {pendingRetouches === 1 ? 'request' : 'requests'}{' '}
                            pending
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Container>
        </section>

        <section className="px-gutter py-section">
          <Container>
            {/* Pending Galleries Requiring Action */}
            {pendingGalleries.length > 0 && (
              <div id="pending-galleries" className="mb-12">
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                  Galleries Requiring Review
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pendingGalleries.map((gallery) => (
                    <Link
                      key={gallery.id}
                      href={`/client/${gallery.slug}`}
                      className="group overflow-hidden rounded-2xl border-2 border-orange-200 bg-white shadow-soft transition-all hover:shadow-lg dark:border-orange-800 dark:bg-gray-800"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {gallery.images[0] ? (
                          <Image
                            src={gallery.images[0].url}
                            alt={gallery.images[0].altText || gallery.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <svg
                              className="h-12 w-12 text-gray-300 dark:text-gray-600"
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
                        )}
                        <div className="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                          Needs Review
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                          {gallery.title}
                        </h3>
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{gallery._count.images} photos</span>
                          {gallery.expiresAt && (
                            <span>
                              Expires{' '}
                              {new Date(gallery.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All Galleries */}
            {galleries.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-soft dark:border-gray-700 dark:bg-gray-800">
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
                  No Galleries Yet
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your photo galleries will appear here once they&apos;re ready.
                  <br />
                  You&apos;ll receive an email notification when a gallery is
                  available.
                </p>
              </div>
            ) : (
              <div id="galleries">
                <h2 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                  All Galleries
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {galleries.map((gallery) => {
                    const needsFavorites =
                      gallery.status === 'APPROVED' &&
                      !gallery.images.some((img) => img.isFavorite) &&
                      gallery._count.images > 0
                    const statusColors = {
                      DRAFT: 'bg-gray-500',
                      PENDING: 'bg-orange-500',
                      APPROVED: needsFavorites ? 'bg-blue-500' : 'bg-green-500',
                      COMPLETED: 'bg-green-600',
                    }
                    const statusLabels = {
                      DRAFT: 'Draft',
                      PENDING: 'Needs Review',
                      APPROVED: needsFavorites ? 'Select Favorites' : 'Ready',
                      COMPLETED: 'Completed',
                    }

                    return (
                      <Link
                        key={gallery.id}
                        href={`/client/${gallery.slug}`}
                        className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
                          {gallery.images[0] ? (
                            <Image
                              src={gallery.images[0].url}
                              alt={gallery.images[0].altText || gallery.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <svg
                                className="h-12 w-12 text-gray-300 dark:text-gray-600"
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
                          )}
                          <div
                            className={`absolute right-3 top-3 rounded-full ${statusColors[gallery.status]} px-3 py-1 text-xs font-semibold text-white`}
                          >
                            {statusLabels[gallery.status]}
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
                            {gallery.title}
                          </h3>
                          <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>{gallery._count.images} photos</span>
                            {gallery.expiresAt && (
                              <span>
                                Expires{' '}
                                {new Date(
                                  gallery.expiresAt
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
              <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                Need Help?
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                If you have any questions about your galleries or need
                assistance, please{' '}
                <Link
                  href="/contact"
                  className="font-semibold underline hover:text-blue-600 dark:hover:text-blue-400"
                >
                  contact us
                </Link>
                .
              </p>
            </div>
          </Container>
        </section>
      </main>
      <GlobalFooter />
    </>
  )
}
