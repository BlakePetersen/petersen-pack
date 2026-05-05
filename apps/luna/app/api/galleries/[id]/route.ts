// ABOUTME: API endpoint for individual gallery operations
// ABOUTME: Supports GET for fetching and PUT for updating gallery metadata

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logger } from '@/lib/logger'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const gallery = await prisma.gallery.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { images: true },
        },
      },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    return NextResponse.json(gallery)
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch gallery')
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    )
  }
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
    const { title, slug, description, featured } = body

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists (excluding current gallery)
    const existing = await prisma.gallery.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A gallery with this slug already exists' },
        { status: 400 }
      )
    }

    const gallery = await prisma.gallery.update({
      where: { id },
      data: {
        title,
        slug,
        description: description || null,
        featured: featured ?? false,
      },
    })

    return NextResponse.json(gallery)
  } catch (error) {
    logger.error({ err: error }, 'Failed to update gallery')
    return NextResponse.json(
      { error: 'Failed to update gallery' },
      { status: 500 }
    )
  }
}
