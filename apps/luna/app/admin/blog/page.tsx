// ABOUTME: Blog post management page for admin
// ABOUTME: Lists all blog posts with create, edit, and delete actions

import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function BlogPostsPage() {
  const posts = await prisma.blogPost.findMany({
    include: {
      _count: {
        select: { images: true, categories: true, tags: true },
      },
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Blog Posts
        </h1>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Create Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg bg-white p-gutter-lg text-center shadow dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            No blog posts yet. Create your first post to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              published={post.published}
              publishedAt={post.publishedAt}
              imageCount={post._count.images}
              categoryCount={post._count.categories}
              tagCount={post._count.tags}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PostCard({
  id,
  title,
  slug,
  excerpt,
  published,
  publishedAt,
  imageCount,
  categoryCount,
  tagCount,
}: {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published: boolean
  publishedAt: Date | null
  imageCount: number
  categoryCount: number
  tagCount: number
}) {
  return (
    <div className="rounded-lg bg-white p-gutter shadow hover:shadow-md dark:bg-gray-800">
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          {published ? (
            <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-100">
              Published
            </span>
          ) : (
            <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              Draft
            </span>
          )}
          {publishedAt && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {excerpt && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {excerpt}
          </p>
        )}
      </div>

      <div className="mb-4 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{imageCount} images</span>
        <span>{categoryCount} categories</span>
        <span>{tagCount} tags</span>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/admin/blog/${id}`}
          className="flex-1 rounded border border-gray-300 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Edit
        </Link>
        {published && (
          <Link
            href={`/blog/${slug}`}
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            target="_blank"
          >
            View
          </Link>
        )}
      </div>
    </div>
  )
}
