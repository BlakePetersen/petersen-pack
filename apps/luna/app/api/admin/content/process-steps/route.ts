// ABOUTME: Process-step admin GET/POST — composed wrapper chain per SEC-07
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

        const steps = await prisma.processStep.findMany({
          where,
          orderBy: { stepNumber: 'asc' },
          include: {
            services: {
              include: { service: { select: { id: true, name: true } } },
            },
          },
        })
        return NextResponse.json(steps)
      } catch (error) {
        logger.error({ err: error }, 'Error fetching process steps')
        return NextResponse.json(
          { error: 'Failed to fetch process steps' },
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
        withAudit('process_step.create', async (req, ctx) => {
          try {
            const data = await req.json()
            const { title, content, stepNumber, icon, isGlobal, serviceId } =
              data
            if (!title || !content || stepNumber === undefined) {
              return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
              )
            }
            return await prisma.$transaction(async (tx) => {
              const step = await tx.processStep.create({
                data: {
                  title,
                  content,
                  stepNumber,
                  icon,
                  isGlobal: isGlobal ?? false,
                  serviceId: isGlobal ? null : serviceId,
                },
              })
              await tx.auditLog.create({
                data: {
                  actorId: ctx.actorId!,
                  actorRole: ctx.actorRole!,
                  actorEmail: ctx.actorEmail ?? '',
                  action: 'process_step.create',
                  resourceType: AuditResourceType.SERVICE,
                  resourceId: step.id,
                  requestId: ctx.requestId,
                  ip: ctx.ip,
                  ua: ctx.ua,
                  metadata: { isGlobal: isGlobal ?? false },
                  afterJson: { id: step.id, title: step.title },
                },
              })
              return NextResponse.json(step, { status: 201 })
            })
          } catch (error) {
            logger.error({ err: error }, 'Error creating process step')
            return NextResponse.json(
              { error: 'Failed to create process step' },
              { status: 500 }
            )
          }
        })
      )
    )
  )
)
