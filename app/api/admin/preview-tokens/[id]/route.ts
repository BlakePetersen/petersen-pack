// ABOUTME: Preview-token admin DELETE — composed wrapper chain per SEC-07
// ABOUTME: Audit row written inside handler's $transaction (D-10); revokes preview access

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
          withAudit('preview_token.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.previewToken.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Preview token not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.previewToken.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'preview_token.delete',
                    resourceType: AuditResourceType.PREVIEW_TOKEN,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      resourceType: existing.resourceType,
                      resourceId: existing.resourceId,
                    },
                    beforeJson: {
                      id: existing.id,
                      resourceType: existing.resourceType,
                      resourceId: existing.resourceId,
                      expiresAt: existing.expiresAt.toISOString(),
                    },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Failed to delete preview token')
              return NextResponse.json(
                { error: 'Failed to delete preview token' },
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
