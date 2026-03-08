// ABOUTME: Open Graph image for individual hook detail pages.
// ABOUTME: Renders terminal-styled image with item title and category label.

import { getHooks } from '../../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType,
} from '../../../lib/og-image'

export { size, contentType }
export const alt = 'Hook'

export async function generateImageMetadata() {
  return getHooks().map((item) => ({
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
  const fullSlug = `hooks/${slug.join('/')}`
  const item = getHooks().find((h) => h.slug === fullSlug)
  const title = item?.title ?? 'Hooks'

  return renderOgImage({ title, category: 'hooks' })
}
