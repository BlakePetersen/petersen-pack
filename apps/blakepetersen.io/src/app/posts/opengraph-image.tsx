// ABOUTME: Open Graph image for the posts listing page.
// ABOUTME: Renders terminal-styled image with category name and item count.

import { getPosts } from '../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType
} from '../../lib/og-image'

export { size, contentType }
export const alt = 'Posts'

export default async function Image() {
  return renderOgImage({
    title: 'Posts',
    category: 'posts',
    itemCount: getPosts().length
  })
}
