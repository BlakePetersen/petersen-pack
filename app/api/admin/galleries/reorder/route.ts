// ABOUTME: Gallery list reorder POST — composed wrapper chain per SEC-07
// ABOUTME: All sortOrder updates + audit row inside one $transaction (D-10)

import { NextResponse } from 'next/server'
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

const galleryReorderSchema = z.object({
  galleryOrders: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.coerce.number().int().min(0),
      })
    )
    .min(1),
})

export const POST = withRequestContext(
  withRateLimit(
    'admin',
    withCsrf(
      withAdminAuth(
        withAudit(
          'gallery.list_reorder',
          withValidation(galleryReorderSchema, async (_req, ctx, body) => {
            try {
              return await prisma.$transaction(async (tx) => {
                for (const order of body.galleryOrders) {
                  await tx.gallery.update({
                    where: { id: order.id },
                    data: { sortOrder: order.sortOrder },
                  })
                }
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'gallery.list_reorder',
                    resourceType: AuditResourceType.GALLERY,
                    resourceId: 'list',
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { galleryCount: body.galleryOrders.length },
                    afterJson: { galleryOrders: body.galleryOrders },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Failed to reorder galleries')
              return NextResponse.json(
                { error: 'Failed to reorder galleries' },
                { status: 500 }
              )
            }
          })
        )
      )
    )
  )
)
