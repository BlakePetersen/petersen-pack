// ABOUTME: Gallery publish POST — composed wrapper chain per SEC-07
// ABOUTME: Status transition + audit row inside $transaction (D-10)

import { NextResponse, type NextRequest } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import {
  withRateLimit,
  withCsrf,
  withAdminAuth,
  withAudit,
} from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { AuditResourceType } from '@prisma/client'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('gallery.publish', async (_req, ctx) => {
            try {
              const existing = await prisma.gallery.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Gallery not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                const gallery = await tx.gallery.update({
                  where: { id },
                  data: { status: 'PUBLISHED', publishedAt: new Date() },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'gallery.publish',
                    resourceType: AuditResourceType.GALLERY,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { gallerySlug: existing.slug },
                    beforeJson: { status: existing.status },
                    afterJson: {
                      status: gallery.status,
                      publishedAt: gallery.publishedAt?.toISOString() ?? null,
                    },
                  },
                })
                return NextResponse.json(gallery)
              })
            } catch (error) {
              logger.error({ err: error }, 'Failed to publish gallery')
              return NextResponse.json(
                { error: 'Failed to publish gallery' },
                { status: 500 }
              )
            }
          })
        )
      )
    )
  )
  return handler(request)
}
