// ABOUTME: Retouch-request status PATCH — composed wrapper chain per SEC-07
// ABOUTME: Status transition + resolution data update + audit row inside $transaction (D-10)

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
            'retouch_request.set_status',
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

                  const updateData: Record<string, unknown> = {
                    status: body.status,
                  }
                  if (body.status === 'PENDING') {
                    updateData.resolvedAt = null
                    updateData.resolvedById = null
                    updateData.retouchedImageUrl = null
                  }
                  if (
                    body.status === 'COMPLETED' ||
                    body.status === 'DECLINED'
                  ) {
                    updateData.resolvedAt = new Date()
                    updateData.resolvedById = ctx.actorId!
                  }

                  return await prisma.$transaction(async (tx) => {
                    const retouchRequest = await tx.retouchRequest.update({
                      where: { id },
                      data: updateData,
                    })
                    await tx.auditLog.create({
                      data: {
                        actorId: ctx.actorId!,
                        actorRole: ctx.actorRole!,
                        actorEmail: ctx.actorEmail ?? '',
                        action: 'retouch_request.set_status',
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
                    return NextResponse.json(retouchRequest)
                  })
                } catch (error) {
                  logger.error(
                    { err: error },
                    'Error updating retouch request status'
                  )
                  return NextResponse.json(
                    { error: 'Failed to update retouch request status' },
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
