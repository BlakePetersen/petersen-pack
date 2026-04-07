// ABOUTME: Listing page for all skills in the collection.
// ABOUTME: Delegates to collection page engine for metadata and rendering.

import { createCollectionIndexPage } from '../../lib/collection-pages'

export const revalidate = 3600

const { generateMetadata, Page } = createCollectionIndexPage('skills')
export { generateMetadata }
export default Page
