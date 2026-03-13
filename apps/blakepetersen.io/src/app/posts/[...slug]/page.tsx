// ABOUTME: Detail page for individual blog post items.
// ABOUTME: Uses catch-all route to support nested slugs with static generation.

import { notFound } from 'next/navigation'
import { getPosts } from '../../../lib/content'
import {
  buildMetadata,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from '../../../lib/metadata'
import { JsonLd } from '../../../components/json-ld'
import { PostLayout } from '../../../components/post-layout'
import { ContentShell } from '../../../components/content-shell'
import { Sidebar } from '../../../components/sidebar'
import { TableOfContents } from '../../../components/table-of-contents'
import { RelatedContent } from '../../../components/related-content'
import { resolveRelatedSlugs } from '../../../lib/content'

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return getPosts().map((item) => ({
    slug: item.slug.split('/').slice(1),
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `posts/${slug.join('/')}`
  const item = getPosts().find((p) => p.slug === fullSlug)
  if (!item) return {}
  return buildMetadata(item, 'posts')
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `posts/${slug.join('/')}`
  const item = getPosts().find((p) => p.slug === fullSlug)

  if (!item) notFound()

  const relatedItems = resolveRelatedSlugs((item as { related?: string[] }).related ?? [])

  return (
    <ContentShell sidebar={<Sidebar />} toc={<><TableOfContents /><RelatedContent items={relatedItems} /></>}>
      <JsonLd data={buildArticleJsonLd(item, 'posts')} />
      <JsonLd data={buildBreadcrumbJsonLd(`/posts/${slug.join('/')}`)} />
      <PostLayout post={item} />
    </ContentShell>
  )
}
