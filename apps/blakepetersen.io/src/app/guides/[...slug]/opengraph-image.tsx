// ABOUTME: Open Graph image for individual guide detail pages.
// ABOUTME: Renders terminal-styled image with item title and category label.

import { getGuides } from '../../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType,
} from '../../../lib/og-image'

export { size, contentType }
export const alt = 'Guide'

export async function generateImageMetadata() {
  return getGuides().map((item) => ({
    id: item.slug,
    alt: item.title,
    size: { width: 1200, height: 630 },
    contentType: 'image/png' as const,
  }))
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `guides/${slug.join('/')}`
  const item = getGuides().find((g) => g.slug === fullSlug)
  const title = item?.title ?? 'Guides'

  return renderOgImage({ title, category: 'guides' })
}
