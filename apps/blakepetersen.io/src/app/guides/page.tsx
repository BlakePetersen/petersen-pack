// ABOUTME: Listing page for all guides in the collection.
// ABOUTME: Displays sorted guides with tags and links to detail pages.

import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from 'artax-ui'
import { getGuides } from '../../lib/content'
import { ContentShell } from '../../components/content-shell'
import { Sidebar } from '../../components/sidebar'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  const count = getGuides().length
  return {
    title: 'Guides',
    description: `Browse ${count} development guides for AI-first workflows`,
    alternates: {
      canonical: 'https://blakepetersen.io/guides',
    },
  }
}

function stripPrefix(slug: string) {
  return slug.split('/').slice(1).join('/')
}

export default function GuidesPage() {
  const items = getGuides()

  return (
    <ContentShell sidebar={<Sidebar />}>
      <div className="px-4 py-8">
        <h1 className="mb-6 font-mono text-sm text-muted-foreground">
          {'// '}guides
        </h1>
        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/guides/${stripPrefix(item.slug)}`}
              className="group block border border-border p-4 transition-colors hover:border-primary"
            >
              <h2 className="font-mono text-sm font-medium group-hover:text-primary">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ContentShell>
  )
}
