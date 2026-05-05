// ABOUTME: API route for submitting a client gallery
// ABOUTME: Updates gallery status to PENDING and sets submittedAt timestamp

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { galleryId } = await params

    const existingGallery = await prisma.clientGallery.findUnique({
      where: { id: galleryId },
      include: { client: true },
    })

    if (!existingGallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (
      session.user.role !== 'ADMIN' &&
      existingGallery.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const gallery = await prisma.clientGallery.update({
      where: { id: galleryId },
      data: {
        status: 'PENDING',
        submittedAt: new Date(),
      },
    })

    return NextResponse.json(gallery)
  } catch (error) {
    logger.error({ err: error }, 'Error submitting client gallery')
    return NextResponse.json(
      { error: 'Failed to submit gallery' },
      { status: 500 }
    )
  }
}
