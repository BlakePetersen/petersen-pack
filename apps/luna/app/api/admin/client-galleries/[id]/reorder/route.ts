// ABOUTME: Client-gallery image reorder POST — composed wrapper chain per SEC-07
// ABOUTME: All sortOrder updates + audit row inside a single $transaction (D-10)

import { NextResponse, type NextRequest } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import {
  withRateLimit,
  withCsrf,
  withAdminAuth,
  withAudit,
  withValidation,
} from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { AuditResourceType } from '@prisma/client'
import { clientGalleryReorderSchema } from '@/lib/validations/client-galleries'
import { logger } from '@/lib/logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: galleryId } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit(
            'client_gallery.reorder',
            withValidation(
              clientGalleryReorderSchema,
              async (_req, ctx, body) => {
                try {
                  return await prisma.$transaction(async (tx) => {
                    for (let i = 0; i < body.imageIds.length; i++) {
                      await tx.clientImage.update({
                        where: {
                          id: body.imageIds[i],
                          clientGalleryId: galleryId,
                        },
                        data: { sortOrder: i },
                      })
                    }
                    await tx.auditLog.create({
                      data: {
                        actorId: ctx.actorId!,
                        actorRole: ctx.actorRole!,
                        actorEmail: ctx.actorEmail ?? '',
                        action: 'client_gallery.reorder',
                        resourceType: AuditResourceType.CLIENT_GALLERY,
                        resourceId: galleryId,
                        requestId: ctx.requestId,
                        ip: ctx.ip,
                        ua: ctx.ua,
                        metadata: {
                          imageCount: body.imageIds.length,
                        },
                        afterJson: { imageIds: body.imageIds },
                      },
                    })
                    return NextResponse.json({ success: true })
                  })
                } catch (error) {
                  logger.error({ err: error }, 'Error reordering images')
                  return NextResponse.json(
                    { error: 'Failed to reorder images' },
                    { status: 500 }
                  )
                }
              }
            )
          )
        )
      )
    )
  )
  return handler(request)
}
