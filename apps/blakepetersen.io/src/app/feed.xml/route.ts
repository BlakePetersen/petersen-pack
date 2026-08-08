// ABOUTME: RSS 2.0 feed generator for all content collections.
// ABOUTME: Statically generated at build time, serves XML at /feed.xml.

import { getAllCollections } from '../../lib/collection-registry'
import { escapeXml } from '../../lib/metadata'

export const dynamic = 'force-static'

const SITE_URL = 'https://blakepetersen.io'

type FeedItem = {
  title: string
  slug: string
  excerpt?: string
  description?: string
  date?: string
}

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '...'
}

function buildItem(item: FeedItem): string {
  const link = `${SITE_URL}/${item.slug}`
  const desc = truncate(item.excerpt ?? item.description ?? '', 300)
  const pubDate = item.date
    ? `<pubDate>${new Date(item.date).toUTCString()}</pubDate>`
    : ''

  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(desc)}</description>
      ${pubDate}
    </item>`
}

export async function GET(): Promise<Response> {
  const feedCollections = getAllCollections().filter(c => c.showInFeed)
  const postCollection = feedCollections.find(c => c.slug === 'posts')
  const posts = postCollection ? postCollection.getter() : []
  const dxItems = feedCollections
    .filter(c => c.slug !== 'posts')
    .flatMap(c => c.getter())

  // Posts sorted by date descending (already sorted from getPosts), then DX content
  const items = [...posts, ...dxItems]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blake Petersen</title>
    <link>${SITE_URL}</link>
    <description>AI-first DX practices, documented and applied</description>
    <language>en-us</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items.map(buildItem).join('\n')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  })
}
