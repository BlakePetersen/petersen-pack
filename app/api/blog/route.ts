// ABOUTME: API route for creating blog posts
// ABOUTME: Handles POST requests to create new blog post records with categories and tags

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      coverFocalX,
      coverFocalY,
      published,
      categories,
      tags,
    } = body

    if (!title || !slug || !content) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: title, slug, and content are required',
        },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.blogPost.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists' },
        { status: 400 }
      )
    }

    // Create or find categories
    const categoryData = Array.isArray(categories)
      ? await Promise.all(
          categories.map(async (categoryName: string) => {
            const categorySlug = slugify(categoryName)
            const category = await prisma.blogCategory.upsert({
              where: { slug: categorySlug },
              update: {},
              create: {
                name: categoryName,
                slug: categorySlug,
              },
            })
            return { categoryId: category.id }
          })
        )
      : []

    // Create or find tags
    const tagData = Array.isArray(tags)
      ? await Promise.all(
          tags.map(async (tagName: string) => {
            const tagSlug = slugify(tagName)
            const tag = await prisma.blogTag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: {
                name: tagName,
                slug: tagSlug,
              },
            })
            return { tagId: tag.id }
          })
        )
      : []

    // Create the blog post
    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        coverFocalX: coverFocalX ?? 0.5,
        coverFocalY: coverFocalY ?? 0.5,
        published: published || false,
        publishedAt: published ? new Date() : null,
        categories: {
          create: categoryData,
        },
        tags: {
          create: tagData,
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
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, 'Error creating blog post')
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
