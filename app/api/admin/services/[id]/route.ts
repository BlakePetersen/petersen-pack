// ABOUTME: Service [id] admin GET/PUT/DELETE — composed wrapper chain per SEC-07
// ABOUTME: PUT recreates content-block associations atomically; audit inside $transaction (D-10)

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
          const service = await prisma.service.findUnique({
            where: { id },
            include: {
              pricingCategories: {
                include: { packages: true },
                orderBy: { sortOrder: 'asc' },
              },
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
          if (!service) {
            return NextResponse.json(
              { error: 'Service not found' },
              { status: 404 }
            )
          }
          return NextResponse.json(service)
        } catch (error) {
          logger.error({ err: error }, 'Error fetching service')
          return NextResponse.json(
            { error: 'Failed to fetch service' },
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
          withAudit('service.update', async (req, ctx) => {
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
              return await prisma.$transaction(async (tx) => {
                await tx.serviceProcessStep.deleteMany({
                  where: { serviceId: id },
                })
                await tx.serviceInfoCard.deleteMany({
                  where: { serviceId: id },
                })
                const service = await tx.service.update({
                  where: { id },
                  data: {
                    name,
                    slug,
                    description,
                    heroImage,
                    isActive,
                    sortOrder,
                    processSteps: {
                      create: processStepIds?.map(
                        (stepId: string, index: number) => ({
                          processStepId: stepId,
                          sortOrder: index,
                        })
                      ),
                    },
                    infoCards: {
                      create: infoCardIds?.map(
                        (cardId: string, index: number) => ({
                          infoCardId: cardId,
                          sortOrder: index,
                        })
                      ),
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
                    action: 'service.update',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { slug, name },
                    afterJson: { id: service.id, slug: service.slug },
                  },
                })
                return NextResponse.json(service)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating service')
              return NextResponse.json(
                { error: 'Failed to update service' },
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
          withAudit('service.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.service.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Service not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.service.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'service.delete',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { slug: existing.slug },
                    beforeJson: {
                      id: existing.id,
                      slug: existing.slug,
                      name: existing.name,
                    },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error deleting service')
              return NextResponse.json(
                { error: 'Failed to delete service' },
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
