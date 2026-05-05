// ABOUTME: Individual service page with pricing
// ABOUTME: Shows packages, pricing, and process for a specific service

import GlobalFooter from '@/components/commons/GlobalFooter'
import {
  Container,
  ArrowLink,
  PricingCard,
  AdminToolbarWithSession,
  HorizontalCardStrip,
  type HorizontalCardItem,
} from '@/components/commons'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60

// Generate static params for all services at build time
export async function generateStaticParams() {
  const categories = await prisma.pricingCategory.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return categories.map((category) => ({ slug: category.slug }))
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import HeroCarouselWithSession from '@/components/luna/HeroCarouselWithSession'
import { CtaSectionWithSession } from '@/components/commons/CtaSectionWithSession'
import { FaqAccordion } from '@/components/luna/FaqAccordion'
import { ServiceStructuredData } from '@/components/luna/StructuredData'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.pricingCategory.findUnique({
    where: { slug },
    include: {
      serviceImages: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
      },
    },
  })

  if (!category) {
    return {
      title: 'Service Not Found | Ashley Petersen Photography',
    }
  }

  const baseUrl = 'https://ashleypetersen.com'
  const pageUrl = `${baseUrl}/services/${category.slug}`
  const ogImage = category.serviceImages[0]?.url || `${baseUrl}/og-image.jpg`

  return {
    title: `${category.name} | Ashley Petersen Photography`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Ashley Petersen Photography`,
      description: category.description,
      url: pageUrl,
      siteName: 'Ashley Petersen Photography',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} | Ashley Petersen Photography`,
      description: category.description,
      images: [ogImage],
      creator: '@ashleypetersenphoto',
    },
  }
}

async function getServiceData(slug: string) {
  const [category, otherServices, portfolioGalleries] = await Promise.all([
    prisma.pricingCategory.findUnique({
      where: { slug, isActive: true },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        serviceImages: {
          orderBy: { sortOrder: 'asc' },
          take: 5,
        },
        service: true,
      },
    }),
    prisma.pricingCategory.findMany({
      where: { isActive: true, slug: { not: slug } },
      orderBy: { sortOrder: 'asc' },
      take: 3,
    }),
    prisma.gallery.findMany({
      where: { featured: true },
      orderBy: { sortOrder: 'asc' },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
      },
    }),
  ])

  if (!category) {
    notFound()
  }

  return { category, otherServices, portfolioGalleries }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const { category, otherServices, portfolioGalleries } =
    await getServiceData(slug)

  // Transform galleries for the HorizontalCardStrip
  const portfolioItems: HorizontalCardItem[] = portfolioGalleries.map(
    (gallery) => ({
      id: gallery.id,
      title: gallery.title,
      href: `/portfolio/${gallery.slug}`,
      image: gallery.coverImage,
    })
  )

  // Get service FAQs if available
  const serviceFaqs = category.service
    ? await prisma.faq.findMany({
        where: {
          serviceId: category.service.id,
          isActive: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          question: true,
          answer: true,
        },
      })
    : []

  const faqs = serviceFaqs.map((faq) => ({
    ...faq,
    answer: JSON.stringify(faq.answer),
  }))

  // Build hero slides from service images
  const heroSlides = category.serviceImages.map((image, index) => ({
    id: image.id,
    title: category.name,
    imageUrl: image.url,
    mobileImageUrl: null,
    focalX: image.focalX ?? 0.5,
    focalY: image.focalY ?? 0.5,
    mobileFocalX: image.focalX ?? 0.5,
    mobileFocalY: image.focalY ?? 0.5,
    linkUrl: null,
    linkText: null,
    portfolioUrl: null,
    serviceUrl: null,
    sortOrder: index,
    isActive: true,
  }))

  // Calculate price range for structured data
  const prices = category.packages.map((pkg) => pkg.price)
  const minPrice = prices.length > 0 ? Math.min(...prices) : undefined
  const maxPrice = prices.length > 0 ? Math.max(...prices) : undefined

  return (
    <>
      <ServiceStructuredData
        name={category.name}
        description={category.description}
        url={`https://ashleypetersen.com/services/${category.slug}`}
        minPrice={minPrice}
        maxPrice={maxPrice}
        serviceType="Photography Service"
      />

      {/* Floating Admin Toolbar */}
      <AdminToolbarWithSession
        actions={[
          {
            label: 'Edit Service',
            href: `/admin/pricing/categories/${category.id}/edit`,
            icon: 'edit',
          },
        ]}
      />

      <main className="relative min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-transparent px-gutter pb-4 pt-page-top">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-3 font-serif text-display-lg text-gray-900 dark:text-white">
              {category.name}
            </h1>
            <p className="text-body-lg text-gray-600 dark:text-gray-300">
              {category.description}
            </p>
          </div>
        </section>

        {/* Hero Carousel */}
        {heroSlides.length > 0 && (
          <HeroCarouselWithSession slides={heroSlides} />
        )}

        {/* Packages */}
        <section className="px-gutter py-section">
          <Container>
            <div className="mx-auto max-w-7xl">
              <div className="mb-12 text-center">
                <h2 className="font-serif text-heading-xl text-gray-900 dark:text-white">
                  Packages & Pricing
                </h2>
              </div>

              <div
                className={`grid gap-8 ${
                  category.packages.length >= 3
                    ? 'md:grid-cols-2 lg:grid-cols-3'
                    : category.packages.length === 2
                      ? 'mx-auto max-w-5xl md:grid-cols-2'
                      : 'mx-auto max-w-md'
                }`}
              >
                {category.packages.map((pkg, index) => (
                  <PricingCard
                    key={pkg.id}
                    name={pkg.name}
                    price={pkg.price}
                    duration={pkg.duration}
                    features={pkg.features}
                    isPopular={pkg.isPopular}
                    bookingUrl={`/book?service=${encodeURIComponent(category.name)}&package=${encodeURIComponent(pkg.name)}`}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Mini Portfolio */}
        {portfolioItems.length > 0 && (
          <HorizontalCardStrip
            title="See My Work"
            items={portfolioItems}
            viewAllHref="/portfolio"
            viewAllText="View Full Portfolio"
          />
        )}

        {/* Other Services */}
        {otherServices.length > 0 && (
          <section className="px-gutter py-section">
            <Container>
              <div className="mx-auto max-w-7xl">
                <div className="mb-12 text-center">
                  <h2 className="mb-4 font-serif text-heading-xl text-gray-900 dark:text-white">
                    Explore Other Services
                  </h2>
                  <p className="text-body-lg text-gray-600 dark:text-gray-400">
                    Discover more ways I can help tell your story
                  </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                  {otherServices.map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="group relative overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 p-8 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-gray-300/70 hover:shadow-lg dark:border-gray-700/50 dark:bg-gray-800/80 dark:hover:border-gray-600/70"
                    >
                      {/* Glint sweep */}
                      <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />

                      <h3 className="mb-3 font-serif text-xl text-gray-900 transition-colors dark:text-white">
                        {service.name}
                      </h3>
                      <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                        View Packages
                        <svg
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <ArrowLink href="/services">View All Services</ArrowLink>
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* FAQs Section */}
        <section className="px-gutter py-section">
          <Container>
            <div className="mx-auto max-w-4xl">
              {faqs.length > 0 ? (
                <>
                  <div className="mb-12 text-center">
                    <h2 className="mb-4 font-serif text-heading-xl text-gray-900 dark:text-white">
                      {category.name} FAQs
                    </h2>
                    <p className="text-body-lg text-gray-600 dark:text-gray-400">
                      Common questions about this service
                    </p>
                  </div>
                  <FaqAccordion faqs={faqs} />
                </>
              ) : null}

              {/* More Questions Prompt */}
              {faqs.length > 0 && (
                <div className="mt-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Have more questions?{' '}
                    <ArrowLink href="/faq" className="inline">
                      Browse all FAQs
                    </ArrowLink>
                  </p>
                </div>
              )}
            </div>
          </Container>
        </section>

        <CtaSectionWithSession
          content={{
            heading: 'Ready to Book Your Session?',
            subtitle:
              "Let's create something beautiful together. Get in touch to discuss your vision and reserve your date.",
            buttonText: 'Book Your Session',
            buttonUrl: `/contact?service=${encodeURIComponent(category.name)}`,
          }}
        />
      </main>
      <GlobalFooter />
    </>
  )
}
