// ABOUTME: Listing page for all blog posts.
// ABOUTME: Delegates to collection page engine for metadata and rendering.

import { createCollectionIndexPage } from '../../lib/collection-pages'

export const revalidate = 3600

const { generateMetadata, Page } = createCollectionIndexPage('posts')
export { generateMetadata }
export default Page
