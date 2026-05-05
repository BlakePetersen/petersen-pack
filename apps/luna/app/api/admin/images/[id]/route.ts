// ABOUTME: Public Image admin PATCH — composed wrapper chain per SEC-07
// ABOUTME: Adds adminAuth gate that was missing pre-migration (Rule 2 — security gap)

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
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
import { logger } from '@/lib/logger'

const imageUpdateSchema = z.object({
  altText: z.string().nullish(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit(
            'image.update',
            withValidation(imageUpdateSchema, async (_req, ctx, body) => {
              try {
                return await prisma.$transaction(async (tx) => {
                  const image = await tx.image.update({
                    where: { id },
                    data: { altText: body.altText || null },
                  })
                  await tx.auditLog.create({
                    data: {
                      actorId: ctx.actorId!,
                      actorRole: ctx.actorRole!,
                      actorEmail: ctx.actorEmail ?? '',
                      action: 'image.update',
                      resourceType: AuditResourceType.GALLERY,
                      resourceId: id,
                      requestId: ctx.requestId,
                      ip: ctx.ip,
                      ua: ctx.ua,
                      metadata: { imageId: id },
                      afterJson: { id: image.id, altText: image.altText },
                    },
                  })
                  return NextResponse.json(image)
                })
              } catch (error) {
                logger.error({ err: error }, 'Failed to update image')
                return NextResponse.json(
                  { error: 'Failed to update image' },
                  { status: 500 }
                )
              }
            })
          )
        )
      )
    )
  )
  return handler(request)
}
