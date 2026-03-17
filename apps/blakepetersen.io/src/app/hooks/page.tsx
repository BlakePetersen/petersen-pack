// ABOUTME: Listing page for all hooks in the collection.
// ABOUTME: Displays sorted hooks with tags and links to detail pages.

import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from 'artax-ui'
import { getHooks } from '../../lib/content'
import { ContentShell } from '../../components/content-shell'
import { Sidebar } from '../../components/sidebar'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  const count = getHooks().length
  return {
    title: 'Hooks',
    description: `Browse ${count} Git hooks for automated code quality`,
    alternates: {
      canonical: 'https://blakepetersen.io/hooks',
    },
  }
}

function stripPrefix(slug: string) {
  return slug.split('/').slice(1).join('/')
}

export default function HooksPage() {
  const items = getHooks()

  return (
    <ContentShell sidebar={<Sidebar />}>
      <div className="px-4 py-8">
        <h1 className="mb-6 font-mono text-sm text-muted-foreground">
          {'// '}hooks
        </h1>
        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/hooks/${stripPrefix(item.slug)}`}
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
