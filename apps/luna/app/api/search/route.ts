// ABOUTME: API endpoint for searching blog posts and portfolio galleries
// ABOUTME: Searches across titles, content, categories, tags, and descriptions

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const type = searchParams.get('type') // 'blog', 'portfolio', or 'all'

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = query.trim().toLowerCase()
    const results: {
      blog: any[]
      portfolio: any[]
    } = {
      blog: [],
      portfolio: [],
    }

    // Search blog posts
    if (type === 'blog' || type === 'all' || !type) {
      const blogPosts = await prisma.blogPost.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { excerpt: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } },
            {
              categories: {
                some: {
                  category: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
            {
              tags: {
                some: {
                  tag: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
          ],
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
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 20,
      })

      results.blog = blogPosts.map((post) => ({
        id: post.id,
        type: 'blog',
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        publishedAt: post.publishedAt,
        categories: post.categories.map((c) => c.category.name),
        tags: post.tags.map((t) => t.tag.name),
      }))
    }

    // Search portfolio galleries
    if (type === 'portfolio' || type === 'all' || !type) {
      const galleries = await prisma.gallery.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          images: {
            take: 1,
            orderBy: { sortOrder: 'asc' },
          },
          _count: {
            select: { images: true },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
        take: 20,
      })

      results.portfolio = galleries.map((gallery) => ({
        id: gallery.id,
        type: 'portfolio',
        title: gallery.title,
        slug: gallery.slug,
        description: gallery.description,
        coverImage: gallery.images[0]?.url || null,
        imageCount: gallery._count.images,
      }))
    }

    return NextResponse.json(results)
  } catch (error) {
    logger.error({ err: error }, 'Search error')
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}
