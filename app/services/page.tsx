// ABOUTME: Services overview page
// ABOUTME: Displays all photography services with process overview

import GlobalFooter from '@/components/commons/GlobalFooter'
import {
  Container,
  ArrowLink,
  Section,
  SectionHeader,
  CtaSection,
  ProcessSteps,
} from '@/components/commons'
import { SectionNavigator } from '@/components/luna/SectionNavigator'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60
import { ServiceCard } from '@/components/commons'

export const metadata: Metadata = {
  title: 'Photography Services | Ashley Petersen Photography',
  description:
    'Professional photography services including headshots, branding, lifestyle portraits, pet photography, and creative sessions in the East Bay and San Francisco area.',
}

// Map service categories to their related gallery slugs
const serviceGalleryMap: Record<string, string[]> = {
  headshots: ['headshots'],
  'branding-commercial': ['branding'],
  'lifestyle-family': ['lifestyle-portraiture'],
  'animals-pets': ['animals', 'rescue-tales'],
  'creative-specialty': ['underwater', 'boudoir', 'fantasy', 'yoga-dance'],
}

const processSteps = [
  {
    title: 'Consultation & Booking',
    description:
      "We'll start with a conversation about your vision and goals. Once we've found the perfect package, a 50% deposit secures your session date.",
  },
  {
    title: 'Pre-Session Planning',
    description:
      "We'll discuss location, wardrobe, and timing. I'll provide guidance to ensure you feel prepared and confident.",
  },
  {
    title: 'The Photo Session',
    description:
      "Relaxed and fun! I'll guide you through poses to capture authentic moments while you feel comfortable and confident.",
  },
  {
    title: 'Professional Editing',
    description:
      "I'll carefully edit your images to enhance colors and lighting while maintaining a natural look. Turnaround is typically 2-3 weeks.",
  },
  {
    title: 'Gallery Review & Selection',
    description:
      'Access your private online gallery to view all edited images. Select your favorites for final retouching and download.',
  },
  {
    title: 'Final Delivery',
    description:
      'Receive high-resolution digital downloads with full usage rights. Your images are ready to print, share, and treasure forever.',
  },
]

async function getServices() {
  const categories = await prisma.pricingCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  // Fetch sample images for each category from related galleries
  const servicesWithImages = await Promise.all(
    categories.map(async (category) => {
      const gallerySlugs = serviceGalleryMap[category.slug] || []

      const images = await prisma.image.findMany({
        where: {
          gallery: {
            slug: { in: gallerySlugs },
          },
        },
        orderBy: { sortOrder: 'asc' },
        take: 3,
        include: {
          gallery: true,
        },
      })

      return {
        ...category,
        sampleImages: images,
      }
    })
  )

  return servicesWithImages
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <>
      <SectionNavigator title="Services" />

      <Section data-section="Services" className="pt-20">
        <Container>
          <div className="flex flex-wrap justify-center gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                slug={service.slug}
                description={service.description}
                sampleImages={service.sampleImages}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section data-section="Process" id="what-to-expect">
        <Container size="md">
          <SectionHeader
            title="What to Expect"
            subtitle="My streamlined process ensures a smooth, enjoyable experience from our first conversation to your final images"
          />
          <ProcessSteps steps={processSteps} columns={2} />

          {/* FAQ Prompt */}
          <div className="mt-16 text-center">
            <h3 className="mb-3 font-serif text-2xl text-gray-900 dark:text-white">
              Still Have Questions?
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Check out our FAQ page for answers to common questions about
              booking, pricing, and what to expect.
            </p>
            <ArrowLink href="/faq">Browse FAQs</ArrowLink>
          </div>
        </Container>
      </Section>

      <CtaSection
        title="Ready to Get Started?"
        description="Let's create something beautiful together. Choose a service to view packages and pricing, or get in touch to discuss your unique needs."
        buttonText="Book a Session"
        buttonHref="/book"
      />

      <GlobalFooter />
    </>
  )
}
