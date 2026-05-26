// ABOUTME: API route for toggling favorite status on client gallery images
// ABOUTME: Allows clients to mark images as favorites for selection

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  segmentData: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await segmentData.params
    const { isFavorite } = await request.json()

    const image = await prisma.clientImage.update({
      where: { id: imageId },
      data: { isFavorite },
    })

    return NextResponse.json({ success: true, image })
  } catch (error) {
    logger.error({ err: error }, 'Error toggling favorite')
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}
