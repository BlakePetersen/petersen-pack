// ABOUTME: API route for managing client gallery preferences
// ABOUTME: Handles "don't show again" settings for retouch pricing modal

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { clientGalleryId, userId, hideRetouchModal } = await request.json()

    const preference = await prisma.galleryPreference.upsert({
      where: {
        clientGalleryId_userId: {
          clientGalleryId,
          userId,
        },
      },
      update: {
        hideRetouchModal,
      },
      create: {
        clientGalleryId,
        userId,
        hideRetouchModal,
      },
    })

    return NextResponse.json({ success: true, preference })
  } catch (error) {
    logger.error({ err: error }, 'Error updating gallery preferences')
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientGalleryId = searchParams.get('clientGalleryId')
    const userId = searchParams.get('userId')

    if (!clientGalleryId || !userId) {
      return NextResponse.json(
        { error: 'Missing clientGalleryId or userId' },
        { status: 400 }
      )
    }

    const preference = await prisma.galleryPreference.findUnique({
      where: {
        clientGalleryId_userId: {
          clientGalleryId,
          userId,
        },
      },
    })

    return NextResponse.json({ preference })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching gallery preferences')
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}
