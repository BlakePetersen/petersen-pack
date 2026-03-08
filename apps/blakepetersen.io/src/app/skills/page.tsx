// ABOUTME: Listing page for all skills in the collection.
// ABOUTME: Displays sorted skills with tags and links to detail pages.

import Link from 'next/link'
import { Badge } from 'artax-ui'
import { getSkills } from '../../lib/content'

export const revalidate = 3600

function stripPrefix(slug: string) {
  return slug.split('/').slice(1).join('/')
}

export default function SkillsPage() {
  const items = getSkills()

  return (
    <div className="mx-auto max-w-[80ch] px-4 py-8">
      <h1 className="mb-6 font-mono text-sm text-terminal-muted">
        {'// '}skills
      </h1>
      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={item.slug}
            href={`/skills/${stripPrefix(item.slug)}`}
            className="group block border border-terminal-border p-4 transition-colors hover:border-amber-accent"
          >
            <h2 className="font-mono text-sm font-medium group-hover:text-amber-accent">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-terminal-muted">
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
  )
}
