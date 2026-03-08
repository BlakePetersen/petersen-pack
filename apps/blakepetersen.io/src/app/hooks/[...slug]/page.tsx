// ABOUTME: Detail page for individual hook content items.
// ABOUTME: Uses catch-all route to support nested slugs with static generation.

import { notFound } from 'next/navigation'
import { getHooks } from '../../../lib/content'
import { DxContentLayout } from '../../../components/dx-content-layout'

export const dynamicParams = false
export const revalidate = 3600

export function generateStaticParams() {
  return getHooks().map((item) => ({
    slug: item.slug.split('/').slice(1),
  }))
}

export default async function HookPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const fullSlug = `hooks/${slug.join('/')}`
  const item = getHooks().find((h) => h.slug === fullSlug)

  if (!item) notFound()

  return <DxContentLayout item={item} />
}
