// ABOUTME: FAQ admin GET (list) + POST (create) — composed wrapper chain per SEC-07
// ABOUTME: Long-tail; TYP-05 (Phase 5) will add Zod schema. Audit row inside $transaction.

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

export const GET = withRequestContext(
  withRateLimit(
    'admin',
    withAdminAuth(async (req: NextRequest) => {
      try {
        const searchParams = req.nextUrl.searchParams
        const serviceId = searchParams.get('serviceId')
        const category = searchParams.get('category')
        const isActive = searchParams.get('isActive')
        const search = searchParams.get('search')

        const where: Record<string, unknown> = {}
        if (serviceId) {
          where.serviceId = serviceId === 'null' ? null : serviceId
        }
        if (category && category !== 'ALL') {
          where.category = category
        }
        if (isActive !== null && isActive !== undefined && isActive !== 'all') {
          where.isActive = isActive === 'true'
        }
        if (search) {
          where.question = { contains: search, mode: 'insensitive' }
        }

        const faqs = await prisma.faq.findMany({
          where,
          include: {
            service: { select: { id: true, name: true, slug: true } },
          },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        })
        return NextResponse.json(faqs)
      } catch (error) {
        logger.error({ err: error }, 'Error fetching FAQs')
        return NextResponse.json(
          { error: 'Failed to fetch FAQs' },
          { status: 500 }
        )
      }
    })
  )
)

export const POST = withRequestContext(
  withRateLimit(
    'admin',
    withCsrf(
      withAdminAuth(
        withAudit('faq.create', async (req, ctx) => {
          try {
            const body = await req.json()
            const {
              question,
              answer,
              category,
              serviceId,
              sortOrder,
              isActive,
            } = body

            if (!question || !answer || !category) {
              return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
              )
            }

            const parsedAnswer =
              typeof answer === 'string' ? JSON.parse(answer) : answer

            return await prisma.$transaction(async (tx) => {
              const faq = await tx.faq.create({
                data: {
                  question,
                  answer: parsedAnswer,
                  category,
                  serviceId: serviceId || null,
                  sortOrder: sortOrder ?? 0,
                  isActive: isActive ?? true,
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
                  action: 'faq.create',
                  resourceType: AuditResourceType.FAQ,
                  resourceId: faq.id,
                  requestId: ctx.requestId,
                  ip: ctx.ip,
                  ua: ctx.ua,
                  metadata: { category, serviceId: serviceId || null },
                  afterJson: { id: faq.id, question: faq.question },
                },
              })
              return NextResponse.json(faq, { status: 201 })
            })
          } catch (error) {
            logger.error({ err: error }, 'Error creating FAQ')
            return NextResponse.json(
              { error: 'Failed to create FAQ' },
              { status: 500 }
            )
          }
        })
      )
    )
  )
)
