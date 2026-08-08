# Page Primitives Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate repeated patterns across public pages into composable primitives following atomic design.

**Architecture:** Create Section/Container/SectionHeader molecules, PageHeader/CtaSection/ProcessSteps organisms. Migrate all public pages to use these primitives for consistent spacing and structure.

**Tech Stack:** React, TypeScript, Tailwind CSS, Next.js App Router

**Design Doc:** `docs/plans/2026-01-07-page-primitives-design.md`

---

## Task 1: Enhance Section Component

**Files:**

- Modify: `components/commons/Section.tsx`
- Test: Manual - verify in Storybook

**Step 1: Read existing Section component**

Review current implementation at `components/commons/Section.tsx`.

**Step 2: Update Section to include horizontal padding**

```tsx
// ABOUTME: Reusable section component for page layouts
// ABOUTME: Provides consistent spacing and background variants

import { ReactNode } from 'react'

type SectionVariant = 'default' | 'gray'

type SectionProps = {
  children: ReactNode
  variant?: SectionVariant
  className?: string
  id?: string
}

const variantStyles: Record<SectionVariant, string> = {
  default: 'bg-white dark:bg-gray-900',
  gray: 'bg-gray-50 dark:bg-gray-800',
}

export function Section({
  children,
  variant = 'default',
  className = '',
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${variantStyles[variant]} px-gutter py-section ${className}`}
    >
      {children}
    </section>
  )
}
```

**Step 3: Verify in Storybook**

Run: `pnpm storybook`
Check: Section.stories renders correctly with new padding.

**Step 4: Commit**

```bash
git add components/commons/Section.tsx
git commit -m "feat(Section): add horizontal padding for consistency"
```

---

## Task 2: Create Public SectionHeader Component

**Files:**

- Create: `components/commons/SectionHeader.tsx` (rewrite existing)
- Modify: `components/commons/index.ts`

**Step 1: Rewrite SectionHeader for public pages**

```tsx
// ABOUTME: Section header with centered title and optional subtitle
// ABOUTME: Used for content sections on public pages

type SectionHeaderProps = {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'
  const subtitleAlign = align === 'center' ? 'mx-auto' : ''

  return (
    <div className={`mb-12 md:mb-16 ${alignClass} ${className}`}>
      <h2 className="text-heading-xl mb-4 font-serif text-gray-900 dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-body-lg max-w-2xl text-gray-600 dark:text-gray-400 ${subtitleAlign}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
```

**Step 2: Update exports in index.ts**

Add to `components/commons/index.ts`:

```tsx
export { SectionHeader } from './SectionHeader'
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add components/commons/SectionHeader.tsx components/commons/index.ts
git commit -m "feat(SectionHeader): rewrite for public pages with centered default"
```

---

## Task 3: Create PageHeader Component

**Files:**

- Modify: `components/commons/PageHeader.tsx` (simplify existing)
- Modify: `components/commons/index.ts`

**Step 1: Simplify PageHeader for text-only heroes**

```tsx
// ABOUTME: Text-only page header for public pages
// ABOUTME: Centered title with optional subtitle, consistent page-top spacing

type PageHeaderProps = {
  title: string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="px-gutter pb-section pt-page-top">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-display-lg mb-4 font-serif text-gray-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-body-lg leading-relaxed text-gray-600 dark:text-gray-300">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
```

**Step 2: Update exports if needed**

Verify `PageHeader` is exported in `components/commons/index.ts`.

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add components/commons/PageHeader.tsx
git commit -m "feat(PageHeader): simplify to text-only page hero"
```

---

## Task 4: Create CtaSection Component

**Files:**

- Create: `components/commons/CtaSection.tsx`
- Modify: `components/commons/index.ts`

**Step 1: Create CtaSection component**

```tsx
// ABOUTME: Call-to-action section for public pages
// ABOUTME: Centered title, description, and primary button

import { ButtonLink } from './ButtonLink'

type CtaSectionProps = {
  title: string
  description?: string
  buttonText: string
  buttonHref: string
}

export function CtaSection({
  title,
  description,
  buttonText,
  buttonHref,
}: CtaSectionProps) {
  return (
    <section className="px-gutter py-section">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-heading-xl mb-6 font-serif text-gray-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="text-body-lg mb-10 text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}
        <ButtonLink href={buttonHref} variant="primary" size="lg">
          {buttonText}
        </ButtonLink>
      </div>
    </section>
  )
}
```

**Step 2: Export from index.ts**

Add to `components/commons/index.ts`:

```tsx
export { CtaSection } from './CtaSection'
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add components/commons/CtaSection.tsx components/commons/index.ts
git commit -m "feat(CtaSection): add unified CTA section component"
```

---

## Task 5: Create ProcessSteps Component

**Files:**

- Create: `components/commons/ProcessSteps.tsx`
- Modify: `components/commons/index.ts`

**Step 1: Create ProcessSteps component**

```tsx
// ABOUTME: Numbered process steps in responsive grid
// ABOUTME: Used for "How It Works" and "What to Expect" sections

type Step = {
  title: string
  description: string
}

type ProcessStepsProps = {
  steps: Step[]
  columns?: 2 | 3
}

export function ProcessSteps({ steps, columns }: ProcessStepsProps) {
  // Auto-determine columns: 3 or fewer steps = match count, more = 2 columns
  const colCount = columns ?? (steps.length <= 3 ? steps.length : 2)
  const gridClass =
    colCount === 3 ? 'md:grid-cols-3' : colCount === 2 ? 'md:grid-cols-2' : ''

  return (
    <div className={`grid gap-8 ${gridClass}`}>
      {steps.map((step, index) => (
        <div
          key={index}
          className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 font-serif text-2xl text-white transition-transform group-hover:scale-110 dark:bg-white dark:text-gray-900">
            {index + 1}
          </div>
          <h3 className="mb-3 font-serif text-xl text-gray-900 dark:text-white">
            {step.title}
          </h3>
          <p className="leading-relaxed text-gray-600 dark:text-gray-400">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Export from index.ts**

Add to `components/commons/index.ts`:

```tsx
export { ProcessSteps } from './ProcessSteps'
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add components/commons/ProcessSteps.tsx components/commons/index.ts
git commit -m "feat(ProcessSteps): add numbered step cards component"
```

---

## Task 6: Migrate Portfolio Page

**Files:**

- Modify: `app/portfolio/page.tsx`

**Step 1: Read current portfolio page**

Review `app/portfolio/page.tsx` for current structure.

**Step 2: Refactor to use primitives**

```tsx
// ABOUTME: Portfolio gallery index page
// ABOUTME: Displays all public galleries with filtering by shoot type

import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60
import GlobalFooter from '@/components/commons/GlobalFooter'
import {
  PageHeader,
  Section,
  Container,
  CtaSection,
} from '@/components/commons'
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
      <PageHeader title="Portfolio" />

      <Section>
        <Container>
          <PortfolioGrid galleries={galleries} />
        </Container>
      </Section>

      <CtaSection
        title="Like what you see?"
        buttonText="Book a Session"
        buttonHref="/book"
      />

      <GlobalFooter />
    </>
  )
}
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Visual verification**

Run: `pnpm dev`
Navigate to `/portfolio` and verify layout looks correct.

**Step 5: Commit**

```bash
git add app/portfolio/page.tsx
git commit -m "refactor(portfolio): migrate to page primitives"
```

---

## Task 7: Migrate Contact Page

**Files:**

- Modify: `app/contact/page.tsx`

**Step 1: Read current contact page**

Review `app/contact/page.tsx` for current structure.

**Step 2: Refactor to use primitives**

```tsx
// ABOUTME: Contact page
// ABOUTME: Modern contact page with form and information for booking sessions

import { Suspense } from 'react'
import GlobalFooter from '@/components/commons/GlobalFooter'
import ContactForm from '@/components/luna/ContactForm'
import { PageHeader, Section, Container, ArrowLink } from '@/components/commons'
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

      <PageHeader
        title="Let's Connect"
        subtitle="Ready to book your session or have questions? I'd love to hear from you!"
      />

      <Section>
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

          <div className="p-gutter rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
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
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add app/contact/page.tsx
git commit -m "refactor(contact): migrate to page primitives"
```

---

## Task 8: Migrate FAQ Page

**Files:**

- Modify: `app/faq/page.tsx`

**Step 1: Read current FAQ page**

Review `app/faq/page.tsx` for current structure.

**Step 2: Refactor to use primitives**

```tsx
// ABOUTME: Public FAQ page with category filtering
// ABOUTME: Displays general FAQs with accordion and tabs

import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60
import { FaqPageClient } from '@/components/luna/FaqPageClient'
import GlobalFooter from '@/components/commons/GlobalFooter'
import {
  PageHeader,
  Section,
  Container,
  CtaSection,
} from '@/components/commons'
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

      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about booking your photography session"
      />

      <Section>
        <Container size="md">
          <FaqPageClient faqs={faqs} />
        </Container>
      </Section>

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
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add app/faq/page.tsx
git commit -m "refactor(faq): migrate to page primitives, remove 60-line inline CTA"
```

---

## Task 9: Migrate Blog Page

**Files:**

- Modify: `app/blog/page.tsx`

**Step 1: Read current blog page**

Review `app/blog/page.tsx` for current structure.

**Step 2: Refactor to use primitives**

```tsx
// ABOUTME: Blog listing page showing all published posts
// ABOUTME: Displays blog posts with categories and filtering

import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60
import GlobalFooter from '@/components/commons/GlobalFooter'
import { PageHeader, CtaSection } from '@/components/commons'
import BlogGrid from '@/components/luna/BlogGrid'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Ashley Petersen Photography',
  description:
    'Photography stories, session highlights, and behind-the-scenes from Ashley Petersen Photography in the East Bay and San Francisco.',
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: { images: true },
      },
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })

  const categories = await prisma.blogCategory.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: {
                published: true,
              },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const tags = await prisma.blogTag.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: {
                published: true,
              },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Filter out categories and tags with no posts
  const categoriesWithPosts = categories.filter((cat) => cat._count.posts > 0)
  const tagsWithPosts = tags.filter((tag) => tag._count.posts > 0)

  return (
    <>
      <PageHeader title="Blog" />

      <BlogGrid
        posts={posts}
        categories={categoriesWithPosts}
        tags={tagsWithPosts}
      />

      <CtaSection
        title="Like what you see?"
        buttonText="Book a Session"
        buttonHref="/book"
      />

      <GlobalFooter />
    </>
  )
}
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add app/blog/page.tsx
git commit -m "refactor(blog): add PageHeader, migrate CTA to CtaSection"
```

---

## Task 10: Migrate Book Page

**Files:**

- Modify: `app/book/page.tsx`

**Step 1: Read current book page**

Review `app/book/page.tsx` for current structure.

**Step 2: Refactor to use primitives**

```tsx
// ABOUTME: Public booking page where clients can view availability and book sessions
// ABOUTME: Displays calendar of available slots and booking form

import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60
import GlobalFooter from '@/components/commons/GlobalFooter'
import {
  PageHeader,
  Section,
  Container,
  SectionHeader,
  CtaSection,
  ProcessSteps,
} from '@/components/commons'
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

      <PageHeader
        title="Let's Create Something Beautiful"
        subtitle="I'm excited to work with you! Select an available time slot below to begin your booking. Once you submit your request, I'll personally review it and confirm the details with you via email."
      />

      <Section>
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
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add app/book/page.tsx
git commit -m "refactor(book): migrate to page primitives with ProcessSteps"
```

---

## Task 11: Migrate Services Page

**Files:**

- Modify: `app/services/page.tsx`

**Step 1: Read current services page**

Review `app/services/page.tsx` for current structure.

**Step 2: Refactor to use primitives**

```tsx
// ABOUTME: Services overview page
// ABOUTME: Displays all photography services with process overview

import GlobalFooter from '@/components/commons/GlobalFooter'
import {
  Container,
  ArrowLink,
  PageHero,
  Section,
  SectionHeader,
  CtaSection,
  ProcessSteps,
} from '@/components/commons'
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
    include: {
      packages: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
        take: 1,
      },
    },
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
        startingPrice: category.packages[0]?.price || null,
      }
    })
  )

  return servicesWithImages
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <>
      <PageHero
        title="Photography Services"
        subtitle="From professional headshots to creative underwater sessions, I offer a range of photography services to capture your unique story and vision."
      />

      <Section>
        <Container>
          <div className="flex flex-wrap justify-center gap-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                slug={service.slug}
                description={service.description}
                sampleImages={service.sampleImages}
                startingPrice={service.startingPrice}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section id="what-to-expect">
        <Container size="md">
          <SectionHeader
            title="What to Expect"
            subtitle="My streamlined process ensures a smooth, enjoyable experience from our first conversation to your final images"
          />
          <ProcessSteps steps={processSteps} columns={2} />

          {/* FAQ Callout */}
          <div className="mt-16 rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
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
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add app/services/page.tsx
git commit -m "refactor(services): migrate to page primitives with ProcessSteps"
```

---

## Task 12: Delete Obsolete CtaSectionPrimary

**Files:**

- Delete: `components/luna/CtaSectionPrimary.tsx`
- Modify: Any files still importing it

**Step 1: Check for remaining usages**

Run: `grep -r "CtaSectionPrimary" --include="*.tsx" .`

**Step 2: If no usages found, delete the file**

```bash
rm components/luna/CtaSectionPrimary.tsx
```

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: No errors

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete CtaSectionPrimary component"
```

---

## Task 13: Final Verification

**Step 1: Run full type check**

Run: `pnpm type-check`
Expected: No errors

**Step 2: Run lint**

Run: `pnpm lint`
Expected: No new errors

**Step 3: Visual verification**

Run: `pnpm dev`
Check each migrated page:

- `/portfolio`
- `/contact`
- `/faq`
- `/blog`
- `/book`
- `/services`

Verify consistent spacing and layout.

**Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: final cleanup after page primitives migration"
```
