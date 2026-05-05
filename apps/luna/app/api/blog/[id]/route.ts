// ABOUTME: API route for managing individual blog posts
// ABOUTME: Handles PUT to update and DELETE to remove blog posts with their relationships

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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

    // Check if slug already exists (excluding current post)
    const existing = await prisma.blogPost.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists' },
        { status: 400 }
      )
    }

    // Get current post to check if publishing status changed
    const currentPost = await prisma.blogPost.findUnique({
      where: { id },
    })

    if (!currentPost) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    // Delete existing category and tag relationships
    await prisma.blogPostCategory.deleteMany({
      where: { postId: id },
    })
    await prisma.blogPostTag.deleteMany({
      where: { postId: id },
    })

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

    // Update the blog post
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        coverFocalX: coverFocalX ?? 0.5,
        coverFocalY: coverFocalY ?? 0.5,
        published: published || false,
        publishedAt:
          published && !currentPost.published
            ? new Date()
            : currentPost.publishedAt,
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

    return NextResponse.json(post)
  } catch (error) {
    logger.error({ err: error }, 'Error updating blog post')
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.blogPost.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ err: error }, 'Error deleting blog post')
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
