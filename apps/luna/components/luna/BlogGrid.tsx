// ABOUTME: Client component for filterable blog post grid
// ABOUTME: Handles category filtering with scroll-aware animations

'use client'

import { useRouter, usePathname } from 'next/navigation'
import {
  ContentCard,
  Container,
  Section,
  AnimatedList,
} from '@/components/commons'
import { BlogFilterTabs, BLOG_FILTERS, useBlogFilter } from './BlogFilterTabs'
import { cleanBlogTitle } from '@/lib/utils'

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  publishedAt: Date | null
  categories: Array<{
    category: {
      id: string
      name: string
      slug: string
    }
  }>
  tags: Array<{
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
  _count: {
    images: number
  }
}

type Category = {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

type Tag = {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

type BlogGridProps = {
  posts: BlogPost[]
  categories: Category[]
  tags: Tag[]
}

// Check if a post matches a filter's slugs
function postMatchesFilter(post: BlogPost, slugs: readonly string[]): boolean {
  if (slugs.length === 0) return true

  const postCategorySlugs = post.categories.map((c) =>
    c.category.slug.toLowerCase()
  )
  const postTagSlugs = post.tags.map((t) => t.tag.slug.toLowerCase())
  const allPostSlugs = [...postCategorySlugs, ...postTagSlugs]

  return slugs.some(
    (slug) =>
      allPostSlugs.includes(slug) ||
      allPostSlugs.some((ps) => ps.includes(slug))
  )
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Get active filter from URL
  const activeFilter = useBlogFilter()

  // Filter posts based on active filter
  const filteredPosts =
    activeFilter.value === 'all'
      ? posts
      : posts.filter((post) => postMatchesFilter(post, activeFilter.slugs))

  // Only show filters that have matching posts
  const availableFilters = BLOG_FILTERS.filter((filter) => {
    if (filter.value === 'all') return true
    return posts.some((post) => postMatchesFilter(post, filter.slugs))
  })

  // Reset filter handler
  const handleResetFilter = () => {
    router.replace(pathname, { scroll: false })
  }

  return (
    <>
      <BlogFilterTabs availableFilters={availableFilters} />

      {/* Blog Grid */}
      <Section>
        <Container>
          {filteredPosts.length === 0 ? (
            <div className="rounded-xl bg-gray-50 py-16 text-center shadow-soft dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                No posts in this category yet.
              </p>
              <button
                onClick={handleResetFilter}
                className="mt-4 text-sm font-medium text-gray-900 underline underline-offset-4 dark:text-white"
              >
                View all posts
              </button>
            </div>
          ) : (
            <AnimatedList
              items={filteredPosts}
              keyExtractor={(post) => post.id}
              layout="grid"
              gridCols={3}
              staggerDelay={0.06}
              renderItem={(post) => <BlogCard post={post} />}
            />
          )}
        </Container>
      </Section>
    </>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  const categoryName =
    post.categories.length > 0 ? post.categories[0].category.name : null

  return (
    <ContentCard
      href={`/blog/${post.slug}`}
      image={
        post.coverImage ? { src: post.coverImage, alt: post.title } : undefined
      }
      title={cleanBlogTitle(post.title)}
      description={post.excerpt || undefined}
      emptyImageText="No cover image"
      stackedLayout={true}
      disableScrollAnimation={true}
      metadata={
        <div className="flex flex-wrap items-center gap-3">
          <time dateTime={post.publishedAt?.toISOString()}>
            {post.publishedAt?.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
          {categoryName && (
            <>
              <span>•</span>
              <span>{categoryName}</span>
            </>
          )}
        </div>
      }
    />
  )
}
