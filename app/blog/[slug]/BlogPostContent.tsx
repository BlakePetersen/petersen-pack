// ABOUTME: Client component for blog post interactive content
// ABOUTME: Handles image gallery, social sharing, and related posts display

'use client'

import { useState } from 'react'
import SocialShare from '@/components/luna/SocialShare'
import RelatedPosts from '@/components/luna/RelatedPosts'
import GalleryGrid from '@/components/commons/GalleryGrid'
import Link from 'next/link'

type BlogImage = {
  id: string
  url: string
  altText: string | null
  sortOrder: number
  width: number | null
  height: number | null
}

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  publishedAt: Date | null
  categories: Array<{
    categoryId: string
    category: {
      id: string
      name: string
      slug: string
    }
  }>
  tags: Array<{
    tagId: string
    tag: {
      id: string
      name: string
      slug: string
    }
  }>
  images: BlogImage[]
}

type RelatedPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: Date | null
  categories: Array<{
    category: {
      name: string
      slug: string
    }
  }>
}

type BlogPostContentProps = {
  post: BlogPost
  relatedPosts: RelatedPost[]
  htmlContent: string
}

export default function BlogPostContent({
  post,
  relatedPosts,
  htmlContent,
}: BlogPostContentProps) {
  const [currentUrl, setCurrentUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.href
    }
    return ''
  })

  // Transform blog images to match GalleryGrid format
  const galleryImages = post.images.map((image) => ({
    id: image.id,
    url: image.url,
    altText: image.altText,
    width: image.width || 800,
    height: image.height || 600,
  }))

  return (
    <>
      {/* Article prose */}
      <div className="mx-auto max-w-[780px]">
        <div
          className="prose prose-lg prose-gray max-w-none dark:prose-invert prose-headings:mt-12 prose-headings:font-serif prose-headings:font-normal prose-p:leading-[1.9] prose-p:text-gray-700 first-of-type:prose-p:first-letter:float-left first-of-type:prose-p:first-letter:mr-3 first-of-type:prose-p:first-letter:mt-1 first-of-type:prose-p:first-letter:font-serif first-of-type:prose-p:first-letter:text-6xl first-of-type:prose-p:first-letter:font-bold first-of-type:prose-p:first-letter:text-gray-900 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-primary-300 prose-blockquote:text-xl prose-blockquote:italic prose-img:shadow-md dark:prose-p:text-gray-300 dark:first-of-type:prose-p:first-letter:text-white"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* Post images gallery - breaks out wider */}
      {post.images.length > 0 && (
        <div
          id="gallery"
          className="mx-auto mt-16 max-w-[1229px] scroll-mt-[9rem]"
        >
          <GalleryGrid images={galleryImages} />
        </div>
      )}

      {/* Social sharing - elegant inline */}
      <div className="mx-auto mt-16 max-w-[780px]">
        <div className="border-t border-gray-200 pt-8 dark:border-gray-800">
          <SocialShare
            url={currentUrl}
            title={post.title}
            description={post.excerpt || undefined}
            imageUrl={post.coverImage || undefined}
          />
        </div>

        {/* Back to all posts */}
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            All Posts
          </Link>
        </div>
      </div>

      {/* Related posts - full width section */}
      {relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
    </>
  )
}
