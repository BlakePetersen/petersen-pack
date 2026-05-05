// ABOUTME: Retouch-request decline admin POST — composed wrapper chain per SEC-07
// ABOUTME: No body (action endpoint); audit row inside $transaction (D-10)

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
import { sendRetouchStatusEmail } from '@/lib/email'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

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
          withAudit('retouch_request.decline', async (_req, ctx) => {
            try {
              const retouchRequest = await prisma.retouchRequest.findUnique({
                where: { id },
                include: {
                  clientImage: {
                    include: {
                      clientGallery: { include: { client: true } },
                    },
                  },
                },
              })
              if (!retouchRequest) {
                return NextResponse.json(
                  { error: 'Retouch request not found' },
                  { status: 404 }
                )
              }

              const updatedRequest = await prisma.$transaction(async (tx) => {
                const updated = await tx.retouchRequest.update({
                  where: { id },
                  data: {
                    status: 'DECLINED',
                    resolvedAt: new Date(),
                    resolvedById: ctx.actorId!,
                  },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'retouch_request.decline',
                    resourceType: AuditResourceType.CLIENT_GALLERY,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      clientImageId: retouchRequest.clientImageId,
                    },
                    beforeJson: { status: retouchRequest.status },
                    afterJson: { status: updated.status },
                  },
                })
                return updated
              })

              const gallery = retouchRequest.clientImage.clientGallery
              if (gallery) {
                const baseUrl =
                  env.NEXT_PUBLIC_APP_URL || 'http://localhost:3333'
                await sendRetouchStatusEmail({
                  clientName: gallery.client.name || 'Valued Client',
                  clientEmail: gallery.client.email,
                  galleryTitle: gallery.title,
                  galleryUrl: `${baseUrl}/client/${gallery.slug}`,
                  imageCount: 1,
                  status: 'DECLINED',
                })
              }

              return NextResponse.json(updatedRequest)
            } catch (error) {
              logger.error({ err: error }, 'Retouch decline error')
              return NextResponse.json(
                { error: 'Failed to decline retouch request' },
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
