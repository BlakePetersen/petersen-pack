// ABOUTME: Contract admin CRUD — composed wrapper chain per SEC-07
// ABOUTME: Audit row written inside handler's $transaction (D-10)

import { NextResponse } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import {
  withRateLimit,
  withCsrf,
  withAdminAuth,
  withAudit,
  withValidation,
} from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { AuditResourceType } from '@prisma/client'
import { contractFormSchema } from '@/lib/validations/contract'
import { logger } from '@/lib/logger'

export const POST = withRequestContext(
  withRateLimit(
    'admin',
    withCsrf(
      withAdminAuth(
        withAudit(
          'contract.create',
          withValidation(contractFormSchema, async (_req, ctx, data) => {
            try {
              const usageRights = await prisma.usageRight.findMany({
                where: { id: { in: data.usageRightIds } },
              })
              const usageRightsTotal = usageRights.reduce(
                (sum, ur) => sum + ur.price,
                0
              )
              const finalTotal = data.totalAmount + usageRightsTotal

              return await prisma.$transaction(async (tx) => {
                const contract = await tx.contract.create({
                  data: {
                    clientId: data.clientId,
                    inquiryId: data.inquiryId,
                    bookingId: data.bookingId,
                    shootType: data.shootType,
                    shootDate: data.shootDate,
                    shootLocation: data.shootLocation,
                    sessionDuration: data.sessionDuration,
                    deliverablesDescription: data.deliverablesDescription,
                    totalAmount: finalTotal,
                    depositAmount: data.depositAmount,
                    retouchesIncluded: data.retouchesIncluded,
                    pricePerExtraRetouch: data.pricePerExtraRetouch,
                    downloadQuota: data.downloadQuota,
                    maxFileSizePx: data.maxFileSizePx,
                    usageRights: {
                      create: data.usageRightIds.map((id) => ({
                        usageRightId: id,
                      })),
                    },
                  },
                  include: {
                    usageRights: { include: { usageRight: true } },
                  },
                })
                await tx.auditLog.create({
                  data: {
                    actorId: ctx.actorId!,
                    actorRole: ctx.actorRole!,
                    actorEmail: ctx.actorEmail ?? '',
                    action: 'contract.create',
                    resourceType: AuditResourceType.CONTRACT,
                    resourceId: contract.id,
                    requestId: ctx.requestId,
                    ip: ctx.ip,
                    ua: ctx.ua,
                    metadata: {
                      clientId: data.clientId,
                      totalAmount: finalTotal,
                    },
                    afterJson: {
                      id: contract.id,
                      clientId: contract.clientId,
                      status: contract.status,
                      totalAmount: contract.totalAmount,
                    },
                  },
                })
                return NextResponse.json(contract, { status: 201 })
              })
            } catch (error) {
              logger.error({ err: error }, 'Contract creation error')
              return NextResponse.json(
                { error: 'Failed to create contract' },
                { status: 500 }
              )
            }
          })
        )
      )
    )
  )
)
