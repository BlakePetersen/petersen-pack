// ABOUTME: Individual gallery page
// ABOUTME: Displays all images in a specific gallery with lightbox

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import GlobalFooter from '@/components/commons/GlobalFooter'
import GalleryGrid from '@/components/commons/GalleryGrid'
import RelatedGalleries from '@/components/luna/RelatedGalleries'
import { Container, BookSessionButton, PageHeader } from '@/components/commons'
import {
  GalleryStructuredData,
  BreadcrumbStructuredData,
} from '@/components/luna/StructuredData'
import GalleryViewTracker from '@/components/luna/GalleryViewTracker'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Revalidate every 60 seconds for ISR
export const revalidate = 60

// Generate static params for all galleries at build time
export async function generateStaticParams() {
  const galleries = await prisma.gallery.findMany({
    select: { slug: true },
  })
  return galleries.map((gallery) => ({ slug: gallery.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const gallery = await prisma.gallery.findUnique({
    where: { slug },
    include: {
      images: {
        take: 1,
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!gallery) {
    return {
      title: 'Gallery Not Found',
    }
  }

  const description =
    gallery.description ||
    `View ${gallery.title} photography by Ashley Petersen`
  const coverImage = gallery.coverImage || gallery.images[0]?.url
  const galleryUrl = `https://ashleypetersen.com/portfolio/${slug}`

  return {
    title: `${gallery.title}`,
    description,
    keywords: [gallery.title, 'photography', 'East Bay photographer'],
    openGraph: {
      title: `${gallery.title} | Ashley Petersen Photography`,
      description,
      url: galleryUrl,
      type: 'website',
      images: coverImage
        ? [
            {
              url: coverImage,
              width: 1200,
              height: 800,
              alt: `${gallery.title} - Ashley Petersen Photography`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${gallery.title} | Ashley Petersen Photography`,
      description,
      images: coverImage ? [coverImage] : undefined,
    },
    alternates: {
      canonical: galleryUrl,
    },
  }
}

export default async function GalleryPage({ params }: PageProps) {
  const { slug } = await params
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

  const galleryUrl = `https://ashleypetersen.com/portfolio/${slug}`

  return (
    <div className="relative min-h-screen">
      <GalleryViewTracker galleryTitle={gallery.title} />
      <GalleryStructuredData
        title={gallery.title}
        description={gallery.description}
        images={gallery.images.map((img) => ({
          url: img.url,
          altText: img.altText,
        }))}
        url={galleryUrl}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: 'https://ashleypetersen.com' },
          { name: 'Portfolio', url: 'https://ashleypetersen.com/portfolio' },
          { name: gallery.title, url: galleryUrl },
        ]}
      />

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
