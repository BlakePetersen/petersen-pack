// ABOUTME: Homepage with category card grid and recent posts section.
// ABOUTME: Displays dynamic counts and recent items from all content collections.

import Link from 'next/link'
import { getSkills, getHooks, getConfigs, getGuides, getPosts } from '../lib/content'
import { CategoryCard } from '../components/category-card'

export const revalidate = 3600

const categories = [
  { name: 'skills', label: 'skills', getter: getSkills, href: '/skills' },
  { name: 'hooks', label: 'hooks', getter: getHooks, href: '/hooks' },
  { name: 'configs', label: 'configs', getter: getConfigs, href: '/configs' },
  { name: 'guides', label: 'guides', getter: getGuides, href: '/guides' },
] as const

function stripPrefix(slug: string) {
  const parts = slug.split('/')
  return parts.slice(1).join('/')
}

export default function Home() {
  const posts = getPosts()
  const recentPosts = posts.slice(0, 5)

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <p className="mb-8 font-mono text-terminal-muted">
        {'> '}AI-first DX practices, documented and applied
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {categories.map(({ name, label, getter, href }) => {
          const items = getter()
          return (
            <CategoryCard
              key={name}
              name={name}
              label={label}
              count={items.length}
              recentItems={items.slice(0, 3).map((item) => ({
                title: item.title,
                slug: item.slug,
              }))}
              href={href}
            />
          )
        })}
      </div>

      {recentPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 font-mono text-sm text-terminal-muted">
            {'// '}recent_posts
          </h2>
          <div className="space-y-6">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${stripPrefix(post.slug)}`}
                className="group block border border-terminal-border p-4 transition-colors hover:border-amber-accent"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-mono text-sm font-medium group-hover:text-amber-accent">
                    {post.title}
                  </h3>
                  <time
                    dateTime={post.date}
                    className="shrink-0 font-mono text-xs text-terminal-muted"
                  >
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                </div>
                <p className="mt-1 text-sm text-terminal-muted">
                  {post.description}
                </p>
                <span className="mt-2 inline-block font-mono text-xs text-terminal-muted">
                  {post.readingTime} min read
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
