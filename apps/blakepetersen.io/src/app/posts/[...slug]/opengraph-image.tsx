// ABOUTME: Open Graph image for individual blog post detail pages.
// ABOUTME: Renders terminal-styled image with post title and category label.

import { getPosts } from '../../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType,
} from '../../../lib/og-image'

export { size, contentType }
export const alt = 'Post'

export async function generateImageMetadata() {
  return getPosts().map((item) => ({
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
  const fullSlug = `posts/${slug.join('/')}`
  const item = getPosts().find((p) => p.slug === fullSlug)
  const title = item?.title ?? 'Posts'

  return renderOgImage({ title, category: 'posts' })
}
