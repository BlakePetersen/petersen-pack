// ABOUTME: Dynamic sitemap generator from Velite content collections.
// ABOUTME: Lists homepage, listing pages, and all content items for search engine discovery.

import type { MetadataRoute } from 'next'
import { getSkills, getHooks, getConfigs, getGuides, getPosts, getAllGitHistory } from '../lib/content'

const BASE_URL = 'https://blakepetersen.io'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now },
    { url: `${BASE_URL}/skills`, lastModified: now },
    { url: `${BASE_URL}/hooks`, lastModified: now },
    { url: `${BASE_URL}/configs`, lastModified: now },
    { url: `${BASE_URL}/guides`, lastModified: now },
    { url: `${BASE_URL}/posts`, lastModified: now },
  ]

  const collections = [
    getSkills(),
    getHooks(),
    getConfigs(),
    getGuides(),
    getPosts(),
  ]

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
