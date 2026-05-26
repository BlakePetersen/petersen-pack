// ABOUTME: Inquiry admin PATCH — composed wrapper chain per SEC-07
// ABOUTME: Status transition + audit row inside $transaction (D-10)

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
import { inquiryUpdateSchema } from '@/lib/validations/inquiries'
import { logger } from '@/lib/logger'

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
            'inquiry.update',
            withValidation(inquiryUpdateSchema, async (_req, ctx, body) => {
              try {
                const existing = await prisma.inquiry.findUnique({
                  where: { id },
                })
                if (!existing) {
                  return NextResponse.json(
                    { error: 'Inquiry not found' },
                    { status: 404 }
                  )
                }
                return await prisma.$transaction(async (tx) => {
                  const inquiry = await tx.inquiry.update({
                    where: { id },
                    data: { status: body.status },
                  })
                  await tx.auditLog.create({
                    data: {
                      actorId: ctx.actorId!,
                      actorRole: ctx.actorRole!,
                      actorEmail: ctx.actorEmail ?? '',
                      action: 'inquiry.update',
                      resourceType: AuditResourceType.INQUIRY,
                      resourceId: id,
                      requestId: ctx.requestId,
                      ip: ctx.ip,
                      ua: ctx.ua,
                      metadata: { previousStatus: existing.status },
                      beforeJson: { status: existing.status },
                      afterJson: { status: inquiry.status },
                    },
                  })
                  return NextResponse.json(inquiry)
                })
              } catch (error) {
                logger.error({ err: error }, 'Failed to update inquiry')
                return NextResponse.json(
                  { error: 'Failed to update inquiry' },
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
