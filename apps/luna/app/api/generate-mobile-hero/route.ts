// ABOUTME: API endpoint for generating mobile hero images from desktop images
// ABOUTME: Crops desktop image to square based on focal point

import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { imageUrl, focalX, focalY } = data

    if (!imageUrl || focalX === undefined || focalY === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Read the original image from the file system
    const imagePath = join(process.cwd(), 'public', imageUrl)

    if (!existsSync(imagePath)) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Process image with sharp
    const image = sharp(imagePath)
    const metadata = await image.metadata()

    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: 'Could not read image dimensions' },
        { status: 400 }
      )
    }

    // Calculate square crop dimensions
    const size = Math.min(metadata.width, metadata.height)

    // Calculate crop position based on focal point
    // focalX and focalY are 0-1 values
    const focalPixelX = Math.round(focalX * metadata.width)
    const focalPixelY = Math.round(focalY * metadata.height)

    // Center the crop on the focal point
    let left = Math.round(focalPixelX - size / 2)
    let top = Math.round(focalPixelY - size / 2)

    // Ensure crop doesn't go outside image boundaries
    left = Math.max(0, Math.min(left, metadata.width - size))
    top = Math.max(0, Math.min(top, metadata.height - size))

    // Crop to square and resize
    const croppedBuffer = await image
      .extract({
        left,
        top,
        width: size,
        height: size,
      })
      .resize(1080, 1080, {
        fit: 'cover',
        withoutEnlargement: false,
      })
      .webp({ quality: 85 })
      .toBuffer()

    // Generate filename
    const timestamp = Date.now()
    const originalFilename = imageUrl.split('/').pop() || 'image'
    const baseFilename = originalFilename.replace(/\.[^/.]+$/, '')
    const mobileFilename = `${timestamp}-${baseFilename}-mobile.webp`

    // Save to uploads/hero directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'hero')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filepath = join(uploadDir, mobileFilename)
    await writeFile(filepath, croppedBuffer)

    const mobileImageUrl = `/uploads/hero/${mobileFilename}`

    return NextResponse.json({ url: mobileImageUrl }, { status: 201 })
  } catch (error) {
    logger.error({ err: error }, 'Error generating mobile image')
    return NextResponse.json(
      { error: 'Failed to generate mobile image' },
      { status: 500 }
    )
  }
}
