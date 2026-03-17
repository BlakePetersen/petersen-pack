// ABOUTME: Listing page for all skills in the collection.
// ABOUTME: Displays sorted skills with tags and links to detail pages.

import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from 'artax-ui'
import { getSkills } from '../../lib/content'
import { ContentShell } from '../../components/content-shell'
import { Sidebar } from '../../components/sidebar'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  const count = getSkills().length
  return {
    title: 'Skills',
    description: `Browse ${count} Claude Code skills for AI-first development`,
    alternates: {
      canonical: 'https://blakepetersen.io/skills',
    },
  }
}

function stripPrefix(slug: string) {
  return slug.split('/').slice(1).join('/')
}

export default function SkillsPage() {
  const items = getSkills()

  return (
    <ContentShell sidebar={<Sidebar />}>
      <div className="px-4 py-8">
        <h1 className="mb-6 font-mono text-sm text-muted-foreground">
          {'// '}skills
        </h1>
        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`/skills/${stripPrefix(item.slug)}`}
              className="group block border border-border p-4 transition-colors hover:border-primary"
            >
              <h2 className="font-mono text-sm font-medium group-hover:text-primary">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
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
    </ContentShell>
  )
}
