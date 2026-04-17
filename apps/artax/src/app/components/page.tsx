// ABOUTME: Component catalog overview page showing all 15 artax-ui components grouped by Atomic Design tier.
// ABOUTME: Server component that reads from the component registry and renders tier-grouped clickable cards.

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from 'artax-ui'
import { getComponentsByTier } from '@/lib/component-registry'

export const metadata: Metadata = {
  title: 'Components',
}

const tiers: { slug: 'atoms' | 'molecules' | 'organisms'; label: string }[] = [
  { slug: 'atoms', label: '// atoms' },
  { slug: 'molecules', label: '// molecules' },
  { slug: 'organisms', label: '// organisms' },
]

export default function ComponentsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Components</h1>
        <p className="text-muted-foreground">
          Browse all components organized by Atomic Design tier.
        </p>
      </header>

      {tiers.map((tier) => {
        const entries = getComponentsByTier(tier.slug)
        return (
          <section key={tier.slug} className="space-y-4">
            <h2 className="font-mono text-xs text-muted-foreground">
              {tier.label}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((c) => (
                <Link
                  key={c.slug}
                  href={`/components/${c.tier}/${c.slug}`}
                  className="block transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <Card className="h-full hover:border-primary">
                    <CardHeader>
                      <CardTitle>{c.name}</CardTitle>
                      <CardDescription>{c.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
