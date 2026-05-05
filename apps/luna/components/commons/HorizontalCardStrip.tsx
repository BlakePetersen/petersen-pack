// ABOUTME: Horizontal scrolling card strip for showcasing related content
// ABOUTME: Used for "More Stories" on blog pages, mini portfolios on service pages, and "Explore More" sections

// fallow-ignore-file circular-dependencies

import { Container, ArrowLink, ContentCard } from '.'

export type HorizontalCardItem = {
  id: string
  title: string
  href: string
  image: string | null
  category?: string
  badge?: {
    text: string
    variant?: 'solid' | 'primary' | 'outline' | 'accent'
  }
  count?: number
}

type HorizontalCardStripProps = {
  title: string
  items: HorizontalCardItem[]
  viewAllHref?: string
  viewAllText?: string
}

export function HorizontalCardStrip({
  title,
  items,
  viewAllHref,
  viewAllText = 'View All',
}: HorizontalCardStripProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-100 px-gutter py-section dark:bg-gray-800">
      <Container>
        <div className="mb-10 text-center">
          <h2 className="font-serif text-4xl text-gray-900 dark:text-white md:text-5xl">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((item, index) => (
            <ContentCard
              key={item.id}
              href={item.href}
              image={
                item.image ? { src: item.image, alt: item.title } : undefined
              }
              title={item.title}
              badge={item.badge}
              count={item.count}
              metadata={item.category}
              emptyImageText="No image"
              shimmerDelay={(index % 3) * 50}
            />
          ))}
        </div>

        {viewAllHref && (
          <div className="mt-12 text-center">
            <ArrowLink href={viewAllHref}>{viewAllText}</ArrowLink>
          </div>
        )}
      </Container>
    </section>
  )
}
