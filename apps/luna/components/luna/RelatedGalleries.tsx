// ABOUTME: Related galleries component for gallery detail pages
// ABOUTME: Displays other galleries as "Explore More" grid using HorizontalCardStrip

import {
  HorizontalCardStrip,
  type HorizontalCardItem,
} from '@/components/commons'

type RelatedGallery = {
  id: string
  slug: string
  title: string
  featured: boolean
  images: Array<{ url: string }>
  _count: { images: number }
}

type RelatedGalleriesProps = {
  galleries: RelatedGallery[]
}

export default function RelatedGalleries({ galleries }: RelatedGalleriesProps) {
  const items: HorizontalCardItem[] = galleries.map((gallery) => ({
    id: gallery.id,
    title: gallery.title,
    href: `/portfolio/${gallery.slug}`,
    image: gallery.images[0]?.url || null,
    badge: gallery.featured
      ? { text: 'Featured', variant: 'primary' as const }
      : undefined,
    count: gallery._count.images,
  }))

  return (
    <HorizontalCardStrip
      title="Explore More"
      items={items}
      viewAllHref="/portfolio"
      viewAllText="View All Galleries"
    />
  )
}
