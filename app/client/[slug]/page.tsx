// ABOUTME: Public client gallery viewing page
// ABOUTME: Password-protected gallery access for clients to view and download photos

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// Force dynamic rendering - database not available at build time
export const dynamic = 'force-dynamic'
import { notFound, redirect } from 'next/navigation'
import ClientGalleryView from '@/components/luna/ClientGalleryView'
import { FinalPaymentBanner } from './FinalPaymentBanner'
import PremiumGallery from './PremiumGallery'
import GlobalFooter from '@/components/commons/GlobalFooter'
import type { PaymentCalculation } from '@/lib/calculate-final-payment'

export default async function ClientGalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  const { slug } = await params

  if (!session?.user) {
    redirect(`/login?callbackUrl=/client/${slug}`)
  }

  const gallery = await prisma.clientGallery.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      expiresAt: true,
      status: true,
      submittedAt: true,
      clientId: true,
      contractId: true,
      finalPaymentStatus: true,
      downloadQuotaUsed: true,
      client: {
        select: {
          name: true,
          email: true,
        },
      },
      contract: {
        select: {
          id: true,
          retouchesIncluded: true,
          pricePerExtraRetouch: true,
          totalAmount: true,
          depositAmount: true,
          downloadQuota: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
        select: {
          id: true,
          url: true,
          altText: true,
          width: true,
          height: true,
          isFavorite: true,
          isArtistPick: true,
          downloaded: true,
          retouchRequests: {
            where: {
              status: {
                in: ['PENDING', 'IN_PROGRESS'],
              },
            },
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  })

  if (!gallery) {
    notFound()
  }

  if (session.user.role !== 'ADMIN' && gallery.clientId !== session.user.id) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center pt-20">
          <div className="max-w-md rounded-lg border bg-white p-8 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Access Denied
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              You don&apos;t have permission to view this gallery.
            </p>
          </div>
        </div>
        <GlobalFooter />
      </>
    )
  }

  if (gallery.expiresAt && new Date(gallery.expiresAt) < new Date()) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center pt-20">
          <div className="max-w-md rounded-lg border bg-white p-8 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Gallery Expired
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              This gallery is no longer available. Please contact your
              photographer for access.
            </p>
          </div>
        </div>
        <GlobalFooter />
      </>
    )
  }

  // Determine if payment banner should be shown
  const showPaymentBanner =
    gallery.contract &&
    gallery.finalPaymentStatus !== 'COMPLETED' &&
    gallery.contractId !== null

  // Fetch payment calculation if banner should be shown
  let paymentCalculation: PaymentCalculation | null = null
  if (showPaymentBanner) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3333'}/api/client-galleries/${gallery.id}/final-payment-amount`,
        {
          cache: 'no-store',
        }
      )
      if (response.ok) {
        paymentCalculation = await response.json()
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch payment calculation')
    }
  }

  // Check if this is a premium gallery (final payment completed)
  const isPremium = gallery.finalPaymentStatus === 'COMPLETED'

  // Calculate download quota remaining for premium galleries
  const downloadQuotaRemaining =
    isPremium && gallery.contract
      ? gallery.contract.downloadQuota - gallery.downloadQuotaUsed
      : 0

  // If premium, render the premium gallery experience
  if (isPremium) {
    return (
      <>
        <div className="pt-20">
          <PremiumGallery
            images={gallery.images}
            galleryId={gallery.id}
            downloadQuotaRemaining={downloadQuotaRemaining}
          />
        </div>
        <GlobalFooter />
      </>
    )
  }

  // Otherwise, render the standard gallery with payment banner if needed
  return (
    <>
      <div className="pt-20">
        {showPaymentBanner &&
          paymentCalculation &&
          paymentCalculation.totalDue > 0 && (
            <div className="container mx-auto px-4 pt-8">
              <FinalPaymentBanner
                galleryId={gallery.id}
                calculation={paymentCalculation}
                expiresAt={gallery.expiresAt}
              />
            </div>
          )}
        <ClientGalleryView gallery={gallery} userId={session.user.id} />
      </div>
      <GlobalFooter />
    </>
  )
}
