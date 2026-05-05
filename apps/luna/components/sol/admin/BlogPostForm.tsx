// ABOUTME: Blog post creation and editing form component
// ABOUTME: Handles blog post content input with categories and tags

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CoverImageEditor } from './CoverImageEditor'
import Image from 'next/image'

interface BlogPostFormProps {
  post?: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: string
    coverImage: string | null
    coverFocalX: number
    coverFocalY: number
    published: boolean
    publishedAt: Date | null
    categories: Array<{ category: { id: string; name: string } }>
    tags: Array<{ tag: { id: string; name: string } }>
    images?: Array<{ id: string; url: string; altText: string | null }>
  }
}

export default function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    coverImage: post?.coverImage || '',
    coverFocalX: post?.coverFocalX ?? 0.5,
    coverFocalY: post?.coverFocalY ?? 0.5,
    published: post?.published || false,
    categories: post?.categories.map((c) => c.category.name).join(', ') || '',
    tags: post?.tags.map((t) => t.tag.name).join(', ') || '',
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: post ? prev.slug : generateSlug(title),
    }))
  }

  const handleDelete = async () => {
    if (!post) return

    if (
      !confirm(
        `Delete "${post.title}"? This will permanently remove the blog post.`
      )
    ) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/blog/${post.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete blog post')
      }

      router.push('/admin/blog')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const url = post ? `/api/blog/${post.id}` : '/api/blog'
      const method = post ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          coverImage: formData.coverImage || null,
          coverFocalX: formData.coverFocalX,
          coverFocalY: formData.coverFocalY,
          categories: formData.categories
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean),
          tags: formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save blog post')
      }

      router.push('/admin/blog')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Post Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="Family // Sunset in the Mount Diablo foothills"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          URL Slug *
        </label>
        <input
          type="text"
          required
          value={formData.slug}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, slug: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="family-sunset-mount-diablo-foothills"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          URL: /blog/{formData.slug || 'slug'}
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Excerpt
        </label>
        <textarea
          value={formData.excerpt}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
          }
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="A brief preview of the post..."
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content *
        </label>
        <textarea
          required
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          rows={15}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="Write your post content here... (Markdown supported)"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Use Markdown formatting for rich text
        </p>
      </div>

      {/* Cover Image with Focal Point */}
      <CoverImageEditor
        imageUrl={formData.coverImage}
        focalX={formData.coverFocalX}
        focalY={formData.coverFocalY}
        onImageChange={(url) =>
          setFormData((prev) => ({ ...prev, coverImage: url }))
        }
        onFocalPointChange={(x, y) =>
          setFormData((prev) => ({ ...prev, coverFocalX: x, coverFocalY: y }))
        }
      />

      {/* Select from Gallery Images */}
      {post?.images && post.images.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Or select from gallery images
          </label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {post.images.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    coverImage: image.url,
                    coverFocalX: 0.5,
                    coverFocalY: 0.5,
                  }))
                }
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                  formData.coverImage === image.url
                    ? 'border-blue-500 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500'
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.altText || 'Gallery image'}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                {formData.coverImage === image.url && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Click an image to use it as the cover, then set the focal point
            above
          </p>
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Categories
        </label>
        <input
          type="text"
          value={formData.categories}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, categories: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="Family, Maternity, Lifestyle"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comma-separated list of categories
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tags
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, tags: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
          placeholder="outdoor, golden hour, walnut creek"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comma-separated list of tags
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="published"
          checked={formData.published}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, published: e.target.checked }))
          }
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
        />
        <label
          htmlFor="published"
          className="ml-2 text-sm text-gray-700 dark:text-gray-300"
        >
          Publish post (make visible on the blog)
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {isSubmitting ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        {post && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="ml-auto rounded-lg border border-red-200 px-6 py-3 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            Delete Post
          </button>
        )}
      </div>
    </form>
  )
}
