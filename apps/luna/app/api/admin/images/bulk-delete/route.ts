// ABOUTME: Public Image bulk-delete admin POST — composed wrapper chain per SEC-07
// ABOUTME: Adds adminAuth gate that was missing pre-migration (Rule 2 — security gap)

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

const bulkDeleteSchema = z.object({
  imageIds: z.array(z.string().min(1)).min(1, 'imageIds must not be empty'),
})

export const POST = withRequestContext(
  withRateLimit(
    'admin',
    withCsrf(
      withAdminAuth(
        withAudit(
          'image.bulk_delete',
          withValidation(bulkDeleteSchema, async (_req, ctx, body) => {
            try {
              return await prisma.$transaction(async (tx) => {
                const result = await tx.image.deleteMany({
                  where: { id: { in: body.imageIds } },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'image.bulk_delete',
                    resourceType: AuditResourceType.GALLERY,
                    resourceId: 'bulk',
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      imageIds: body.imageIds,
                      requested: body.imageIds.length,
                      deleted: result.count,
                    },
                  },
                })
                return NextResponse.json({
                  success: true,
                  deletedCount: result.count,
                })
              })
            } catch (error) {
              logger.error({ err: error }, 'Failed to delete images')
              return NextResponse.json(
                { error: 'Failed to delete images' },
                { status: 500 }
              )
            }
          })
        )
      )
    )
  )
)
