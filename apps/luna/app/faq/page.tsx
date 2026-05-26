// ABOUTME: Public FAQ page with category filtering
// ABOUTME: Displays general FAQs with accordion and tabs

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60
import { FaqPageClient } from '@/components/luna/FaqPageClient'
import GlobalFooter from '@/components/commons/GlobalFooter'
import { CtaSection } from '@/components/commons'
import { SectionNavigator } from '@/components/luna/SectionNavigator'
import { Metadata } from 'next'
import { FAQStructuredData } from '@/components/luna/StructuredData'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Luna Photography',
  description:
    'Find answers to common questions about our photography services, booking process, pricing, and policies.',
  openGraph: {
    title: 'Frequently Asked Questions | Luna Photography',
    description:
      'Find answers to common questions about our photography services, booking process, pricing, and policies.',
  },
}

export default async function FaqPage() {
  const faqsRaw = await prisma.faq.findMany({
    where: {
      serviceId: null,
      isActive: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      viewCount: true,
    },
  })

  const faqs = faqsRaw.map((faq) => ({
    ...faq,
    answer: JSON.stringify(faq.answer),
  }))

  // Prepare FAQ data for structured data (plain text answers)
  const faqSchemaData = faqsRaw.map((faq) => ({
    question: faq.question,
    answer:
      typeof faq.answer === 'string' ? faq.answer : JSON.stringify(faq.answer),
  }))

  return (
    <>
      <FAQStructuredData faqs={faqSchemaData} />

      <SectionNavigator title="FAQ" />

      <section className="px-gutter pt-20">
        <Suspense fallback={null}>
          <FaqPageClient faqs={faqs} />
        </Suspense>
      </section>

      <CtaSection
        title="Still Have Questions?"
        description="I'd love to hear from you! Get in touch and let's discuss your photography needs."
        buttonText="Get in Touch"
        buttonHref="/contact"
      />

      <GlobalFooter />
    </>
  )
}
