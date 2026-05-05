// ABOUTME: FAQ reorder POST/PUT — composed wrapper chain per SEC-07
// ABOUTME: All sortOrder updates + audit row inside one $transaction (D-10)

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

const orderItem = z.object({
  id: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0),
})

const reorderSchema = z.object({
  faqOrders: z.array(orderItem).optional(),
  updates: z.array(orderItem).optional(),
})

const buildHandler = () =>
  withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit(
            'faq.reorder',
            withValidation(reorderSchema, async (_req, ctx, body) => {
              try {
                const orders = body.faqOrders ?? body.updates ?? []
                if (orders.length === 0) {
                  return NextResponse.json(
                    { error: 'Invalid request format' },
                    { status: 400 }
                  )
                }
                return await prisma.$transaction(async (tx) => {
                  for (const order of orders) {
                    await tx.faq.update({
                      where: { id: order.id },
                      data: { sortOrder: order.sortOrder },
                    })
                  }
                  await tx.auditLog.create({
                    data: {
                      actorId: ctx.actorId!,
                      actorRole: ctx.actorRole!,
                      actorEmail: ctx.actorEmail ?? '',
                      action: 'faq.reorder',
                      resourceType: AuditResourceType.FAQ,
                      resourceId: 'list',
                      requestId: ctx.requestId,
                      ip: ctx.ip,
                      ua: ctx.ua,
                      metadata: { count: orders.length },
                      afterJson: { orders },
                    },
                  })
                  return NextResponse.json({ success: true })
                })
              } catch (error) {
                logger.error({ err: error }, 'Error reordering FAQs')
                return NextResponse.json(
                  { error: 'Failed to reorder FAQs' },
                  { status: 500 }
                )
              }
            })
          )
        )
      )
    )
  )

export async function POST(request: NextRequest) {
  return buildHandler()(request)
}

export async function PUT(request: NextRequest) {
  return buildHandler()(request)
}
