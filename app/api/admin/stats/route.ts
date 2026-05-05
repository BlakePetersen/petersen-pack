// ABOUTME: Admin stats GET — composed wrapper chain per SEC-07
// ABOUTME: Adds adminAuth gate that was missing pre-migration (Rule 2 — security gap)

import { NextResponse } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import { withRateLimit, withAdminAuth } from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const GET = withRequestContext(
  withRateLimit(
    'admin',
    withAdminAuth(async () => {
      try {
        const [galleryCount, imageCount, inquiryCount, bookingCount] =
          await Promise.all([
            prisma.gallery.count(),
            prisma.image.count(),
            prisma.inquiry.count({ where: { status: 'NEW' } }),
            prisma.booking.count({ where: { status: 'PENDING' } }),
          ])

        return NextResponse.json({
          galleryCount,
          imageCount,
          inquiryCount,
          bookingCount,
        })
      } catch (error) {
        logger.error({ err: error }, 'Failed to fetch admin stats')
        return NextResponse.json(
          { error: 'Failed to fetch statistics' },
          { status: 500 }
        )
      }
    })
  )
)
