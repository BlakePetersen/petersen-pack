// ABOUTME: Individual blog post page
// ABOUTME: Displays full blog post content with images, categories, and tags

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import GlobalFooter from '@/components/commons/GlobalFooter'
import BlogPostContent from './BlogPostContent'
import BlogPostHero from './BlogPostHero'
import {
  BlogPostStructuredData,
  BreadcrumbStructuredData,
} from '@/components/luna/StructuredData'
import BlogPostViewTracker from '@/components/luna/BlogPostViewTracker'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { Metadata } from 'next'

// Revalidate every 60 seconds for ISR
export const revalidate = 60

// Generate static params for all published blog posts at build time
export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  })

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const description = post.excerpt || post.content.substring(0, 160)
  const publishedTime = post.publishedAt?.toISOString()
  const modifiedTime = post.updatedAt.toISOString()
  const categories = post.categories.map((c) => c.category.name)

  return {
    title: post.title,
    description,
    keywords: categories,
    authors: [{ name: 'Ashley Petersen' }],
    openGraph: {
      type: 'article',
      url: `https://ashleypetersen.com/blog/${slug}`,
      title: post.title,
      description,
      publishedTime,
      modifiedTime,
      authors: ['Ashley Petersen'],
      tags: categories,
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'

  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: {
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
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
        select: {
          id: true,
          url: true,
          altText: true,
          sortOrder: true,
          width: true,
          height: true,
        },
      },
    },
  })

  if (!post) {
    notFound()
  }

  // Get related posts based on shared categories
  const categoryIds = post.categories.map((c) => c.categoryId)
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      published: true,
      id: { not: post.id },
      categories: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
    },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 3,
  })

  const htmlContent = await marked(post.content)
  const categories = post.categories.map((c) => c.category.name)
  const postUrl = `https://ashleypetersen.com/blog/${slug}`

  return (
    <div className="relative min-h-screen">
      <BlogPostViewTracker postTitle={post.title} />
      <BlogPostStructuredData
        title={post.title}
        description={post.excerpt || post.content.substring(0, 160)}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        coverImage={post.coverImage}
        url={postUrl}
        categories={categories}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: 'https://ashleypetersen.com' },
          { name: 'Blog', url: 'https://ashleypetersen.com/blog' },
          { name: post.title, url: postUrl },
        ]}
      />

      <BlogPostHero
        title={post.title}
        coverImage={post.coverImage}
        coverFocalX={post.coverFocalX}
        coverFocalY={post.coverFocalY}
        publishedAt={post.publishedAt}
        imageCount={post.images.length}
        categories={post.categories}
        editUrl={isAdmin ? `/admin/blog/${post.id}` : undefined}
      />

      {/* Article Content */}
      <article className="px-6 pb-16 pt-12 md:pb-20">
        {/* Client-side interactive content */}
        <BlogPostContent
          post={post}
          relatedPosts={relatedPosts}
          htmlContent={htmlContent}
        />
      </article>

      <GlobalFooter />
    </div>
  )
}
