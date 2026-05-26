// ABOUTME: Info-card make-global POST — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10)

import { NextResponse, type NextRequest } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import {
  withRateLimit,
  withCsrf,
  withAdminAuth,
  withAudit,
} from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { AuditResourceType } from '@prisma/client'
import { logger } from '@/lib/logger'

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
          withAudit('info_card.make_global', async (_req, ctx) => {
            try {
              return await prisma.$transaction(async (tx) => {
                const card = await tx.infoCard.update({
                  where: { id },
                  data: { isGlobal: true, serviceId: null },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'info_card.make_global',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {},
                    afterJson: { id: card.id, isGlobal: true },
                  },
                })
                return NextResponse.json(card)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error making card global')
              return NextResponse.json(
                { error: 'Failed to make card global' },
                { status: 500 }
              )
            }
          })
        )
      )
    )
  )
  return handler(request)
}
