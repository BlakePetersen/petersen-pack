// ABOUTME: API route for creating retouch requests
// ABOUTME: Tracks usage against contract retouch quota

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { galleryId } = await params
    const { imageId, notes } = await request.json()

    // Verify gallery access
    const gallery = await prisma.clientGallery.findUnique({
      where: { id: galleryId },
      include: {
        contract: true,
      },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    if (session.user.role !== 'ADMIN' && gallery.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!gallery.contract) {
      return NextResponse.json(
        { error: 'Gallery not linked to contract' },
        { status: 400 }
      )
    }

    // Count existing retouch requests
    const retouchCount = await prisma.retouchRequest.count({
      where: {
        clientGalleryId: galleryId,
      },
    })

    // Create retouch request
    const retouchRequest = await prisma.retouchRequest.create({
      data: {
        clientImageId: imageId,
        clientGalleryId: galleryId,
        notes: notes,
        status: 'PENDING',
      },
    })

    return NextResponse.json(retouchRequest, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, 'Retouch request error')
    return NextResponse.json(
      { error: 'Failed to create retouch request' },
      { status: 500 }
    )
  }
}
