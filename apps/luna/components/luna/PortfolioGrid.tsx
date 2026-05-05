// ABOUTME: Portfolio gallery grid component
// ABOUTME: Displays gallery cards with featured badges

import { ContentCard } from '@/components/commons'

type Gallery = {
  id: string
  slug: string
  title: string
  featured: boolean
  images: Array<{ url: string }>
  _count: { images: number }
}

type PortfolioGridProps = {
  galleries: Gallery[]
}

export default function PortfolioGrid({ galleries }: PortfolioGridProps) {
  return (
    <>
      {/* Gallery Grid */}
      {galleries.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No galleries found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {galleries.map((gallery, index) => {
            // Calculate column-based delay: items in same column have same delay
            const columnDelay = (index % 3) * 50 // 0ms, 50ms, 100ms repeating

            return (
              <ContentCard
                key={gallery.id}
                href={`/portfolio/${gallery.slug}`}
                image={
                  gallery.images[0]?.url
                    ? { src: gallery.images[0].url, alt: gallery.title }
                    : undefined
                }
                badge={
                  gallery.featured
                    ? { text: 'Featured', variant: 'primary' }
                    : undefined
                }
                title={gallery.title}
                count={
                  gallery._count.images > 0 ? gallery._count.images : undefined
                }
                emptyImageText="No images yet"
                shimmerDelay={columnDelay}
              />
            )
          })}
        </div>
      )}
    </>
  )
}
