// ABOUTME: Renders a responsive card grid of related content items.
// ABOUTME: Resolves related slugs to cards with title, description, and link.

import Link from 'next/link'
import { resolveRelatedSlugs } from '../../lib/content'

function RelatedCards({ slugs }: { slugs: string[] }) {
  if (!slugs || slugs.length === 0) return null

  const items = resolveRelatedSlugs(slugs)
  if (items.length === 0) return null

  return (
    <section className="mt-8">
      <h3 className="mb-4 font-mono text-xs text-terminal-muted">
        {'// '}related
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-amber-500/50"
          >
            <h4 className="font-mono text-sm font-semibold text-terminal-text group-hover:text-amber-500">
              {item.title}
            </h4>
            <p className="mt-1 text-sm text-terminal-muted line-clamp-2">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export { RelatedCards }
