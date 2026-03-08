// ABOUTME: Detail page for individual guide content items.
// ABOUTME: Uses catch-all route to support nested slugs with static generation.

import { notFound } from 'next/navigation'
import { getGuides } from '../../../lib/content'
import { DxContentLayout } from '../../../components/dx-content-layout'
import { ContentShell } from '../../../components/content-shell'
import { Sidebar } from '../../../components/sidebar'

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return getGuides().map((item) => ({
    slug: item.slug.split('/').slice(1),
  }))
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

  return (
    <ContentShell sidebar={<Sidebar />}>
      <DxContentLayout item={item} />
    </ContentShell>
  )
}
