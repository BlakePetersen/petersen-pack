// ABOUTME: Open Graph image for the hooks listing page.
// ABOUTME: Renders terminal-styled image with category name and item count.

import { getHooks } from '../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType
} from '../../lib/og-image'

export { size, contentType }
export const alt = 'Hooks'

export default async function Image() {
  return renderOgImage({
    title: 'Hooks',
    category: 'hooks',
    itemCount: getHooks().length
  })
}
