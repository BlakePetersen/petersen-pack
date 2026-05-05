// ABOUTME: Testimonial admin GET/POST — composed wrapper chain per SEC-07
// ABOUTME: GET adds adminAuth gate that was missing pre-migration (Rule 2 — only used by admin form)

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
        const testimonials = await prisma.testimonial.findMany({
          orderBy: { sortOrder: 'asc' },
        })
        return NextResponse.json(testimonials)
      } catch (error) {
        logger.error({ err: error }, 'Error fetching testimonials')
        return NextResponse.json(
          { error: 'Failed to fetch testimonials' },
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
        withAudit('testimonial.create', async (req, ctx) => {
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
              const testimonial = await tx.testimonial.create({
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
                  action: 'testimonial.create',
                  resourceType: AuditResourceType.SERVICE,
                  resourceId: testimonial.id,
                  requestId: ctx.requestId,
                  ip: ctx.ip,
                  ua: ctx.ua,
                  metadata: { clientName, projectType },
                  afterJson: { id: testimonial.id, clientName, projectType },
                },
              })
              return NextResponse.json(testimonial)
            })
          } catch (error) {
            logger.error({ err: error }, 'Error creating testimonial')
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
