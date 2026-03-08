// ABOUTME: Listing page for all blog posts.
// ABOUTME: Displays posts sorted by date with description and reading time.

import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from 'artax-ui'
import { getPosts } from '../../lib/content'
import { ContentShell } from '../../components/content-shell'
import { Sidebar } from '../../components/sidebar'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  const count = getPosts().length
  return {
    title: 'Posts',
    description: `Browse ${count} blog posts on software engineering and AI-first development`,
    alternates: {
      canonical: 'https://blakepetersen.io/posts',
    },
  }
}

function stripPrefix(slug: string) {
  return slug.split('/').slice(1).join('/')
}

export default function PostsPage() {
  const items = getPosts()

  return (
    <ContentShell sidebar={<Sidebar />}>
      <div className="px-4 py-8">
        <h1 className="mb-6 font-mono text-sm text-terminal-muted">
          {'// '}posts
        </h1>
        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/posts/${stripPrefix(item.slug)}`}
              className="group block border border-terminal-border p-4 transition-colors hover:border-amber-accent"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-mono text-sm font-medium group-hover:text-amber-accent">
                  {item.title}
                </h2>
                <time
                  dateTime={item.date}
                  className="shrink-0 font-mono text-xs text-terminal-muted"
                >
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <p className="mt-1 text-sm text-terminal-muted">
                {item.description}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-xs text-terminal-muted">
                  {item.readingTime} min read
                </span>
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
