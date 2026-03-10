// ABOUTME: Homepage category card showing collection name, item count, and recent items.
// ABOUTME: Terminal aesthetic with box-drawing borders on desktop and amber accent on hover.

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from 'artax-ui'

type CategoryCardProps = {
  name: string
  label: string
  count: number
  recentItems: { title: string; slug: string; description: string; applies_to?: string[] }[]
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
          <ul className="space-y-3">
            {recentItems.map((item) => (
              <li key={item.slug} className="min-w-0">
                <p className="truncate font-mono text-xs text-terminal-secondary">
                  <span className="text-terminal-muted">{'> '}</span>
                  {item.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-terminal-muted">
                  {item.description}
                </p>
                {item.applies_to && item.applies_to.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.applies_to.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="border border-terminal-border px-1 py-0.5 font-mono text-[10px] text-terminal-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Link>
  )
}
