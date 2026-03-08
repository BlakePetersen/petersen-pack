// ABOUTME: Server layout for DX content pages (skills, hooks, configs, guides).
// ABOUTME: Renders metadata badges, MDX body, and dependency graph when available.

import { Badge } from 'artax-ui'
import { MDXContent } from './mdx-content'
import { DependencyGraph } from './dependency-graph'
import { getLocalGraphSvg } from '../lib/content'

type DxItem = {
  title: string
  description: string
  slug: string
  applies_to: string[]
  dependencies: string[]
  tags: string[]
  readingTime: number
  code: string
}

export function DxContentLayout({ item }: { item: DxItem }) {
  const graphSvg = getLocalGraphSvg(item.slug)

  return (
    <article className="mx-auto max-w-[80ch] px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-2 font-mono text-2xl font-bold">{item.title}</h1>
        <p className="mb-4 text-terminal-muted">{item.description}</p>

        <div className="flex flex-wrap gap-2">
          {item.applies_to.map((tool) => (
            <Badge key={tool} variant="outline">
              {tool}
            </Badge>
          ))}
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        <p className="mt-2 font-mono text-xs text-terminal-muted">
          {item.readingTime} min read
        </p>
      </header>

      <div className="prose-terminal">
        <MDXContent code={item.code} />
      </div>

      {item.dependencies.length > 0 && (
        <div className="mt-8 md:hidden">
          <h3 className="mb-2 font-mono text-sm text-zinc-500">
            {'// '}dependencies
          </h3>
          <ul className="space-y-1">
            {item.dependencies.map((dep) => (
              <li key={dep} className="font-mono text-xs text-terminal-muted">
                {'> '}{dep}
              </li>
            ))}
          </ul>
        </div>
      )}

      {graphSvg && (
        <div className="hidden md:block">
          <DependencyGraph svgContent={graphSvg} />
        </div>
      )}
    </article>
  )
}
