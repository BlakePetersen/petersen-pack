// ABOUTME: Service admin GET/POST — composed wrapper chain per SEC-07
// ABOUTME: Long-tail; TYP-05 will Zod-ify body. Audit row inside $transaction.

import { NextResponse } from 'next/server'
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
    withAdminAuth(async () => {
      try {
        const services = await prisma.service.findMany({
          orderBy: { sortOrder: 'asc' },
          include: {
            pricingCategories: { include: { packages: true } },
            processSteps: {
              include: { processStep: true },
              orderBy: { sortOrder: 'asc' },
            },
            infoCards: {
              include: { infoCard: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        })
        return NextResponse.json(services)
      } catch (error) {
        logger.error({ err: error }, 'Error fetching services')
        return NextResponse.json(
          { error: 'Failed to fetch services' },
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
        withAudit('service.create', async (req, ctx) => {
          try {
            const data = await req.json()
            const {
              name,
              slug,
              description,
              heroImage,
              isActive,
              sortOrder,
              processStepIds,
              infoCardIds,
            } = data

            if (!name || !slug || !description) {
              return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
              )
            }

            return await prisma.$transaction(async (tx) => {
              const service = await tx.service.create({
                data: {
                  name,
                  slug,
                  description,
                  heroImage,
                  isActive: isActive ?? true,
                  sortOrder: sortOrder ?? 0,
                  processSteps: {
                    create: processStepIds?.map(
                      (id: string, index: number) => ({
                        processStepId: id,
                        sortOrder: index,
                      })
                    ),
                  },
                  infoCards: {
                    create: infoCardIds?.map((id: string, index: number) => ({
                      infoCardId: id,
                      sortOrder: index,
                    })),
                  },
                },
                include: {
                  processSteps: { include: { processStep: true } },
                  infoCards: { include: { infoCard: true } },
                },
              })
              await tx.auditLog.create({
                data: {
                  actorId: ctx.actorId!,
                  actorRole: ctx.actorRole!,
                  actorEmail: ctx.actorEmail ?? '',
                  action: 'service.create',
                  resourceType: AuditResourceType.SERVICE,
                  resourceId: service.id,
                  requestId: ctx.requestId,
                  ip: ctx.ip,
                  ua: ctx.ua,
                  metadata: { slug, name },
                  afterJson: { id: service.id, slug: service.slug },
                },
              })
              return NextResponse.json(service, { status: 201 })
            })
          } catch (error) {
            logger.error({ err: error }, 'Error creating service')
            return NextResponse.json(
              { error: 'Failed to create service' },
              { status: 500 }
            )
          }
        })
      )
    )
  )
)
