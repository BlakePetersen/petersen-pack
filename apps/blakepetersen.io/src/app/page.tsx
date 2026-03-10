// ABOUTME: Homepage with DX workbench hero, stack snapshot, content grid, and contribution callout.
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

const stackTools = ['Next.js', 'TypeScript', 'Tailwind', 'Claude', 'pnpm', 'Velite', 'Turborepo', 'ESLint', 'Prettier']

function stripPrefix(slug: string) {
  const parts = slug.split('/')
  return parts.slice(1).join('/')
}

export default function Home() {
  const posts = getPosts()
  const recentPosts = posts.slice(0, 5)

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      {/* Section 1: Workbench hero */}
      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-terminal-muted">{'// dx_workbench'}</p>
        <div className="border border-terminal-border p-6">
          <p className="font-mono text-lg text-terminal-text">
            Opinionated AI-first DX practices,<br />documented and ready to apply.
          </p>
          <nav className="mt-4 flex flex-wrap gap-3 font-mono text-sm">
            <Link href="/skills" className="text-amber-accent hover:underline">[skills]</Link>
            <Link href="/hooks" className="text-amber-accent hover:underline">[hooks]</Link>
            <Link href="/configs" className="text-amber-accent hover:underline">[configs]</Link>
            <Link href="/guides" className="text-amber-accent hover:underline">[guides]</Link>
          </nav>
        </div>
      </section>

      {/* Section 2: Stack snapshot */}
      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-terminal-muted">{'// stack'}</p>
        <div className="flex flex-wrap gap-2">
          {stackTools.map(tool => (
            <span key={tool} className="border border-terminal-border px-2 py-1 font-mono text-xs text-terminal-secondary">
              {tool}
            </span>
          ))}
        </div>
      </section>

      {/* Section 3: Enriched content grid */}
      <section className="mb-12">
        <p className="mb-4 font-mono text-xs text-terminal-muted">{'// collections'}</p>
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
                  description: item.description,
                  applies_to: 'applies_to' in item ? (item as { applies_to?: string[] }).applies_to : undefined,
                }))}
                href={href}
              />
            )
          })}
        </div>
      </section>

      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <section className="mb-12">
          <p className="mb-4 font-mono text-xs text-terminal-muted">{'// recent_posts'}</p>
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

      {/* Section 4: Contribution callout */}
      <section className="mt-12">
        <p className="mb-4 font-mono text-xs text-terminal-muted">{'// contribute'}</p>
        <div className="border border-terminal-border p-6">
          <p className="mb-4 font-mono text-sm text-terminal-secondary">
            Found something useful? Have feedback?
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-sm">
            <a href="https://github.com/BlakePetersen/petersen-pack/issues/new" className="text-amber-accent hover:underline">
              $ report-problem
            </a>
            <a href="https://github.com/BlakePetersen/petersen-pack/discussions" className="text-amber-accent hover:underline">
              $ suggest-improvement
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
