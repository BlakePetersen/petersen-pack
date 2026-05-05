// ABOUTME: Client component for public FAQ page with category filtering
// ABOUTME: Manages category tabs, accordion state, URL params for deep linking

'use client'

import { useCallback, useRef } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { FaqCategoryTabs, FAQ_CATEGORIES } from './FaqCategoryTabs'
import { FaqAccordion, FaqAccordionRef } from './FaqAccordion'
import { Section, Container, useFilterValue } from '@/components/commons'

interface Faq {
  id: string
  question: string
  answer: string
  category: string
  viewCount: number
}

interface FaqPageClientProps {
  faqs: Faq[]
}

// Generate a URL-friendly slug from a question
function questionToSlug(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export function FaqPageClient({ faqs }: FaqPageClientProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const accordionRef = useRef<FaqAccordionRef>(null)

  // Get active category from URL using shared hook
  const activeCategory = useFilterValue(FAQ_CATEGORIES, 'category', 'ALL')

  // Find FAQ by ID or slug
  const findFaqByParam = useCallback(
    (param: string | null) => {
      if (!param) return null
      // Try exact ID match first
      const byId = faqs.find((faq) => faq.id === param)
      if (byId) return byId
      // Try slug match
      const bySlug = faqs.find(
        (faq) => questionToSlug(faq.question) === param.toLowerCase()
      )
      return bySlug || null
    },
    [faqs]
  )

  // Find target FAQ from URL
  const faqParam = searchParams.get('faq')
  const targetFaq = findFaqByParam(faqParam)
  const targetFaqId = targetFaq?.id || null

  // Close all accordions when category changes
  const handleCategoryChange = () => {
    accordionRef.current?.closeAll()
  }

  // Generate shareable link for a specific FAQ
  const getFaqLink = (faq: Faq) => {
    const slug = questionToSlug(faq.question)
    const params = new URLSearchParams()
    if (faq.category !== 'GENERAL') {
      params.set('category', faq.category.toLowerCase())
    }
    params.set('faq', slug)
    return `${pathname}?${params}`
  }

  const filteredFaqs =
    activeCategory === 'ALL'
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory)

  return (
    <>
      <FaqCategoryTabs onCategoryChange={handleCategoryChange} />
      <Section>
        <Container size="md">
          <div className="relative z-10">
            <FaqAccordion
              ref={accordionRef}
              faqs={filteredFaqs.map((faq) => ({
                id: faq.id,
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
              }))}
              initialOpenId={targetFaqId}
              getFaqLink={
                getFaqLink as (faq: {
                  id: string
                  question: string
                  answer: string | object
                  category?: string
                }) => string
              }
              emptyMessage="No FAQs in this category yet."
            />
          </div>
        </Container>
      </Section>
    </>
  )
}
