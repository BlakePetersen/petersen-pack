// ABOUTME: Open Graph image for individual config detail pages.
// ABOUTME: Renders terminal-styled image with item title and category label.

import { getConfigs } from '../../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType,
} from '../../../lib/og-image'

export { size, contentType }
export const alt = 'Config'

export async function generateImageMetadata() {
  return getConfigs().map((item) => ({
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
  const fullSlug = `configs/${slug.join('/')}`
  const item = getConfigs().find((c) => c.slug === fullSlug)
  const title = item?.title ?? 'Configs'

  return renderOgImage({ title, category: 'configs' })
}
