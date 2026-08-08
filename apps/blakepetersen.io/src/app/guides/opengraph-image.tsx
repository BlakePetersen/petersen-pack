// ABOUTME: Open Graph image for the guides listing page.
// ABOUTME: Renders terminal-styled image with category name and item count.

import { getGuides } from '../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType
} from '../../lib/og-image'

export { size, contentType }
export const alt = 'Guides'

export default async function Image() {
  return renderOgImage({
    title: 'Guides',
    category: 'guides',
    itemCount: getGuides().length
  })
}
