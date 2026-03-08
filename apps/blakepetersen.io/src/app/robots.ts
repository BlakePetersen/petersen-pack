// ABOUTME: Robots.txt configuration allowing all crawlers.
// ABOUTME: References sitemap for search engine discovery.

import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://blakepetersen.io/sitemap.xml',
  }
}
