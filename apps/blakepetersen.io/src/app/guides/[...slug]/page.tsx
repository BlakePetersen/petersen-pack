// ABOUTME: Detail page for individual guide content items.
// ABOUTME: Uses catch-all route to support nested slugs with static generation.

import { notFound } from 'next/navigation'
import { getGuides } from '../../../lib/content'
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
import { getArtifactForContent } from '../../../lib/artifacts'

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return getGuides().map((item) => ({
    slug: item.slug.split('/').slice(1),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `guides/${slug.join('/')}`
  const item = getGuides().find((g) => g.slug === fullSlug)
  if (!item) return {}
  return buildMetadata(item, 'guides')
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `guides/${slug.join('/')}`
  const item = getGuides().find((g) => g.slug === fullSlug)

  if (!item) notFound()

  const relatedItems = resolveRelatedSlugs(item.related ?? [])
  const artifact = getArtifactForContent(fullSlug)

  return (
    <ContentShell sidebar={<Sidebar />} toc={<><TableOfContents /><RelatedContent items={relatedItems} /></>}>
      <JsonLd data={buildArticleJsonLd(item, 'guides')} />
      <JsonLd data={buildBreadcrumbJsonLd(`/guides/${slug.join('/')}`)} />
      <DxContentLayout
        item={item}
        artifact={artifact ? { type: artifact.type, slug: artifact.slug } : undefined}
      />
    </ContentShell>
  )
}
