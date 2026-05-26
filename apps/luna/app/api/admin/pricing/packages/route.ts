// ABOUTME: Pricing package admin GET/POST — composed wrapper chain per SEC-07
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
        const packages = await prisma.pricingPackage.findMany({
          include: { category: true },
          orderBy: { sortOrder: 'asc' },
        })
        return NextResponse.json(packages)
      } catch (error) {
        logger.error({ err: error }, 'Error fetching pricing packages')
        return NextResponse.json(
          { error: 'Failed to fetch packages' },
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
        withAudit('pricing_package.create', async (req, ctx) => {
          try {
            const data = await req.json()
            const {
              categoryId,
              name,
              price,
              duration,
              features,
              isPopular,
              sortOrder,
              isActive,
            } = data
            if (!categoryId || !name || price === undefined || !duration) {
              return NextResponse.json(
                { error: 'CategoryId, name, price, and duration are required' },
                { status: 400 }
              )
            }
            return await prisma.$transaction(async (tx) => {
              const pkg = await tx.pricingPackage.create({
                data: {
                  categoryId,
                  name,
                  price,
                  duration,
                  features: features || [],
                  isPopular: isPopular ?? false,
                  sortOrder: sortOrder ?? 0,
                  isActive: isActive ?? true,
                },
              })
              await tx.auditLog.create({
                data: {
                  actorId: ctx.actorId!,
                  actorRole: ctx.actorRole!,
                  actorEmail: ctx.actorEmail ?? '',
                  action: 'pricing_package.create',
                  resourceType: AuditResourceType.SERVICE,
                  resourceId: pkg.id,
                  requestId: ctx.requestId,
                  ip: ctx.ip,
                  ua: ctx.ua,
                  metadata: { categoryId, name, price },
                  afterJson: { id: pkg.id, name: pkg.name, price: pkg.price },
                },
              })
              return NextResponse.json(pkg)
            })
          } catch (error) {
            logger.error({ err: error }, 'Error creating pricing package')
            return NextResponse.json(
              { error: 'Failed to create package' },
              { status: 500 }
            )
          }
        })
      )
    )
  )
)
