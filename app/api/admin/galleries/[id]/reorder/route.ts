// ABOUTME: Gallery image reorder POST — composed wrapper chain per SEC-07
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

const reorderSchema = z.object({
  imageOrders: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.coerce.number().int().min(0),
      })
    )
    .min(1),
})

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
          withAudit(
            'gallery.reorder',
            withValidation(reorderSchema, async (_req, ctx, body) => {
              try {
                return await prisma.$transaction(async (tx) => {
                  for (const order of body.imageOrders) {
                    await tx.image.update({
                      where: { id: order.id },
                      data: { sortOrder: order.sortOrder },
                    })
                  }
                  await tx.auditLog.create({
                    data: {
                      actorId: ctx.actorId!,
                      actorRole: ctx.actorRole!,
                      actorEmail: ctx.actorEmail ?? '',
                      action: 'gallery.reorder',
                      resourceType: AuditResourceType.GALLERY,
                      resourceId: id,
                      requestId: ctx.requestId,
                      ip: ctx.ip,
                      ua: ctx.ua,
                      metadata: { imageCount: body.imageOrders.length },
                      afterJson: { imageOrders: body.imageOrders },
                    },
                  })
                  return NextResponse.json({ success: true })
                })
              } catch (error) {
                logger.error({ err: error }, 'Failed to reorder images')
                return NextResponse.json(
                  { error: 'Failed to reorder images' },
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
