// ABOUTME: Blog category page showing posts filtered by category
// ABOUTME: Displays all posts in a specific category

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60

// Generate static params for all categories at build time
export async function generateStaticParams() {
  const categories = await prisma.blogCategory.findMany({
    select: { slug: true },
  })
  return categories.map((category) => ({ slug: category.slug }))
}

import GlobalFooter from '@/components/commons/GlobalFooter'
import { PageHeader, Container, CtaSection } from '@/components/commons'
import BlogGrid from '@/components/luna/BlogGrid'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.blogCategory.findUnique({
    where: { slug },
  })

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.name} | Blog | Ashley Petersen Photography`,
    description: category.description || `Browse all ${category.name} posts`,
  }
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const category = await prisma.blogCategory.findUnique({
    where: { slug },
  })

  if (!category) {
    notFound()
  }

  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      categories: {
        some: {
          category: {
            slug,
          },
        },
      },
    },
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
      _count: {
        select: { images: true },
      },
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })

  const categories = await prisma.blogCategory.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: {
                published: true,
              },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const tags = await prisma.blogTag.findMany({
    include: {
      _count: {
        select: {
          posts: {
            where: {
              post: {
                published: true,
              },
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  const categoriesWithPosts = categories.filter((cat) => cat._count.posts > 0)
  const tagsWithPosts = tags.filter((tag) => tag._count.posts > 0)

  return (
    <>
      <PageHeader
        title={category.name}
        breadcrumb={[{ label: 'Blog', href: '/blog' }]}
      />

      <section className="px-gutter pt-20">
        <Suspense fallback={null}>
          <BlogGrid
            posts={posts}
            categories={categoriesWithPosts}
            tags={tagsWithPosts}
          />
        </Suspense>
      </section>

      <CtaSection
        title="Like what you see?"
        description="Let's create beautiful images together. Book a session and bring your vision to life."
        buttonText="Book a Session"
        buttonHref="/book"
      />

      <GlobalFooter />
    </>
  )
}
