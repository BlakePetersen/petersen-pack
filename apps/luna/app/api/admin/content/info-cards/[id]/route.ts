// ABOUTME: Info-card [id] PUT/DELETE — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10); usage check rejects deletes for in-use cards

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('info_card.update', async (req, ctx) => {
            try {
              const data = await req.json()
              const { title, content, icon, customIconSvg } = data
              return await prisma.$transaction(async (tx) => {
                const card = await tx.infoCard.update({
                  where: { id },
                  data: { title, content, icon, customIconSvg },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'info_card.update',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {},
                    afterJson: { id: card.id, title: card.title },
                  },
                })
                return NextResponse.json(card)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating info card')
              return NextResponse.json(
                { error: 'Failed to update info card' },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('info_card.delete', async (_req, ctx) => {
            try {
              const usage = await prisma.serviceInfoCard.count({
                where: { infoCardId: id },
              })
              if (usage > 0) {
                return NextResponse.json(
                  {
                    error: `Cannot delete card that is used by ${usage} service(s)`,
                  },
                  { status: 400 }
                )
              }
              const existing = await prisma.infoCard.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Info card not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.infoCard.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'info_card.delete',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {},
                    beforeJson: { id: existing.id, title: existing.title },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error deleting info card')
              return NextResponse.json(
                { error: 'Failed to delete info card' },
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
