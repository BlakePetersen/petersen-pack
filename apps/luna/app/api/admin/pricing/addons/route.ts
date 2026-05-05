// ABOUTME: Pricing add-on admin GET/POST — composed wrapper chain per SEC-07
// ABOUTME: Audit row inside $transaction (D-10); resourceType=SERVICE

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
        const addOns = await prisma.pricingAddOn.findMany({
          orderBy: { sortOrder: 'asc' },
        })
        return NextResponse.json(addOns)
      } catch (error) {
        logger.error({ err: error }, 'Error fetching pricing add-ons')
        return NextResponse.json(
          { error: 'Failed to fetch add-ons' },
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
        withAudit('pricing_addon.create', async (req, ctx) => {
          try {
            const data = await req.json()
            const { name, price, unit, sortOrder, isActive } = data
            if (!name || !price || !unit) {
              return NextResponse.json(
                { error: 'Name, price, and unit are required' },
                { status: 400 }
              )
            }
            return await prisma.$transaction(async (tx) => {
              const addOn = await tx.pricingAddOn.create({
                data: {
                  name,
                  price,
                  unit,
                  sortOrder: sortOrder ?? 0,
                  isActive: isActive ?? true,
                },
              })
              await tx.auditLog.create({
                data: {
                  actorId: ctx.actorId!,
                  actorRole: ctx.actorRole!,
                  actorEmail: ctx.actorEmail ?? '',
                  action: 'pricing_addon.create',
                  resourceType: AuditResourceType.SERVICE,
                  resourceId: addOn.id,
                  requestId: ctx.requestId,
                  ip: ctx.ip,
                  ua: ctx.ua,
                  metadata: { name, price, unit },
                  afterJson: {
                    id: addOn.id,
                    name: addOn.name,
                    price: addOn.price,
                  },
                },
              })
              return NextResponse.json(addOn)
            })
          } catch (error) {
            logger.error({ err: error }, 'Error creating pricing add-on')
            return NextResponse.json(
              { error: 'Failed to create add-on' },
              { status: 500 }
            )
          }
        })
      )
    )
  )
)
