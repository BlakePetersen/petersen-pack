// ABOUTME: Open Graph image for individual skill detail pages.
// ABOUTME: Renders terminal-styled image with item title and category label.

import { getSkills } from '../../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType,
} from '../../../lib/og-image'

export { size, contentType }
export const alt = 'Skill'

export async function generateImageMetadata() {
  return getSkills().map((item) => ({
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
  const fullSlug = `skills/${slug.join('/')}`
  const item = getSkills().find((s) => s.slug === fullSlug)
  const title = item?.title ?? 'Skills'

  return renderOgImage({ title, category: 'skills' })
}
