// ABOUTME: Pricing package [id] GET/PATCH/DELETE — composed wrapper chain per SEC-07
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
          const pkg = await prisma.pricingPackage.findUnique({
            where: { id },
            include: { category: true },
          })
          if (!pkg) {
            return NextResponse.json(
              { error: 'Package not found' },
              { status: 404 }
            )
          }
          return NextResponse.json(pkg)
        } catch (error) {
          logger.error({ err: error }, 'Error fetching pricing package')
          return NextResponse.json(
            { error: 'Failed to fetch package' },
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
          withAudit('pricing_package.update', async (req, ctx) => {
            try {
              const data = await req.json()
              return await prisma.$transaction(async (tx) => {
                const pkg = await tx.pricingPackage.update({
                  where: { id },
                  data: data as Prisma.PricingPackageUpdateInput,
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'pricing_package.update',
                    resourceType: AuditResourceType.SERVICE,
                    resourceId: id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: { fields: Object.keys(data) },
                    afterJson: { id: pkg.id, name: pkg.name },
                  },
                })
                return NextResponse.json(pkg)
              })
            } catch (error) {
              logger.error({ err: error }, 'Error updating pricing package')
              return NextResponse.json(
                { error: 'Failed to update package' },
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
          withAudit('pricing_package.delete', async (_req, ctx) => {
            try {
              const existing = await prisma.pricingPackage.findUnique({
                where: { id },
              })
              if (!existing) {
                return NextResponse.json(
                  { error: 'Package not found' },
                  { status: 404 }
                )
              }
              return await prisma.$transaction(async (tx) => {
                await tx.pricingPackage.delete({ where: { id } })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'pricing_package.delete',
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
              logger.error({ err: error }, 'Error deleting pricing package')
              return NextResponse.json(
                { error: 'Failed to delete package' },
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
