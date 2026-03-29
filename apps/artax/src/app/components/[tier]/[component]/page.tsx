// ABOUTME: Dynamic component documentation page template.
// ABOUTME: Server component handles static params and metadata; delegates rendering to client.

import { notFound } from 'next/navigation'
import { getComponent, getAllComponents } from '@/lib/component-registry'
import { ComponentPageClient } from '@/components/component-page-client'

export function generateStaticParams() {
  return getAllComponents().map((c) => ({
    tier: c.tier,
    component: c.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tier: string; component: string }>
}) {
  const { tier, component: slug } = await params
  const comp = getComponent(tier, slug)
  return {
    title: comp?.name ?? 'Component',
  }
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ tier: string; component: string }>
}) {
  const { tier, component: slug } = await params
  const comp = getComponent(tier, slug)

  if (!comp) {
    notFound()
  }

  return <ComponentPageClient tier={tier} slug={slug} />
}
