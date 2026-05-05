// ABOUTME: FAQ [id] admin GET/PUT/DELETE — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10) for state changes

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withAdminAuth(async () => {
        try {
          const faq = await prisma.faq.findUnique({
            where: { id },
            include: {
              service: { select: { id: true, name: true, slug: true } },
            },
          })
          if (!faq) {
            return NextResponse.json(
              { error: 'FAQ not found' },
              { status: 404 }
            )
          }
          return NextResponse.json(faq)
        } catch (error) {
          logger.error({ err: error }, 'Error fetching FAQ')
          return NextResponse.json(
            { error: 'Failed to fetch FAQ' },
            { status: 500 }
          )
        }
      })
    )
  )
  return handler(request)
}

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
          withAudit('faq.update', async (req, ctx) => {
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
              const parsedAnswer =
                typeof answer === 'string' ? JSON.parse(answer) : answer

              return await prisma.$transaction(async (tx) => {
                const faq = await tx.faq.update({
                  where: { id },
                  data: {
                    question,
                    answer: parsedAnswer,
                    category,
                    serviceId: serviceId || null,
                    sortOrder,
                    isActive,
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
                    action: 'faq.update',
                    resourceType: AuditResourceType.FAQ,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { category },
                    afterJson: { id: faq.id, question: faq.question },
                  },
                })
                return NextResponse.json(faq)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating FAQ')
              return NextResponse.json(
                { error: 'Failed to update FAQ' },
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
          withAudit('faq.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.faq.findUnique({ where: { id } })
              if (!existing) {
                return NextResponse.json(
                  { error: 'FAQ not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.faq.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'faq.delete',
                    resourceType: AuditResourceType.FAQ,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { category: existing.category },
                    beforeJson: {
                      id: existing.id,
                      question: existing.question,
                    },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error deleting FAQ')
              return NextResponse.json(
                { error: 'Failed to delete FAQ' },
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
