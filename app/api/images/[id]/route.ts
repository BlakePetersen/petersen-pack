// ABOUTME: Image update API endpoint
// ABOUTME: Handles updating crop and focal point data for existing images

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

type Context = {
  params: Promise<{
    id: string
  }>
}

function validateCropValue(
  value: number | undefined,
  fieldName: string
): number | undefined {
  if (value === undefined) return undefined
  if (isNaN(value) || value < 0 || value > 1) {
    throw new Error(`${fieldName} must be between 0 and 1`)
  }
  return value
}

export async function PATCH(request: NextRequest, context: Context) {
  const params = await context.params
  const { id } = params

  // Verify admin session
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const imageType = searchParams.get('type')

  if (
    !imageType ||
    !['gallery', 'service', 'blog', 'hero', 'standalone'].includes(imageType)
  ) {
    return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const {
      focalX,
      focalY,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      cropAspectRatio,
      flipHorizontal,
      flipVertical,
    } = body

    logger.info({ body }, '[API] Received body')
    logger.info(
      { cropAspectRatio, type: typeof cropAspectRatio },
      '[API] cropAspectRatio value'
    )

    // Validate all crop values
    const validatedData = {
      focalX: validateCropValue(focalX, 'focalX'),
      focalY: validateCropValue(focalY, 'focalY'),
      cropX: validateCropValue(cropX, 'cropX'),
      cropY: validateCropValue(cropY, 'cropY'),
      cropWidth: validateCropValue(cropWidth, 'cropWidth'),
      cropHeight: validateCropValue(cropHeight, 'cropHeight'),
      cropAspectRatio: cropAspectRatio ?? undefined,
      flipHorizontal:
        flipHorizontal !== undefined ? Boolean(flipHorizontal) : undefined,
      flipVertical:
        flipVertical !== undefined ? Boolean(flipVertical) : undefined,
    }

    let updatedImage

    switch (imageType) {
      case 'gallery':
      case 'standalone':
        updatedImage = await prisma.image.update({
          where: { id },
          data: validatedData,
        })
        break

      case 'service':
        updatedImage = await prisma.serviceImage.update({
          where: { id },
          data: validatedData,
        })
        break

      case 'blog':
        updatedImage = await prisma.blogPostImage.update({
          where: { id },
          data: validatedData,
        })
        break

      case 'hero':
        updatedImage = await prisma.heroSlide.update({
          where: { id },
          data: validatedData,
        })
        break
    }

    return NextResponse.json(updatedImage)
  } catch (error) {
    logger.error({ err: error }, 'Error updating image')
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    )
  }
}
