// ABOUTME: Detail page for individual config content items.
// ABOUTME: Uses catch-all route to support nested slugs with static generation.

import { notFound } from 'next/navigation'
import { getConfigs } from '../../../lib/content'
import {
  buildMetadata,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from '../../../lib/metadata'
import { JsonLd } from '../../../components/json-ld'
import { DxContentLayout } from '../../../components/dx-content-layout'
import { ContentShell } from '../../../components/content-shell'
import { Sidebar } from '../../../components/sidebar'
import { TableOfContents } from '../../../components/table-of-contents'
import { RelatedContent } from '../../../components/related-content'
import { resolveRelatedSlugs } from '../../../lib/content'

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return getConfigs().map((item) => ({
    slug: item.slug.split('/').slice(1),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `configs/${slug.join('/')}`
  const item = getConfigs().find((c) => c.slug === fullSlug)
  if (!item) return {}
  return buildMetadata(item, 'configs')
}

export default async function ConfigPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `configs/${slug.join('/')}`
  const item = getConfigs().find((c) => c.slug === fullSlug)

  if (!item) notFound()

  const relatedItems = resolveRelatedSlugs(item.related ?? [])

  return (
    <ContentShell sidebar={<Sidebar />} toc={<><TableOfContents /><RelatedContent items={relatedItems} /></>}>
      <JsonLd data={buildArticleJsonLd(item, 'configs')} />
      <JsonLd data={buildBreadcrumbJsonLd(`/configs/${slug.join('/')}`)} />
      <DxContentLayout item={item} showApplyBar />
    </ContentShell>
  )
}
