// ABOUTME: Create new blog post page
// ABOUTME: Form interface for creating a new blog post

import BlogPostForm from '@/components/sol/admin/BlogPostForm'
import Link from 'next/link'

export default function NewBlogPostPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Blog Posts
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Create New Blog Post
        </h1>
      </div>

      <div className="rounded-lg bg-white p-gutter shadow">
        <BlogPostForm />
      </div>
    </div>
  )
}
