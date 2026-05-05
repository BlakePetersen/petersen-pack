// ABOUTME: Robots.txt configuration for search engine crawlers
// ABOUTME: Allows crawling of public pages while protecting admin areas

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/uploads/', // Protect direct file access
        ],
        crawlDelay: 0,
      },
      // Optimize for Google
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      // Optimize for Bing
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
        crawlDelay: 0,
      },
    ],
    sitemap: 'https://ashleypetersen.com/sitemap.xml',
  }
}
