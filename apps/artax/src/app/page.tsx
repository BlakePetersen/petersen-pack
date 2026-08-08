// ABOUTME: Landing page for the Artax UI reference site.
// ABOUTME: Displays dynamic component counts by tier and quick-link cards to section pages.

import Link from 'next/link'
import { Badge, Card, CardHeader, CardTitle, CardDescription } from 'artax-ui'
import { getComponentCounts } from '@/lib/component-counts'

const sections = [
  {
    href: '/getting-started',
    title: 'Getting Started',
    description: 'Installation, setup, and configuration'
  },
  {
    href: '/components',
    title: 'Components',
    description: 'Browse all components by tier'
  },
  {
    href: '/tokens',
    title: 'Design Tokens',
    description: 'Colors, typography, spacing, and radii'
  }
] as const

export default function HomePage() {
  const counts = getComponentCounts()

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold md:text-4xl">Artax UI</h1>
        <p className="text-muted-foreground">
          A terminal-aesthetic design system built with Radix primitives and
          Tailwind CSS v4
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge>{counts.atoms} Atoms</Badge>
          <Badge>{counts.molecules} Molecules</Badge>
          <Badge>{counts.organisms} Organisms</Badge>
          <Badge variant="outline">{counts.total} Total</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map(section => (
          <Link key={section.href} href={section.href} className="group">
            <Card className="transition-colors group-hover:border-foreground/25">
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
