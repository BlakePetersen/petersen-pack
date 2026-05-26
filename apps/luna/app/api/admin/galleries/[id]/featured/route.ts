// ABOUTME: Gallery featured-toggle PATCH — composed wrapper chain per SEC-07
// ABOUTME: Inline schema; audit inside $transaction (D-10)

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

const featuredSchema = z.object({ featured: z.boolean() })

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
            'gallery.featured',
            withValidation(featuredSchema, async (_req, ctx, body) => {
              try {
                return await prisma.$transaction(async (tx) => {
                  const gallery = await tx.gallery.update({
                    where: { id },
                    data: { featured: body.featured },
                  })
                  await tx.auditLog.create({
                    data: {
                      actorId: ctx.actorId!,
                      actorRole: ctx.actorRole!,
                      actorEmail: ctx.actorEmail ?? '',
                      action: 'gallery.featured',
                      resourceType: AuditResourceType.GALLERY,
                      resourceId: id,
                      requestId: ctx.requestId,
                      ip: ctx.ip,
                      ua: ctx.ua,
                      metadata: { featured: body.featured },
                      afterJson: { featured: gallery.featured },
                    },
                  })
                  return NextResponse.json(gallery)
                })
              } catch (error) {
                logger.error({ err: error }, 'Failed to update featured status')
                return NextResponse.json(
                  { error: 'Failed to update featured status' },
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
