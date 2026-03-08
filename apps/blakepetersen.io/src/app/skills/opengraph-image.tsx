// ABOUTME: Open Graph image for the skills listing page.
// ABOUTME: Renders terminal-styled image with category name and item count.

import { getSkills } from '../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType,
} from '../../lib/og-image'

export { size, contentType }
export const alt = 'Skills'

export default async function Image() {
  return renderOgImage({ title: 'Skills', category: 'skills', itemCount: getSkills().length })
}
