// ABOUTME: Open Graph image for the configs listing page.
// ABOUTME: Renders terminal-styled image with category name and item count.

import { getConfigs } from '../../lib/content'
import {
  renderOgImage,
  ogImageSize as size,
  ogImageContentType as contentType,
} from '../../lib/og-image'

export { size, contentType }
export const alt = 'Configs'

export default async function Image() {
  return renderOgImage({ title: 'Configs', category: 'configs', itemCount: getConfigs().length })
}
