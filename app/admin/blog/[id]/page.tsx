// ABOUTME: Edit existing blog post page
// ABOUTME: Form interface for editing a blog post with image management

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

const BlogPostForm = dynamic(
  () => import('@/components/sol/admin/BlogPostForm'),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-10 rounded bg-gray-200" />
        <div className="h-32 rounded bg-gray-200" />
        <div className="h-10 rounded bg-gray-200" />
      </div>
    ),
  }
)

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const post = await prisma.blogPost.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/blog"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Blog Posts
          </Link>
          {post.published && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              View Post
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          )}
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Edit Blog Post
        </h1>
        <p className="mt-2 text-gray-600">{post.title}</p>
      </div>

      <div className="rounded-lg bg-white p-gutter shadow">
        <BlogPostForm post={post} />
      </div>

      {post.images.length > 0 && (
        <div className="mt-8 rounded-lg bg-white p-gutter shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Post Images ({post.images.length})
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {post.images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
              >
                <img
                  src={image.url}
                  alt={image.altText || 'Blog post image'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
