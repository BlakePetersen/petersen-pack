// ABOUTME: Blog tag page showing posts filtered by tag
// ABOUTME: Displays all posts with a specific tag

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60

// Generate static params for all tags at build time
export async function generateStaticParams() {
  const tags = await prisma.blogTag.findMany({
    select: { slug: true },
  })
  return tags.map((tag) => ({ slug: tag.slug }))
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
  const tag = await prisma.blogTag.findUnique({
    where: { slug },
  })

  if (!tag) {
    return {
      title: 'Tag Not Found',
    }
  }

  return {
    title: `#${tag.name} | Blog | Ashley Petersen Photography`,
    description: `Browse all posts tagged with ${tag.name}`,
  }
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const tag = await prisma.blogTag.findUnique({
    where: { slug },
  })

  if (!tag) {
    notFound()
  }

  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      tags: {
        some: {
          tag: {
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
        title={`#${tag.name}`}
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
