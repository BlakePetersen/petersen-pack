// ABOUTME: Homepage category card showing collection name, item count, and recent items.
// ABOUTME: Terminal aesthetic with box-drawing borders on desktop and amber accent on hover.

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from 'artax-ui'

type CategoryCardProps = {
  name: string
  label: string
  count: number
  recentItems: { title: string; slug: string }[]
  href: string
}

export function CategoryCard({
  name,
  label,
  count,
  recentItems,
  href,
}: CategoryCardProps) {
  return (
    <Link href={href} className="group block">
      <Card className="transition-colors group-hover:border-amber-accent">
        <CardHeader>
          <CardTitle>{label}</CardTitle>
          <p className="font-mono text-xs text-terminal-muted">
            {count} {count === 1 ? 'entry' : 'entries'}
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {recentItems.map((item) => (
              <li
                key={item.slug}
                className="truncate font-mono text-xs text-terminal-secondary"
              >
                <span className="text-terminal-muted">{'> '}</span>
                {item.title}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Link>
  )
}
