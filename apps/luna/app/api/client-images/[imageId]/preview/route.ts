// ABOUTME: API route for serving watermarked preview images
// ABOUTME: Only accessible before final payment is completed

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateWatermarkedPreview } from '@/lib/watermark'
import path from 'path'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageId } = await params

    // Get image with gallery and contract info
    const image = await prisma.clientImage.findUnique({
      where: { id: imageId },
      include: {
        clientGallery: {
          include: {
            client: true,
            contract: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Verify user has access to this gallery
    if (
      session.user.role !== 'ADMIN' &&
      image.clientGallery.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // If final payment completed, redirect to full-res download
    if (image.clientGallery.finalPaymentStatus === 'COMPLETED') {
      return NextResponse.redirect(
        new URL(`/api/client-images/${imageId}/download`, request.url)
      )
    }

    // Generate watermarked preview
    const imagePath = path.join(process.cwd(), 'public', image.url)
    const normalizedPath = path.normalize(imagePath)
    const publicDir = path.join(process.cwd(), 'public')

    // Prevent path traversal attacks
    if (!normalizedPath.startsWith(publicDir)) {
      return NextResponse.json({ error: 'Invalid image path' }, { status: 400 })
    }

    const clientName =
      image.clientGallery.client.name || image.clientGallery.client.email

    const watermarkedBuffer = await generateWatermarkedPreview(
      normalizedPath,
      clientName
    )

    // Return watermarked image
    return new NextResponse(watermarkedBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    logger.error({ err: error }, 'Preview generation error')
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    )
  }
}
