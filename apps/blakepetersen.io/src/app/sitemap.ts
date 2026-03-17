// ABOUTME: Dynamic sitemap generator from Velite content collections.
// ABOUTME: Lists homepage, listing pages, and all content items for search engine discovery.

import type { MetadataRoute } from 'next'
import { getAllGitHistory } from '../lib/content'
import { getAllCollections } from '../lib/collection-registry'

const BASE_URL = 'https://blakepetersen.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const allCollections = getAllCollections().filter((c) => c.showInSitemap)

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now },
    ...allCollections.map((c) => ({ url: `${BASE_URL}${c.href}`, lastModified: now })),
  ]

  const collections = allCollections.map((c) => c.getter())

  const gitHistory = getAllGitHistory()

  const contentPages: MetadataRoute.Sitemap = collections.flatMap((items) =>
    items.map((item) => ({
      url: `${BASE_URL}/${item.slug}`,
      lastModified: gitHistory[item.slug]
        ? new Date(gitHistory[item.slug].lastModified)
        : now,
    })),
  )

  return [...staticPages, ...contentPages]
}
