// ABOUTME: Previous/next page links at the bottom of content detail pages.
// ABOUTME: Uses terminal arrow style and navigates within the same content type.

import Link from 'next/link'
import { buildNavData, getPrevNext } from '../lib/navigation'

export function PageNavigation({ slug }: { slug: string }) {
  const navData = buildNavData()
  const found = navData.findBySlug(slug)

  if (!found) {
    return null
  }

  const items = navData.itemsByCollection[found.collection]
  const { prev, next } = getPrevNext(items, found.item.href)

  if (!prev && !next) {
    return null
  }

  return (
    <nav
      aria-label="Page navigation"
      className="mt-8 border-t border-border pt-6"
    >
      <div className="flex justify-between font-mono text-sm">
        <div>
          {prev && (
            <Link
              href={prev.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {'< '}
              {prev.title}
            </Link>
          )}
        </div>
        <div>
          {next && (
            <Link
              href={next.href}
              className="text-muted-foreground hover:text-foreground"
            >
              {next.title}
              {' >'}
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
