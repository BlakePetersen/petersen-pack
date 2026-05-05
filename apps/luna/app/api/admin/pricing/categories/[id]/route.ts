// ABOUTME: Pricing category [id] GET/PATCH/DELETE — composed wrapper chain per SEC-07
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
import { AuditResourceType, Prisma } from '@prisma/client'
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
          const category = await prisma.pricingCategory.findUnique({
            where: { id },
            include: { packages: { orderBy: { sortOrder: 'asc' } } },
          })
          if (!category) {
            return NextResponse.json(
              { error: 'Category not found' },
              { status: 404 }
            )
          }
          return NextResponse.json(category)
        } catch (error) {
          logger.error({ err: error }, 'Error fetching pricing category')
          return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
          )
        }
      })
    )
  )
  return handler(request)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const handler = withRequestContext(
    withRateLimit(
      'admin',
      withCsrf(
        withAdminAuth(
          withAudit('pricing_category.update', async (req, ctx) => {
            try {
              const data = await req.json()
              return await prisma.$transaction(async (tx) => {
                const category = await tx.pricingCategory.update({
                  where: { id },
                  data: data as Prisma.PricingCategoryUpdateInput,
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'pricing_category.update',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { fields: Object.keys(data) },
                    afterJson: { id: category.id, slug: category.slug },
                  },
                })
                return NextResponse.json(category)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating pricing category')
              return NextResponse.json(
                { error: 'Failed to update category' },
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
          withAudit('pricing_category.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.pricingCategory.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Category not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.pricingCategory.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'pricing_category.delete',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { slug: existing.slug },
                    beforeJson: { id: existing.id, slug: existing.slug },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error deleting pricing category')
              return NextResponse.json(
                { error: 'Failed to delete category' },
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
