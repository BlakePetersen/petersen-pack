// ABOUTME: FAQ view-count POST — DEVIATION: misnamed admin route, actually public
// ABOUTME: No withAdminAuth/withCsrf/withAudit — unauthenticated public users hit this to track views

import { NextResponse, type NextRequest } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import { withRateLimit } from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit('anon', async () => {
      try {
        await prisma.faq.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        })
        return NextResponse.json({ success: true })
      } catch (error) {
        logger.error({ err: error }, 'Error incrementing view count')
        return NextResponse.json(
          { error: 'Failed to track view' },
          { status: 500 }
        )
      }
    })
  )
  return handler(request)
}
