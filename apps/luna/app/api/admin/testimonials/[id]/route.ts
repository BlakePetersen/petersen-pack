// ABOUTME: Testimonial [id] admin PUT/DELETE — composed wrapper chain per SEC-07
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
import { AuditResourceType } from '@prisma/client'
import { logger } from '@/lib/logger'

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
          withAudit('testimonial.update', async (req, ctx) => {
            try {
              const data = await req.json()
              const {
                clientName,
                projectType,
                quote,
                rating,
                sortOrder,
                isActive,
              } = data
              if (
                !clientName ||
                !projectType ||
                !quote ||
                sortOrder === undefined
              ) {
                return NextResponse.json(
                  { error: 'Missing required fields' },
                  { status: 400 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                const testimonial = await tx.testimonial.update({
                  where: { id },
                  data: {
                    clientName,
                    projectType,
                    quote,
                    rating: rating ? parseInt(rating) : 5,
                    sortOrder: parseInt(sortOrder),
                    isActive: isActive ?? true,
                  },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'testimonial.update',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { clientName },
                    afterJson: { id: testimonial.id, clientName },
                  },
                })
                return NextResponse.json(testimonial)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating testimonial')
              return NextResponse.json(
                { error: 'Internal server error' },
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
          withAudit('testimonial.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.testimonial.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Testimonial not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.testimonial.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'testimonial.delete',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {},
                    beforeJson: {
                      id: existing.id,
                      clientName: existing.clientName,
                    },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error deleting testimonial')
              return NextResponse.json(
                { error: 'Internal server error' },
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
