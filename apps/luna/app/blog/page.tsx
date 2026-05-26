// ABOUTME: Blog listing page showing all published posts
// ABOUTME: Displays blog posts with categories and filtering

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'

// Revalidate every 60 seconds for ISR
export const revalidate = 60
import GlobalFooter from '@/components/commons/GlobalFooter'
import { CtaSection } from '@/components/commons'
import BlogGrid from '@/components/luna/BlogGrid'
import { SectionNavigator } from '@/components/luna/SectionNavigator'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Ashley Petersen Photography',
  description:
    'Photography stories, session highlights, and behind-the-scenes from Ashley Petersen Photography in the East Bay and San Francisco.',
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
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

  // Filter out categories and tags with no posts
  const categoriesWithPosts = categories.filter((cat) => cat._count.posts > 0)
  const tagsWithPosts = tags.filter((tag) => tag._count.posts > 0)

  return (
    <>
      <SectionNavigator title="Blog" />

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
