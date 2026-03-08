// ABOUTME: Route handler for detail-page Open Graph images.
// ABOUTME: Serves OG images via query params to avoid catch-all route conflicts.

import { type NextRequest } from 'next/server'
import { getSkills, getHooks, getConfigs, getGuides, getPosts } from '../../../lib/content'
import { renderOgImage } from '../../../lib/og-image'

const collectionGetters: Record<string, () => { slug: string; title: string }[]> = {
  skills: getSkills,
  hooks: getHooks,
  configs: getConfigs,
  guides: getGuides,
  posts: getPosts,
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const slug = searchParams.get('slug')
  const category = searchParams.get('category')

  if (!slug || !category) {
    return new Response('Missing slug or category', { status: 400 })
  }

  const getter = collectionGetters[category]
  if (!getter) {
    return new Response('Invalid category', { status: 400 })
  }

  const items = getter()
  const item = items.find((i) => i.slug === slug)
  const title = item?.title ?? category

  return renderOgImage({ title, category })
}
