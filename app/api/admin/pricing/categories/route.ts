// ABOUTME: Pricing category admin GET/POST — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10); resourceType=SERVICE (no PRICING enum)

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
        const categories = await prisma.pricingCategory.findMany({
          include: { packages: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        })
        return NextResponse.json(categories)
      } catch (error) {
        logger.error({ err: error }, 'Error fetching pricing categories')
        return NextResponse.json(
          { error: 'Failed to fetch categories' },
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
        withAudit('pricing_category.create', async (req, ctx) => {
          try {
            const data = await req.json()
            const { name, slug, description, sortOrder, isActive } = data
            if (!name || !slug) {
              return NextResponse.json(
                { error: 'Name and slug are required' },
                { status: 400 }
              )
            }
            return await prisma.$transaction(async (tx) => {
              const category = await tx.pricingCategory.create({
                data: {
                  name,
                  slug,
                  description,
                  sortOrder: sortOrder ?? 0,
                  isActive: isActive ?? true,
                },
              })
              await tx.auditLog.create({
                data: {
                  actorId: ctx.actorId!,
                  actorRole: ctx.actorRole!,
                  actorEmail: ctx.actorEmail ?? '',
                  action: 'pricing_category.create',
                  resourceType: AuditResourceType.SERVICE,
                  resourceId: category.id,
                  requestId: ctx.requestId,
                  ip: ctx.ip,
                  ua: ctx.ua,
                  metadata: { slug },
                  afterJson: { id: category.id, slug },
                },
              })
              return NextResponse.json(category)
            })
          } catch (error) {
            logger.error({ err: error }, 'Error creating pricing category')
            return NextResponse.json(
              { error: 'Failed to create category' },
              { status: 500 }
            )
          }
        })
      )
    )
  )
)
