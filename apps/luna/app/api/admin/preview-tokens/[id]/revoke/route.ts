// ABOUTME: PreviewToken revocation endpoint (SEC-06) — POST sets revokedAt = now()
// ABOUTME: Composed admin chain; AuditLog row written inside same $transaction (D-10)

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
          withAudit('preview_token.revoke', async (_req, ctx) => {
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

              // Idempotent: if already revoked, return the original revokedAt
              // without flipping the timestamp or writing another audit row.
              // This matches REST PATCH-style semantics (state-set, not delta).
              if (existing.revokedAt !== null) {
                return NextResponse.json({
                  success: true,
                  revokedAt: existing.revokedAt,
                  alreadyRevoked: true,
                })
              }

              return await prisma.$transaction(async (tx) => {
                const updated = await tx.previewToken.update({
                  where: { id },
                  data: { revokedAt: new Date() },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'preview_token.revoke',
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
                      revokedAt: null,
                    },
                    afterJson: {
                      id: updated.id,
                      revokedAt: updated.revokedAt?.toISOString() ?? null,
                    },
                  },
                })
                return NextResponse.json({
                  success: true,
                  revokedAt: updated.revokedAt,
                })
              })
            } catch (error) {
              logger.error({ err: error }, 'Failed to revoke preview token')
              return NextResponse.json(
                { error: 'Failed to revoke preview token' },
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
