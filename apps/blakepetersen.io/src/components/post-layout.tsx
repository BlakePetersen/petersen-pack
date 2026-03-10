// ABOUTME: Server layout for blog post pages.
// ABOUTME: Renders post header with date, reading time, tags, and MDX body.

import { Badge } from 'artax-ui'
import { MDXContent } from './mdx-content'
import { Breadcrumbs } from './breadcrumbs'
import { PageNavigation } from './page-navigation'
import { ContentFreshness } from './content-freshness'

type PostItem = {
  title: string
  slug: string
  date: string
  tags: string[]
  readingTime: number
  code: string
}

export function PostLayout({ post }: { post: PostItem }) {
  return (
    <article className="mx-auto max-w-[80ch] px-4 py-8">
      <Breadcrumbs pathname={`/${post.slug}`} />
      <header className="mb-8">
        <h1 className="mb-2 font-mono text-2xl font-bold">{post.title}</h1>

        <div className="mb-4 flex items-center gap-4 font-mono text-xs text-terminal-muted">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>{post.readingTime} min read</span>
          <ContentFreshness slug={post.slug} />
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <div className="prose-terminal">
        <MDXContent code={post.code} />
      </div>

      <PageNavigation
        collection="posts"
        currentHref={`/${post.slug}`}
      />
    </article>
  )
}
