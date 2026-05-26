// ABOUTME: Preview-token admin CRUD — composed wrapper chain per SEC-07
// ABOUTME: Audit row written inside handler's $transaction (D-10)

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
import { generatePreviewToken, getExpiryDate } from '@/lib/preview-tokens'
import { previewTokenCreateSchema } from '@/lib/validations/preview-tokens'
import { logger } from '@/lib/logger'

export const POST = withRequestContext(
  withRateLimit(
    'admin',
    withCsrf(
      withAdminAuth(
        withAudit(
          'preview_token.create',
          withValidation(previewTokenCreateSchema, async (_req, ctx, body) => {
            try {
              const token = generatePreviewToken()
              const expiresAt = getExpiryDate(body.duration || '24h')

              return await prisma.$transaction(async (tx) => {
                const previewToken = await tx.previewToken.create({
                  data: {
                    token,
                    resourceType: body.resourceType,
                    resourceId: body.resourceId,
                    expiresAt,
                    createdBy: ctx.actorId!,
                  },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'preview_token.create',
                    resourceType: AuditResourceType.PREVIEW_TOKEN,
                    resourceId: previewToken.id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      resourceType: body.resourceType,
                      resourceId: body.resourceId,
                    },
                    afterJson: {
                      id: previewToken.id,
                      resourceType: previewToken.resourceType,
                      resourceId: previewToken.resourceId,
                      expiresAt: previewToken.expiresAt.toISOString(),
                    },
                  },
                })
                return NextResponse.json({
                  id: previewToken.id,
                  token: previewToken.token,
                  expiresAt: previewToken.expiresAt,
                })
              })
            } catch (error) {
              logger.error({ err: error }, 'Failed to create preview token')
              return NextResponse.json(
                { error: 'Failed to create preview token' },
                { status: 500 }
              )
            }
          })
        )
      )
    )
  )
)

export const GET = withRequestContext(
  withRateLimit(
    'admin',
    withAdminAuth(async (req: NextRequest) => {
      try {
        const { searchParams } = new URL(req.url)
        const resourceType = searchParams.get('resourceType')
        const resourceId = searchParams.get('resourceId')

        const tokens = await prisma.previewToken.findMany({
          where: {
            ...(resourceType && { resourceType }),
            ...(resourceId && { resourceId }),
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(tokens)
      } catch (error) {
        logger.error({ err: error }, 'Failed to fetch preview tokens')
        return NextResponse.json(
          { error: 'Failed to fetch preview tokens' },
          { status: 500 }
        )
      }
    })
  )
)
