// ABOUTME: Server layout for DX content pages (skills, hooks, configs, guides).
// ABOUTME: Renders metadata badges, MDX body, and dependency graph when available.

import { Badge } from 'artax-ui'
import { MDXContent } from './mdx-content'
import { DependencyGraph } from './dependency-graph'
import { Breadcrumbs } from './breadcrumbs'
import { PageNavigation } from './page-navigation'
import { getLocalGraphSvg } from '../lib/content'
import { ApplyActionBar } from './apply-action-bar'
import { ContentFreshness } from './content-freshness'
import { ReactionCountProvider, ReactionCount } from './reaction-count'
import { DiscussionWithReactions } from './content-with-discussion'

type DxItem = {
  title: string
  description: string
  slug: string
  applies_to: string[]
  dependencies: string[]
  tags: string[]
  readingTime: number
  code: string
  decisions: { choice: string; rationale: string }[]
  related: string[]
  updated_context?: string
}

export function DxContentLayout({ item, artifact }: { item: DxItem; artifact?: { type: string; slug: string } }) {
  const graphSvg = getLocalGraphSvg(item.slug)

  return (
    <ReactionCountProvider>
    <article className="mx-auto max-w-[80ch] px-4 py-8">
      <Breadcrumbs pathname={`/${item.slug}`} />
      <header className="mb-8">
        <h1 className="mb-2 font-mono text-2xl font-bold">{item.title}</h1>
        <p className="mb-4 text-muted-foreground">{item.description}</p>

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

        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {item.readingTime} min read
          {' \u00b7 '}
          <ContentFreshness slug={item.slug} />
          {' · '}
          <ReactionCount />
        </p>
      </header>

      {artifact && <ApplyActionBar type={artifact.type} slug={artifact.slug} />}

      <div className={`prose-terminal${artifact ? ' mt-5' : ''}`}>
        <MDXContent code={item.code} />
      </div>

      {item.decisions.length > 0 && (
        <section className="mt-8 border border-border p-4">
          <h3 className="mb-4 font-mono text-xs text-info">{'// decisions'}</h3>
          <div className="space-y-3">
            {item.decisions.map((d, i) => (
              <div key={i} className="border-l-2 border-info/30 pl-3">
                <p className="font-mono text-sm text-foreground">{d.choice}</p>
                <p className="mt-1 font-sans text-sm text-muted-foreground">{d.rationale}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {item.dependencies.length > 0 && (
        <div className="mt-8 md:hidden">
          <h3 className="mb-2 font-mono text-sm text-zinc-500">
            {'// '}dependencies
          </h3>
          <ul className="space-y-1">
            {item.dependencies.map((dep) => (
              <li key={dep} className="font-mono text-xs text-muted-foreground">
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

      <DiscussionWithReactions
        slug={item.slug}
        title={item.title}
        pageUrl={`https://blakepetersen.io/${item.slug}`}
      />

      <PageNavigation
        collection={item.slug.split('/')[0]}
        currentHref={`/${item.slug}`}
      />
    </article>
    </ReactionCountProvider>
  )
}
