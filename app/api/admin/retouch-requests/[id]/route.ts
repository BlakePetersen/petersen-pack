// ABOUTME: Retouch-request admin PATCH — composed wrapper chain per SEC-07
// ABOUTME: Status updates audited inside $transaction (D-10)

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
import { retouchStatusUpdateSchema } from '@/lib/validations/retouch'
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
            'retouch_request.update',
            withValidation(
              retouchStatusUpdateSchema,
              async (_req, ctx, body) => {
                try {
                  const existing = await prisma.retouchRequest.findUnique({
                    where: { id },
                  })
                  if (!existing) {
                    return NextResponse.json(
                      { error: 'Retouch request not found' },
                      { status: 404 }
                    )
                  }
                  return await prisma.$transaction(async (tx) => {
                    const retouchRequest = await tx.retouchRequest.update({
                      where: { id },
                      data: { status: body.status },
                    })
                    await tx.auditLog.create({
                      data: {
                        actorId: ctx.actorId!,
                        actorRole: ctx.actorRole!,
                        actorEmail: ctx.actorEmail ?? '',
                        action: 'retouch_request.update',
                        resourceType: AuditResourceType.CLIENT_GALLERY,
                        resourceId: id,
                        requestId: ctx.requestId,
                        ip: ctx.ip,
                        ua: ctx.ua,
                        metadata: { clientImageId: existing.clientImageId },
                        beforeJson: { status: existing.status },
                        afterJson: { status: retouchRequest.status },
                      },
                    })
                    return NextResponse.json({ success: true, retouchRequest })
                  })
                } catch (error) {
                  logger.error({ err: error }, 'Error updating retouch request')
                  return NextResponse.json(
                    { error: 'Failed to update retouch request' },
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
