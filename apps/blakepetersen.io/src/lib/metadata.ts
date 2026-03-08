// ABOUTME: Shared metadata helpers for SEO, JSON-LD, and XML generation.
// ABOUTME: Provides buildMetadata for route generateMetadata and XML escaping for feeds.

import type { Metadata } from 'next'
import type { TechArticle, BreadcrumbList, WithContext } from 'schema-dts'
import { buildBreadcrumbs } from '../components/breadcrumbs'

const SITE_URL = 'https://blakepetersen.io'

type ContentItem = {
  title: string
  description?: string
  excerpt?: string
  slug: string
  date?: string
  seo_title?: string
  seo_description?: string
}

export function buildMetadata(item: ContentItem, collection: string): Metadata & { alternates: { canonical: string } } {
  const title = item.seo_title ?? item.title
  const description = item.seo_description ?? item.excerpt ?? item.description ?? ''

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${item.slug}`,
    },
    openGraph: {
      title,
      description,
      images: [
        {
          url: `${SITE_URL}/api/og?category=${collection}&slug=${encodeURIComponent(item.slug)}`,
          width: 1200,
          height: 630,
          type: 'image/png',
        },
      ],
    },
  }
}

export function buildArticleJsonLd(item: ContentItem, collection: string): WithContext<TechArticle> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: item.title,
    description: item.excerpt ?? item.description ?? '',
    author: {
      '@type': 'Person',
      name: 'Blake Petersen',
    },
    ...(item.date ? { datePublished: item.date } : {}),
  }
}

export function buildBreadcrumbJsonLd(pathname: string): WithContext<BreadcrumbList> {
  const crumbs = buildBreadcrumbs(pathname)

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: crumb.label,
      item: `${SITE_URL}${crumb.href}`,
    })),
  }
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
