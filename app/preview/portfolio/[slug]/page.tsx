// ABOUTME: Preview page for unpublished galleries
// ABOUTME: SEC-06 — getPreviewToken filters revoked/expired; force-dynamic + proxy no-cache

import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import GlobalFooter from '@/components/commons/GlobalFooter'
import GalleryGrid from '@/components/commons/GalleryGrid'
import RelatedGalleries from '@/components/luna/RelatedGalleries'
import {
  Container,
  BookSessionButton,
  PageHeader,
  PreviewBanner,
} from '@/components/commons'
import { getPreviewToken } from '@/lib/preview-tokens'

// SEC-06: preview MUST be evaluated per-request — revocation has to take effect
// in one request without a redeploy. proxy.ts also emits no-cache headers on
// /preview/* so CDNs don't serve stale copies.
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function PreviewGalleryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params
  const { token } = await searchParams

  if (!token) {
    redirect('/portfolio')
  }

  // SEC-06: getPreviewToken returns null for revoked OR expired tokens; UI
  // collapses both states into "Invalid Preview Link" so attackers can't
  // distinguish "wrong token" from "revoked token".
  const previewToken = await getPreviewToken(token)

  if (!previewToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-serif text-3xl text-gray-900 dark:text-white">
            Invalid Preview Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This preview link is not valid. Please request a new one.
          </p>
        </div>
      </div>
    )
  }

  // Fetch the gallery regardless of status
  const gallery = await prisma.gallery.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!gallery) {
    notFound()
  }

  // Verify the token is for this gallery
  if (
    previewToken.resourceType !== 'gallery' ||
    previewToken.resourceId !== gallery.id
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 font-serif text-3xl text-gray-900 dark:text-white">
            Invalid Preview Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This preview link is not valid for this gallery.
          </p>
        </div>
      </div>
    )
  }

  // Fetch other galleries for the "Explore More" section
  const displayGalleries = await prisma.gallery.findMany({
    where: {
      NOT: { slug },
    },
    include: {
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
      _count: { select: { images: true } },
    },
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    take: 3,
  })

  return (
    <div className="relative min-h-screen">
      <PreviewBanner expiresAt={previewToken.expiresAt.toISOString()} />

      <PageHeader
        title={gallery.title}
        breadcrumb={[{ label: 'Portfolio', href: '/portfolio' }]}
      />

      {/* Gallery Grid */}
      <section className="px-6 pb-16 pt-20">
        <Container>
          {gallery.images.length === 0 ? (
            <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-950">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p className="text-lg text-gray-500 dark:text-gray-400">
                No images in this gallery yet.
              </p>
            </div>
          ) : (
            <GalleryGrid images={gallery.images} title={gallery.title} />
          )}
        </Container>
      </section>

      {/* Explore More Galleries */}
      <RelatedGalleries galleries={displayGalleries} />

      {/* Book a Session CTA */}
      <section className="bg-gradient-to-b from-gray-50 to-white px-6 py-12 dark:from-gray-900 dark:to-gray-950">
        <Container>
          <div className="flex flex-col items-center text-center">
            <h2 className="mb-8 font-serif text-4xl text-gray-900 dark:text-white md:text-5xl">
              Like what you see?
            </h2>
            <BookSessionButton size="lg" />
          </div>
        </Container>
      </section>

      <GlobalFooter />
    </div>
  )
}
