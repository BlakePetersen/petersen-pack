// ABOUTME: FAQ duplicate POST — composed wrapper chain per SEC-07
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
import { AuditResourceType, Prisma } from '@prisma/client'
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
          withAudit('faq.duplicate', async (_req, ctx) => {
            try {
              const originalFaq = await prisma.faq.findUnique({
                where: { id },
              })
              if (!originalFaq) {
                return NextResponse.json(
                  { error: 'FAQ not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                const duplicatedFaq = await tx.faq.create({
                  data: {
                    question: `${originalFaq.question} (Copy)`,
                    answer: originalFaq.answer as Prisma.InputJsonValue,
                    category: originalFaq.category,
                    serviceId: originalFaq.serviceId,
                    sortOrder: originalFaq.sortOrder + 1,
                    isActive: false,
                  },
                  include: {
                    service: { select: { id: true, name: true, slug: true } },
                  },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'faq.duplicate',
                    resourceType: AuditResourceType.FAQ,
                    resourceId: duplicatedFaq.id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { sourceId: id },
                    afterJson: {
                      id: duplicatedFaq.id,
                      question: duplicatedFaq.question,
                    },
                  },
                })
                return NextResponse.json(duplicatedFaq, { status: 201 })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error duplicating FAQ')
              return NextResponse.json(
                { error: 'Failed to duplicate FAQ' },
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
