// ABOUTME: API route for creating galleries
// ABOUTME: Handles POST requests to create new gallery records

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })

    return NextResponse.json(galleries)
  } catch (error) {
    logger.error({ err: error }, 'Error fetching galleries')
    return NextResponse.json(
      { error: 'Failed to fetch galleries' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, slug, description, featured } = body

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.gallery.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A gallery with this slug already exists' },
        { status: 400 }
      )
    }

    const gallery = await prisma.gallery.create({
      data: {
        title,
        slug,
        description: description || null,
        featured: featured || false,
        status: 'DRAFT',
      },
    })

    return NextResponse.json(gallery, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, 'Error creating gallery')
    return NextResponse.json(
      { error: 'Failed to create gallery' },
      { status: 500 }
    )
  }
}
