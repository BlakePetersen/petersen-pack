// ABOUTME: Info-card admin GET/POST — composed wrapper chain per SEC-07
// ABOUTME: Long-tail; TYP-05 will Zod-ify body. Audit row inside $transaction.

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
        const { searchParams } = new URL(req.url)
        const serviceId = searchParams.get('serviceId')
        const where = serviceId
          ? { OR: [{ isGlobal: true }, { serviceId }] }
          : { isGlobal: true }

        const cards = await prisma.infoCard.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            services: {
              include: { service: { select: { id: true, name: true } } },
            },
          },
        })
        return NextResponse.json(cards)
      } catch (error) {
        logger.error({ err: error }, 'Error fetching info cards')
        return NextResponse.json(
          { error: 'Failed to fetch info cards' },
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
        withAudit('info_card.create', async (req, ctx) => {
          try {
            const data = await req.json()
            const { title, content, icon, customIconSvg, isGlobal, serviceId } =
              data
            if (!title || !content || !icon) {
              return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
              )
            }
            return await prisma.$transaction(async (tx) => {
              const card = await tx.infoCard.create({
                data: {
                  title,
                  content,
                  icon,
                  customIconSvg,
                  isGlobal: isGlobal ?? false,
                  serviceId: isGlobal ? null : serviceId,
                },
              })
              await tx.auditLog.create({
                data: {
                  actorId: ctx.actorId!,
                  actorRole: ctx.actorRole!,
                  actorEmail: ctx.actorEmail ?? '',
                  action: 'info_card.create',
                  resourceType: AuditResourceType.SERVICE,
                  resourceId: card.id,
                  requestId: ctx.requestId,
                  ip: ctx.ip,
                  ua: ctx.ua,
                  metadata: { isGlobal: isGlobal ?? false, serviceId },
                  afterJson: { id: card.id, title: card.title },
                },
              })
              return NextResponse.json(card, { status: 201 })
            })
          } catch (error) {
            logger.error({ err: error }, 'Error creating info card')
            return NextResponse.json(
              { error: 'Failed to create info card' },
              { status: 500 }
            )
          }
        })
      )
    )
  )
)
