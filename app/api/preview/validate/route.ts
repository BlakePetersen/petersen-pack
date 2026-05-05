// ABOUTME: Public API for validating preview tokens — honors SEC-06 revocation
// ABOUTME: Returns resource info if token is valid; revoked rows surface as 404

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const previewToken = await prisma.previewToken.findUnique({
      where: { token },
    })

    if (!previewToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    // SEC-06: revoked tokens are indistinguishable from invalid tokens to the
    // caller. 404 (not 410) keeps the UI behavior identical so attackers can't
    // probe for previously-existed tokens.
    if (previewToken.revokedAt !== null) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    if (previewToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 410 })
    }

    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
    }
    return NextResponse.json(
      {
        resourceType: previewToken.resourceType,
        resourceId: previewToken.resourceId,
        expiresAt: previewToken.expiresAt,
      },
      { headers }
    )
  } catch (error) {
    logger.error({ err: error }, 'Failed to validate preview token')
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}
