// ABOUTME: Gallery extend POST — composed wrapper chain per SEC-07
// ABOUTME: Inline schema (long-tail; TYP-05 will move to lib/validations); audit inside $transaction

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

const extendSchema = z.object({
  days: z.coerce.number().int().min(1, 'Days must be positive number'),
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
            'client_gallery.extend',
            withValidation(extendSchema, async (_req, ctx, body) => {
              try {
                const gallery = await prisma.clientGallery.findUnique({
                  where: { id },
                })
                if (!gallery) {
                  return NextResponse.json(
                    { error: 'Gallery not found' },
                    { status: 404 }
                  )
                }
                const currentExpiration = gallery.expiresAt || new Date()
                const newExpiration = new Date(currentExpiration)
                newExpiration.setDate(newExpiration.getDate() + body.days)

                return await prisma.$transaction(async (tx) => {
                  const updated = await tx.clientGallery.update({
                    where: { id },
                    data: { expiresAt: newExpiration },
                  })
                  await tx.auditLog.create({
                    data: {
                      actorId: ctx.actorId!,
                      actorRole: ctx.actorRole!,
                      actorEmail: ctx.actorEmail ?? '',
                      action: 'client_gallery.extend',
                      resourceType: AuditResourceType.CLIENT_GALLERY,
                      resourceId: id,
                      requestId: ctx.requestId,
                      ip: ctx.ip,
                      ua: ctx.ua,
                      metadata: { extendDays: body.days },
                      beforeJson: {
                        expiresAt: gallery.expiresAt?.toISOString() ?? null,
                      },
                      afterJson: {
                        expiresAt: updated.expiresAt?.toISOString() ?? null,
                      },
                    },
                  })
                  return NextResponse.json(updated)
                })
              } catch (error) {
                logger.error({ err: error }, 'Extension error')
                return NextResponse.json(
                  { error: 'Failed to extend gallery' },
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
