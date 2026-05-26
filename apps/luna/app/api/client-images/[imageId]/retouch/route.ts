// ABOUTME: API route for creating retouch requests on client gallery images
// ABOUTME: Allows clients to request professional retouching on specific images

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params
    const { clientGalleryId, notes } = await request.json()

    //Check if retouch request already exists for this image
    const existingRequest = await prisma.retouchRequest.findFirst({
      where: {
        clientImageId: imageId,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'A retouch request already exists for this image' },
        { status: 400 }
      )
    }

    const retouchRequest = await prisma.retouchRequest.create({
      data: {
        clientImageId: imageId,
        clientGalleryId,
        notes,
      },
    })

    return NextResponse.json({ success: true, retouchRequest })
  } catch (error) {
    logger.error({ err: error }, 'Error creating retouch request')
    return NextResponse.json(
      { error: 'Failed to create retouch request' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params

    const retouchRequests = await prisma.retouchRequest.findMany({
      where: { clientImageId: imageId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ retouchRequests })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching retouch requests')
    return NextResponse.json(
      { error: 'Failed to fetch retouch requests' },
      { status: 500 }
    )
  }
}
