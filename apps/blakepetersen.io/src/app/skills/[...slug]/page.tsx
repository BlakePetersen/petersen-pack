// ABOUTME: Detail page for individual skill content items.
// ABOUTME: Uses catch-all route to support nested slugs with static generation.

import { notFound } from 'next/navigation'
import { getSkills } from '../../../lib/content'
import { DxContentLayout } from '../../../components/dx-content-layout'
import { ContentShell } from '../../../components/content-shell'
import { Sidebar } from '../../../components/sidebar'

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return getSkills().map((item) => ({
    slug: item.slug.split('/').slice(1),
  }))
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

  return (
    <ContentShell sidebar={<Sidebar />}>
      <DxContentLayout item={item} />
    </ContentShell>
  )
}
