// ABOUTME: Portfolio gallery index page
// ABOUTME: Displays all public galleries with filtering by shoot type

import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60
import GlobalFooter from '@/components/commons/GlobalFooter'
import { SectionNavigator } from '@/components/luna/SectionNavigator'
import { Section, Container, CtaSection } from '@/components/commons'
import PortfolioGrid from '@/components/luna/PortfolioGrid'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    "Browse Ashley Petersen's photography portfolio featuring family portraits, lifestyle sessions, underwater photography, boudoir, and commercial work in the East Bay and San Francisco.",
  keywords: [
    'photography portfolio',
    'East Bay photographer',
    'San Francisco photographer',
    'family portraits',
    'lifestyle photography',
    'underwater photography',
    'boudoir photography',
    'commercial photography',
  ],
  openGraph: {
    title: 'Portfolio | Ashley Petersen Photography',
    description:
      'Browse my photography portfolio featuring family portraits, lifestyle sessions, and creative photography work',
    url: 'https://ashleypetersen.com/portfolio',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ashley Petersen Photography Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio | Ashley Petersen Photography',
    description:
      'Browse my photography portfolio featuring family portraits, lifestyle sessions, and creative photography work',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://ashleypetersen.com/portfolio',
  },
}

export default async function PortfolioPage() {
  const galleries = await prisma.gallery.findMany({
    where: { status: 'PUBLISHED' },
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
  })

  return (
    <>
      <SectionNavigator title="Portfolio" />

      <Section className="pt-20">
        <Container>
          <PortfolioGrid galleries={galleries} />
        </Container>
      </Section>

      <CtaSection
        title="Like what you see?"
        description="Let's create beautiful images together. Book a session and bring your vision to life."
        buttonText="Book a Session"
        buttonHref="/book"
      />

      <GlobalFooter />
    </>
  )
}
