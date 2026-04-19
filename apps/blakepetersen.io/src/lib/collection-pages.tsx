// ABOUTME: Factory functions that generate Next.js page exports for content collections.
// ABOUTME: Eliminates duplicated detail and index page logic across 5 collection routes.

/* eslint-disable @eslint-react/component-hook-factories */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from 'artax-ui'
import { getCollection } from './collection-registry'
import { resolveRelatedSlugs } from './content'
import { getArtifactForContent } from './artifacts'
import {
  buildMetadata,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from './metadata'
import { JsonLd } from '../components/json-ld'
import { DxContentLayout } from '../components/dx-content-layout'
import { PostLayout } from '../components/post-layout'
import { ContentShell } from '../components/content-shell'
import { Sidebar } from '../components/sidebar'
import { TableOfContents } from '../components/table-of-contents'
import { RelatedContent } from '../components/related-content'

function stripPrefix(slug: string) {
  return slug.split('/').slice(1).join('/')
}

// --- Detail page factory ---

export function createCollectionDetailPage(collectionSlug: string) {
  const collection = getCollection(collectionSlug)

  function generateStaticParams() {
    return collection.getter().map((item) => ({
      slug: item.slug.split('/').slice(1),
    }))
  }

  async function generateMetadata({
    params,
  }: {
    params: Promise<{ slug: string[] }>
  }) {
    const { slug } = await params
    const fullSlug = `${collectionSlug}/${slug.join('/')}`
    const item = collection.getter().find((i) => i.slug === fullSlug)
    if (!item) return {}
    return buildMetadata(item, collectionSlug)
  }

  async function Page({
    params,
  }: {
    params: Promise<{ slug: string[] }>
  }) {
    const { slug } = await params
    const fullSlug = `${collectionSlug}/${slug.join('/')}`
    const item = collection.getter().find((i) => i.slug === fullSlug)

    if (!item) notFound()

    // The getter return type is loose ({ [key: string]: unknown }) for registry generality.
    // Cast through unknown to access collection-specific fields safely at the page boundary.
    const anyItem = item as unknown as Record<string, unknown>
    const relatedItems = resolveRelatedSlugs((anyItem.related as string[] | undefined) ?? [])

    if (collection.layout === 'post') {
      return (
        <ContentShell sidebar={<Sidebar />} toc={<><TableOfContents /><RelatedContent items={relatedItems} /></>}>
          <JsonLd data={buildArticleJsonLd(item, collectionSlug)} />
          <JsonLd data={buildBreadcrumbJsonLd(`/${collectionSlug}/${slug.join('/')}`)} />
          <PostLayout post={anyItem as Parameters<typeof PostLayout>[0]['post']} />
        </ContentShell>
      )
    }

    const artifact = getArtifactForContent(fullSlug)

    return (
      <ContentShell sidebar={<Sidebar />} toc={<><TableOfContents /><RelatedContent items={relatedItems} /></>}>
        <JsonLd data={buildArticleJsonLd(item, collectionSlug)} />
        <JsonLd data={buildBreadcrumbJsonLd(`/${collectionSlug}/${slug.join('/')}`)} />
        <DxContentLayout
          item={anyItem as Parameters<typeof DxContentLayout>[0]['item']}
          artifact={artifact ? { type: artifact.type, slug: artifact.slug } : undefined}
        />
      </ContentShell>
    )
  }

  return { generateStaticParams, generateMetadata, Page }
}

// --- Index page factory ---

export function createCollectionIndexPage(collectionSlug: string) {
  const collection = getCollection(collectionSlug)

  function generateMetadata(): Metadata {
    const count = collection.getter().length
    return {
      title: collection.label,
      description: collection.indexDescription(count),
      alternates: {
        canonical: `https://blakepetersen.io/${collectionSlug}`,
      },
    }
  }

  function Page() {
    const items = collection.getter()

    if (items.length === 0) {
      return (
        <ContentShell sidebar={<Sidebar />}>
          <div className="px-4 py-8">
            <header className="mb-8">
              <p className="mb-2 font-mono text-xs text-muted-foreground">
                {'// empty_collection'}
              </p>
              <h1 className="font-mono-alt text-3xl leading-tight">
                {collection.label}
              </h1>
            </header>
            <p className="font-mono text-base">
              No entries yet. Check back, or contribute one →{' '}
              <Link href="/start-here" className="text-primary hover:underline">
                [contribute]
              </Link>
            </p>
          </div>
        </ContentShell>
      )
    }

    return (
      <ContentShell sidebar={<Sidebar />}>
        <div className="px-4 py-8">
          <header className="mb-8">
            <p className="mb-2 font-mono text-xs text-muted-foreground">
              {'// '}{collectionSlug}
            </p>
            <div className="flex items-baseline gap-3">
              <h1 className="font-mono-alt text-3xl leading-tight">
                {collection.label}
              </h1>
              <Badge variant="secondary">{items.length}</Badge>
            </div>
            <p className="mt-2 font-mono text-base text-muted-foreground">
              {collection.indexDescription(items.length)}
            </p>
          </header>
          <div className="space-y-4">
            {items.map((item) => {
              const a = item as unknown as Record<string, unknown>
              return (
                <Link
                  key={item.slug}
                  href={`/${collectionSlug}/${stripPrefix(item.slug)}`}
                  className="group block border border-border p-4 transition-colors hover:border-primary"
                >
                  {collection.layout === 'post' ? (
                    <>
                      <div className="flex items-baseline justify-between gap-4">
                        <h2 className="text-base font-medium text-foreground group-hover:text-primary">
                          {item.title}
                        </h2>
                        <time
                          dateTime={a.date as string}
                          className="shrink-0 font-mono text-xs text-muted-foreground"
                        >
                          {new Date(a.date as string).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </time>
                      </div>
                      <p className="mt-1 font-mono text-base text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {a.readingTime as number} min read
                        </span>
                        {(a.tags as string[]).map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-base font-medium text-foreground group-hover:text-primary">
                        {item.title}
                      </h2>
                      <p className="mt-1 font-mono text-base text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(a.tags as string[]).map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </ContentShell>
    )
  }

  return { generateMetadata, Page }
}
