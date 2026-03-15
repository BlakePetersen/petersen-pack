// ABOUTME: Detail page for individual skill content items.
// ABOUTME: Uses catch-all route to support nested slugs with static generation.

import { notFound } from 'next/navigation'
import { getSkills } from '../../../lib/content'
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
  return getSkills().map((item) => ({
    slug: item.slug.split('/').slice(1),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `skills/${slug.join('/')}`
  const item = getSkills().find((s) => s.slug === fullSlug)
  if (!item) return {}
  return buildMetadata(item, 'skills')
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `skills/${slug.join('/')}`
  const item = getSkills().find((s) => s.slug === fullSlug)

  if (!item) notFound()

  const relatedItems = resolveRelatedSlugs(item.related ?? [])
  const artifact = getArtifactForContent(fullSlug)

  return (
    <ContentShell sidebar={<Sidebar />} toc={<><TableOfContents /><RelatedContent items={relatedItems} /></>}>
      <JsonLd data={buildArticleJsonLd(item, 'skills')} />
      <JsonLd data={buildBreadcrumbJsonLd(`/skills/${slug.join('/')}`)} />
      <DxContentLayout
        item={item}
        artifact={artifact ? { type: artifact.type, slug: artifact.slug } : undefined}
      />
    </ContentShell>
  )
}
