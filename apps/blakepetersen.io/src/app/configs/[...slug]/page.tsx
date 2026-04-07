// ABOUTME: Detail page for individual config content items.
// ABOUTME: Delegates to collection page engine for static generation and rendering.

import { createCollectionDetailPage } from '../../../lib/collection-pages'

export const dynamicParams = false
export const revalidate = 3600

const { generateStaticParams, generateMetadata, Page } = createCollectionDetailPage('configs')
export { generateStaticParams, generateMetadata }
export default Page
