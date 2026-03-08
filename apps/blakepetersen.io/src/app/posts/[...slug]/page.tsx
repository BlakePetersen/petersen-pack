// ABOUTME: Detail page for individual blog post items.
// ABOUTME: Uses catch-all route to support nested slugs with static generation.

import { notFound } from 'next/navigation'
import { getPosts } from '../../../lib/content'
import { PostLayout } from '../../../components/post-layout'
import { ContentShell } from '../../../components/content-shell'
import { Sidebar } from '../../../components/sidebar'

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return getPosts().map((item) => ({
    slug: item.slug.split('/').slice(1),
  }))
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

  return (
    <ContentShell sidebar={<Sidebar />}>
      <PostLayout post={item} />
    </ContentShell>
  )
}
