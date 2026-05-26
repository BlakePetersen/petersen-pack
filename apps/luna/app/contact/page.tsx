// ABOUTME: Contact page
// ABOUTME: Modern contact page with form and information for booking sessions

import { Suspense } from 'react'
import GlobalFooter from '@/components/commons/GlobalFooter'
import ContactForm from '@/components/luna/ContactForm'
import { Section, Container, ArrowLink } from '@/components/commons'
import { SectionNavigator } from '@/components/luna/SectionNavigator'
import { LocalBusinessStructuredData } from '@/components/luna/StructuredData'

export const metadata = {
  title: 'Contact',
  description:
    'Get in touch to book your photography session in the East Bay, San Francisco, or Contra Costa County. Send a message to discuss your photography needs.',
  keywords: [
    'contact',
    'book photography session',
    'East Bay photographer',
    'photography inquiry',
    'get in touch',
  ],
  alternates: {
    canonical: 'https://ashleypetersen.com/contact',
  },
}

export default function ContactPage() {
  return (
    <>
      <LocalBusinessStructuredData />

      <SectionNavigator title="Contact" />

      <Section className="pt-20">
        <Container size="md">
          {/* FAQ Callout */}
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
            <h3 className="mb-3 font-serif text-2xl text-gray-900 dark:text-white">
              Have Questions First?
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Check out our FAQ page for answers to common questions about
              booking, pricing, process, and policies.
            </p>
            <ArrowLink href="/faq">Browse FAQs</ArrowLink>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-gutter dark:border-gray-800 dark:bg-gray-950">
            <Suspense
              fallback={
                <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800" />
              }
            >
              <ContactForm />
            </Suspense>
          </div>
        </Container>
      </Section>

      <GlobalFooter />
    </>
  )
}
