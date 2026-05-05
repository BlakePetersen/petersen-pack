// ABOUTME: API route for submitting gallery change requests
// ABOUTME: Allows clients to request modifications to submitted galleries

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  try {
    const { galleryId } = await params
    const body = await request.json()
    const { requestType, description } = body

    if (!requestType || !description) {
      return NextResponse.json(
        { error: 'Request type and description are required' },
        { status: 400 }
      )
    }

    const changeRequest = await prisma.changeRequest.create({
      data: {
        clientGalleryId: galleryId,
        requestType,
        description,
      },
    })

    return NextResponse.json(changeRequest)
  } catch (error) {
    logger.error({ err: error }, 'Error creating change request')
    return NextResponse.json(
      { error: 'Failed to create change request' },
      { status: 500 }
    )
  }
}
