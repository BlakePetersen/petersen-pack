// ABOUTME: Serves watermarked versions of client gallery images
// ABOUTME: Bakes watermark into image data to prevent easy downloading of unwatermarked images

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { logger } from '@/lib/logger'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Find the image
    const image = await prisma.clientImage.findUnique({
      where: { id },
      include: {
        clientGallery: {
          select: {
            clientId: true,
            finalPaymentStatus: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Check authorization - admin or gallery owner
    if (
      session.user.role !== 'ADMIN' &&
      image.clientGallery?.clientId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // If final payment completed, serve original (no watermark needed)
    if (image.clientGallery?.finalPaymentStatus === 'COMPLETED') {
      return NextResponse.redirect(image.url)
    }

    // Fetch original image
    const imageResponse = await fetch(image.url)
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 500 }
      )
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Get image dimensions
    const metadata = await sharp(imageBuffer).metadata()
    const width = metadata.width || 1200
    const height = metadata.height || 800

    // Create watermark SVG - centered logo with text
    const watermarkSize = Math.min(width, height) * 0.5
    const fontSize = watermarkSize * 0.12
    const smallFontSize = fontSize * 0.6

    const watermarkSvg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.5)"/>
          </filter>
        </defs>
        <g transform="translate(${width / 2}, ${height / 2})" opacity="0.15" filter="url(#shadow)">
          <!-- Luna Logo - Crescent moon with sun rays -->
          <g transform="translate(0, ${-watermarkSize * 0.3}) scale(${watermarkSize / 100})">
            <!-- Crescent moon -->
            <path d="M 0 -25 A 15 15 0 1 1 0 25 A 13 25 0 0 0 0 -25 Z" fill="white"/>
            <!-- Sun rays -->
            <line x1="0" y1="-48" x2="0" y2="-25" stroke="white" stroke-width="5" stroke-linecap="round"/>
            <line x1="26" y1="-26" x2="18" y2="-18" stroke="white" stroke-width="4" stroke-linecap="round"/>
            <line x1="33" y1="0" x2="25" y2="0" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <line x1="26" y1="26" x2="18" y2="18" stroke="white" stroke-width="4" stroke-linecap="round"/>
            <line x1="0" y1="25" x2="0" y2="48" stroke="white" stroke-width="5" stroke-linecap="round"/>
            <line x1="-26" y1="26" x2="-18" y2="18" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <line x1="-33" y1="0" x2="-25" y2="0" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <line x1="-26" y1="-26" x2="-18" y2="-18" stroke="white" stroke-width="4" stroke-linecap="round"/>
          </g>
          <!-- Text -->
          <text
            x="0"
            y="${watermarkSize * 0.35}"
            text-anchor="middle"
            font-family="Arial, sans-serif"
            font-size="${smallFontSize}"
            font-weight="500"
            letter-spacing="3"
            fill="white"
          >ASHLEY PETERSEN</text>
          <text
            x="0"
            y="${watermarkSize * 0.35 + fontSize * 1.2}"
            text-anchor="middle"
            font-family="Georgia, serif"
            font-size="${fontSize}"
            letter-spacing="4"
            fill="white"
          >Photography</text>
        </g>
      </svg>
    `

    // Composite watermark onto image
    const watermarkedBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          gravity: 'center',
        },
      ])
      .webp({ quality: 80 })
      .toBuffer()

    return new NextResponse(new Uint8Array(watermarkedBuffer), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    logger.error({ err: error }, 'Error generating watermarked image')
    return NextResponse.json(
      { error: 'Failed to generate watermarked image' },
      { status: 500 }
    )
  }
}
