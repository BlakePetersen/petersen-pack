// ABOUTME: Server layout for DX content pages (skills, hooks, configs, guides).
// ABOUTME: Renders metadata badges, MDX body, and dependency graph when available.

import { Badge, PrevNextNav } from 'artax-ui'
import { MDXContent } from './mdx-content'
import { ArtifactBody, ArtifactDataProvider } from './mdx/artifact-body'
import { DependencyGraph } from './dependency-graph'
import { Breadcrumbs } from './breadcrumbs'
import { buildNavData, getPrevNext } from '../lib/navigation'
import { getLocalGraphSvg } from '../lib/content'
import { readArtifactsJson } from '../lib/artifacts'
import { ApplyActionBar } from './apply-action-bar'
import { ContentFreshness } from './content-freshness'
import { ReactionCountProvider, ReactionCount } from './reaction-count'
import { DiscussionWithReactions } from './content-with-discussion'
import type { DxContent } from '../lib/content'

export function DxContentLayout({ item, artifact }: { item: DxContent; artifact?: { type: string; slug: string } }) {
  const graphSvg = getLocalGraphSvg(item.slug)

  const allArtifacts = readArtifactsJson()
  const artifactData = allArtifacts.map((a) => ({
    slug: a.slug,
    name: a.name,
    type: a.type,
    files: a.files.map((f) => ({ path: f.path, content: f.content })),
  }))

  const navData = buildNavData()
  const found = navData.findBySlug(item.slug)
  const siblings = found ? navData.itemsByCollection[found.collection] : []
  const { prev, next } = found
    ? getPrevNext(siblings, found.item.href)
    : { prev: null, next: null }
  const prevSlot = prev ? { href: prev.href, label: prev.title } : undefined
  const nextSlot = next ? { href: next.href, label: next.title } : undefined

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
        <ArtifactDataProvider artifacts={artifactData}>
          <MDXContent code={item.code} components={{ ArtifactBody }} />
        </ArtifactDataProvider>
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
          <h3 className="mb-2 font-mono text-sm text-muted-foreground">
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

      <PrevNextNav prev={prevSlot} next={nextSlot} />
    </article>
    </ReactionCountProvider>
  )
}
