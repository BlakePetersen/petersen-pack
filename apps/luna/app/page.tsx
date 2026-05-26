// ABOUTME: Homepage for Ashley Petersen Photography
// ABOUTME: Hero section, featured galleries, about preview, and CTA

import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60

// Preload component to hint the browser about hero image
function HeroImagePreload({
  imageUrl,
  mobileImageUrl,
}: {
  imageUrl: string
  mobileImageUrl?: string | null
}) {
  if (!imageUrl) return null
  return (
    <>
      {/* Preload desktop image for larger screens */}
      <link
        rel="preload"
        as="image"
        href={imageUrl}
        fetchPriority="high"
        crossOrigin="anonymous"
        media="(min-width: 768px)"
      />
      {/* Preload mobile image for smaller screens if available */}
      {mobileImageUrl && (
        <link
          rel="preload"
          as="image"
          href={mobileImageUrl}
          fetchPriority="high"
          crossOrigin="anonymous"
          media="(max-width: 767px)"
        />
      )}
    </>
  )
}
import GlobalFooter from '@/components/commons/GlobalFooter'
import { SectionNavigator } from '@/components/luna/SectionNavigator'
import HeroCarouselWithSession from '@/components/luna/HeroCarouselWithSession'
import { AboutSectionWithSession } from '@/components/luna/AboutSectionWithSession'
import { ServicesSectionWithSession } from '@/components/luna/ServicesSectionWithSession'
import { CtaSectionWithSession } from '@/components/commons/CtaSectionWithSession'
import { TestimonialsSection } from '@/components/luna/TestimonialsSection'
import { ButtonLink, ContentCard, ArrowLink } from '@/components/commons'
import { cleanBlogTitle } from '@/lib/utils'
import { OrganizationStructuredData } from '@/components/luna/StructuredData'
import Link from 'next/link'
import Image from 'next/image'
import { shimmerDataUrl } from '@/lib/shimmer'

export default async function Home() {
  // Map gallery slugs to service slugs for CTAs
  const galleryToServiceMap: Record<string, string> = {
    headshots: 'headshots',
    branding: 'branding-commercial',
    'lifestyle-portraiture': 'lifestyle-family',
    animals: 'animals-pets',
    'rescue-tales': 'animals-pets',
    underwater: 'creative-specialty',
    boudoir: 'creative-specialty',
    fantasy: 'creative-specialty',
    'yoga-dance': 'creative-specialty',
  }

  // Service to gallery mapping for fetching sample images
  const serviceGalleryMap: Record<string, string[]> = {
    headshots: ['headshots'],
    'branding-commercial': ['branding'],
    'lifestyle-family': ['lifestyle-portraiture'],
    'animals-pets': ['animals', 'rescue-tales'],
    'creative-specialty': ['underwater', 'boudoir', 'fantasy', 'yoga-dance'],
  }

  // All gallery slugs needed for service images
  const allServiceGallerySlugs = Object.values(serviceGalleryMap).flat()

  // Fetch all data in parallel - single round trip to database
  const [
    heroSlidesRaw,
    featuredGalleries,
    testimonials,
    aboutContent,
    servicesContent,
    ctaContent,
    categories,
    serviceImages,
    latestBlogPosts,
  ] = await Promise.all([
    // Hero slides with relations
    prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        gallery: {
          include: {
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        image: true,
      },
    }),
    // Featured galleries
    prisma.gallery.findMany({
      where: { featured: true },
      include: {
        images: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { images: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    }),
    // Testimonials
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        clientName: true,
        clientPhoto: true,
        projectType: true,
        serviceType: true,
        location: true,
        quote: true,
        rating: true,
        videoUrl: true,
        caseStudyUrl: true,
      },
    }),
    // About content
    prisma.homepageContent.findUnique({
      where: { section: 'about' },
      include: { image: true },
    }),
    // Services content
    prisma.homepageContent.findUnique({
      where: { section: 'services' },
    }),
    // CTA content
    prisma.homepageContent.findUnique({
      where: { section: 'cta' },
    }),
    // Pricing categories
    prisma.pricingCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    // All service sample images in one query (fixes N+1)
    prisma.image.findMany({
      where: {
        gallery: {
          slug: { in: allServiceGallerySlugs },
        },
      },
      include: {
        gallery: {
          select: { slug: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    // Latest blog posts
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        categories: {
          include: { category: true },
          take: 1,
        },
        _count: {
          select: { images: true },
        },
      },
    }),
  ])

  // Build hero slides with resolved image URLs and links
  const heroSlides = heroSlidesRaw.map((slide) => {
    let imageUrl = slide.imageUrl || ''
    let linkUrl = slide.linkUrl
    let linkText = slide.linkText
    let portfolioUrl: string | null = null
    let serviceUrl: string | null = null

    // Priority: imageId > galleryId > imageUrl
    if (slide.image) {
      imageUrl = slide.image.url
    } else if (slide.gallery) {
      // Use gallery's first image or coverImage
      imageUrl = slide.gallery.images[0]?.url || slide.gallery.coverImage || ''
      // Auto-populate portfolio link
      portfolioUrl = `/portfolio/${slide.gallery.slug}`
      // Find associated service
      const serviceSlug = galleryToServiceMap[slide.gallery.slug]
      if (serviceSlug) {
        serviceUrl = `/services/${serviceSlug}`
      }
      // Auto-populate link if not custom
      if (!linkUrl) {
        linkUrl = portfolioUrl
        linkText = linkText || slide.gallery.title
      }
    }

    return {
      id: slide.id,
      title: slide.title,
      imageUrl,
      mobileImageUrl: slide.mobileImageUrl,
      focalX: slide.focalX,
      focalY: slide.focalY,
      mobileFocalX: slide.mobileFocalX,
      mobileFocalY: slide.mobileFocalY,
      linkUrl,
      linkText,
      portfolioUrl,
      serviceUrl,
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    }
  })

  // Build services with images from the pre-fetched data (no N+1)
  const servicesWithImages = categories.map((category) => {
    const gallerySlugs = serviceGalleryMap[category.slug] || []
    const images = serviceImages
      .filter((img) => gallerySlugs.includes(img.gallery?.slug || ''))
      .slice(0, 3)

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      sampleImages: images,
    }
  })

  // Get first hero image URL for preloading
  const firstHeroSlide = heroSlides[0]

  return (
    <div className="relative -mt-20 min-h-screen">
      <HeroImagePreload
        imageUrl={firstHeroSlide?.imageUrl || ''}
        mobileImageUrl={firstHeroSlide?.mobileImageUrl}
      />
      <OrganizationStructuredData />

      {/* Hero Section */}
      <HeroCarouselWithSession slides={heroSlides} />

      {/* Floating Side Rail Section Navigator */}
      <SectionNavigator title="Home" />

      {/* Services Section */}
      {servicesContent && (
        <ServicesSectionWithSession
          content={servicesContent.content as any}
          services={servicesWithImages}
        />
      )}

      {/* Featured Work */}
      {featuredGalleries.length > 0 && (
        <section data-section="Work" className="px-gutter py-section">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center md:mb-16">
              <h2 className="mb-4 font-serif text-display-md text-gray-900 dark:text-white md:text-display-lg">
                Featured Work
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
              {featuredGalleries.map((gallery, index) => {
                const coverImage = gallery.images[0]
                return (
                  <Link
                    key={gallery.id}
                    href={`/portfolio/${gallery.slug}`}
                    className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-lg bg-gray-200 shadow-soft transition-shadow duration-500 hover:shadow-glow dark:bg-gray-800"
                  >
                    {coverImage && (
                      <Image
                        src={coverImage.url}
                        alt={gallery.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[3000ms] ease-out group-hover:scale-125"
                        style={{
                          objectPosition: `${(coverImage.focalX ?? 0.5) * 100}% ${(coverImage.focalY ?? 0.5) * 100}%`,
                        }}
                        priority={index < 3}
                        placeholder="blur"
                        blurDataURL={shimmerDataUrl(700, 800)}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 transition-opacity duration-500 group-hover:opacity-0" />
                    <div className="absolute inset-0 flex items-end p-gutter">
                      <div className="translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        <p
                          className="font-serif text-heading-sm text-white"
                          style={{
                            filter:
                              'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))',
                          }}
                        >
                          {gallery.title}
                        </p>
                        {gallery._count.images > 0 && (
                          <p
                            className="text-sm uppercase tracking-wider text-white/80"
                            style={{
                              filter:
                                'drop-shadow(0px 1px 0px rgba(0, 0, 0, .25))',
                            }}
                          >
                            {gallery._count.images}{' '}
                            {gallery._count.images === 1 ? 'Image' : 'Images'}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <ButtonLink
                href="/portfolio"
                variant="outline"
                size="lg"
                className="bg-transparent uppercase tracking-wider"
              >
                View Full Portfolio
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* Latest Blog Section */}
      {latestBlogPosts.length > 0 && (
        <section data-section="Blog" className="px-gutter py-section">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center md:mb-16">
              <h2 className="mb-4 font-serif text-display-md text-gray-900 dark:text-white md:text-display-lg">
                Latest from the Blog
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestBlogPosts.map((post, index) => {
                const categoryName =
                  post.categories.length > 0
                    ? post.categories[0].category.name
                    : null

                return (
                  <ContentCard
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    image={
                      post.coverImage
                        ? { src: post.coverImage, alt: post.title }
                        : undefined
                    }
                    title={cleanBlogTitle(post.title)}
                    description={post.excerpt || undefined}
                    emptyImageText="No cover image"
                    shimmerDelay={index * 50}
                    stackedLayout={true}
                    metadata={
                      <div className="flex flex-wrap items-center gap-3">
                        <time dateTime={post.publishedAt?.toISOString()}>
                          {post.publishedAt?.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                        {categoryName && (
                          <>
                            <span>•</span>
                            <span>{categoryName}</span>
                          </>
                        )}
                      </div>
                    }
                  />
                )
              })}
            </div>

            <div className="mt-12 text-center">
              <ArrowLink href="/blog">View All Posts</ArrowLink>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {aboutContent && (
        <AboutSectionWithSession
          content={aboutContent.content as any}
          image={aboutContent.image}
        />
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {/* Call to Action */}
      {ctaContent && (
        <CtaSectionWithSession content={ctaContent.content as any} />
      )}

      <GlobalFooter />
    </div>
  )
}
