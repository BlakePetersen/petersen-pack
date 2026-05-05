// ABOUTME: Pricing add-on [id] GET/PATCH/DELETE — composed wrapper chain per SEC-07
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
          const addOn = await prisma.pricingAddOn.findUnique({ where: { id } })
          if (!addOn) {
            return NextResponse.json(
              { error: 'Add-on not found' },
              { status: 404 }
            )
          }
          return NextResponse.json(addOn)
        } catch (error) {
          logger.error({ err: error }, 'Error fetching pricing add-on')
          return NextResponse.json(
            { error: 'Failed to fetch add-on' },
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
          withAudit('pricing_addon.update', async (req, ctx) => {
            try {
              const data = await req.json()
              return await prisma.$transaction(async (tx) => {
                const addOn = await tx.pricingAddOn.update({
                  where: { id },
                  data: data as Prisma.PricingAddOnUpdateInput,
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'pricing_addon.update',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { fields: Object.keys(data) },
                    afterJson: { id: addOn.id, name: addOn.name },
                  },
                })
                return NextResponse.json(addOn)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating pricing add-on')
              return NextResponse.json(
                { error: 'Failed to update add-on' },
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
          withAudit('pricing_addon.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.pricingAddOn.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Add-on not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.pricingAddOn.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'pricing_addon.delete',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {},
                    beforeJson: { id: existing.id, name: existing.name },
                  },
                })
                return NextResponse.json({ success: true })
              })
            } catch (error) {
              logger.error({ err: error }, 'Error deleting pricing add-on')
              return NextResponse.json(
                { error: 'Failed to delete add-on' },
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
