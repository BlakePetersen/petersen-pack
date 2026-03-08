// ABOUTME: Terminal-styled breadcrumb trail for content detail pages.
// ABOUTME: Shows path as "// collection / page-name" with linked segments.

import Link from 'next/link'

export type Breadcrumb = {
  label: string
  href: string
}

export function buildBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean)

  // Only show breadcrumbs on detail pages (2+ segments like /collection/item)
  if (segments.length < 2) {
    return []
  }

  return segments.map((segment, index) => ({
    label: segment.replace(/-/g, ' '),
    href: '/' + segments.slice(0, index + 1).join('/'),
  }))
}

export function Breadcrumbs({ pathname }: { pathname: string }) {
  const crumbs = buildBreadcrumbs(pathname)

  if (crumbs.length === 0) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4 font-mono text-sm">
      <span className="text-terminal-muted">{'// '}</span>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        return (
          <span key={crumb.href}>
            {index > 0 && (
              <span className="text-terminal-muted">{' / '}</span>
            )}
            <Link
              href={crumb.href}
              className={
                isLast
                  ? 'text-terminal-text'
                  : 'text-terminal-muted hover:text-terminal-text'
              }
            >
              {crumb.label}
            </Link>
          </span>
        )
      })}
    </nav>
  )
}
