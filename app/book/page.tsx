// ABOUTME: Public booking page where clients can view availability and book sessions
// ABOUTME: Displays calendar of available slots and booking form

import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60
import GlobalFooter from '@/components/commons/GlobalFooter'
import {
  Section,
  Container,
  SectionHeader,
  CtaSection,
  ProcessSteps,
} from '@/components/commons'
import { SectionNavigator } from '@/components/luna/SectionNavigator'
import BookingCalendar from '@/components/luna/BookingCalendar'
import { Metadata } from 'next'
import { LocalBusinessStructuredData } from '@/components/luna/StructuredData'

export const metadata: Metadata = {
  title: 'Book Your Session',
  description:
    'Book your photography session with Ashley Petersen. View available time slots and schedule your family portraits, lifestyle session, or creative photography in the East Bay.',
  keywords: [
    'book photography session',
    'photography booking',
    'schedule photo shoot',
    'East Bay photographer booking',
    'family photography session',
  ],
  alternates: {
    canonical: 'https://ashleypetersen.com/book',
  },
}

const bookingSteps = [
  {
    title: 'Choose Your Time',
    description:
      'Browse available dates and select a time slot that works best for your schedule',
  },
  {
    title: 'Share Your Details',
    description:
      "Tell me about your session type, duration, and what you're envisioning",
  },
  {
    title: 'Get Confirmed',
    description:
      "I'll review your request and reach out to confirm details and answer any questions",
  },
]

export default async function BookPage() {
  const availableSlots = await prisma.availabilitySlot.findMany({
    where: {
      date: {
        gte: new Date(),
      },
      isAvailable: true,
    },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  })

  return (
    <>
      <LocalBusinessStructuredData />

      <SectionNavigator title="Book" />

      <Section className="pt-20">
        <Container>
          <SectionHeader title="How It Works" />
          <ProcessSteps steps={bookingSteps} columns={3} />
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader title="Available Time Slots" align="left" />
          <BookingCalendar slots={availableSlots} />
        </Container>
      </Section>

      <CtaSection
        title="Don't See a Time That Works?"
        description="No problem! I'm happy to work with your schedule. Send me a message and we'll find a time that's perfect for you."
        buttonText="Contact Me"
        buttonHref="/contact"
      />

      <GlobalFooter />
    </>
  )
}
