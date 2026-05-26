// ABOUTME: API route for downloading client images with quota enforcement
// ABOUTME: Implements security checks, payment verification, and file size limits

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ imageId: string }> }
) {
  try {
    // Authentication check
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageId } = await segmentData.params

    // Fetch image with gallery, client, and contract
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

    // Security check: Verify user has access (admin OR gallery owner)
    if (
      session.user.role !== 'ADMIN' &&
      image.clientGallery.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check final payment status (only for non-admin users)
    if (session.user.role !== 'ADMIN') {
      if (image.clientGallery.finalPaymentStatus !== 'COMPLETED') {
        return NextResponse.json(
          { error: 'Final payment required before downloading images' },
          { status: 403 }
        )
      }

      // Check download quota
      if (!image.clientGallery.contract) {
        return NextResponse.json(
          { error: 'Gallery has no contract' },
          { status: 400 }
        )
      }

      if (
        image.clientGallery.downloadQuotaUsed >=
        image.clientGallery.contract.downloadQuota
      ) {
        return NextResponse.json(
          {
            error:
              'Download quota exhausted. Please contact your photographer.',
          },
          { status: 403 }
        )
      }
    }

    // Path traversal prevention
    const imagePath = path.join(process.cwd(), 'public', image.url)
    const normalizedPath = path.normalize(imagePath)
    const publicDir = path.join(process.cwd(), 'public')

    if (!normalizedPath.startsWith(publicDir)) {
      return NextResponse.json({ error: 'Invalid image path' }, { status: 400 })
    }

    // Read image from filesystem
    let imageBuffer: Buffer
    try {
      imageBuffer = await readFile(normalizedPath)
    } catch (error) {
      logger.error({ err: error }, 'Error reading image file')
      return NextResponse.json(
        { error: 'Image file not found' },
        { status: 404 }
      )
    }

    // Apply max file size limit if specified in contract
    if (
      image.clientGallery.contract?.maxFileSizePx &&
      image.clientGallery.contract.maxFileSizePx > 0
    ) {
      const maxSize = image.clientGallery.contract.maxFileSizePx

      // Resize image to max dimensions while maintaining aspect ratio
      imageBuffer = await sharp(imageBuffer)
        .resize(maxSize, maxSize, {
          fit: 'inside',
          withoutEnlargement: false,
        })
        .jpeg({ quality: 95 })
        .toBuffer()
    }

    // Increment download quota (only for non-admin users)
    if (session.user.role !== 'ADMIN') {
      await prisma.clientGallery.update({
        where: { id: image.clientGallery.id },
        data: {
          downloadQuotaUsed: {
            increment: 1,
          },
        },
      })
    }

    // Return image with proper headers
    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="image-${imageId}.jpg"`,
        'Cache-Control': 'private, no-cache',
      },
    })
  } catch (error) {
    logger.error({ err: error }, 'Download error')
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 }
    )
  }
}
