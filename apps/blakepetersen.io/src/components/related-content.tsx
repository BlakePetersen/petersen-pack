// ABOUTME: Related content links rendered in the right sidebar below the table of contents.
// ABOUTME: Resolves slugs from frontmatter to titles and hrefs using content collections.

import Link from 'next/link'

type RelatedItem = {
  title: string
  href: string
}

export function RelatedContent({ items }: { items: RelatedItem[] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Related content" className="p-4 font-mono text-xs">
      <p className="mb-3 text-info">{'// related'}</p>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-info"
            >
              {'> '}
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
