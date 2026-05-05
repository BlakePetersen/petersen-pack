// ABOUTME: Integration proof — withAudit pattern (D-10) is atomic with business writes
// ABOUTME: Closes ROADMAP §"Phase 2 Success Criterion 3" + Pitfall 2

import { describe, test, expect, beforeEach, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { resetTransactionalTables } from '../fixtures/db'
import { AuditResourceType } from '@prisma/client'

describe.sequential(
  'Audit rollback atomicity (Pitfall 2 / Success Criterion 3)',
  () => {
    beforeEach(async () => {
      await resetTransactionalTables()
    })

    afterAll(async () => {
      await prisma.$disconnect()
    })

    test('$transaction rollback drops the audit row (no orphans)', async () => {
      const before = await prisma.auditLog.count()

      await expect(
        prisma.$transaction(async (tx) => {
          await tx.inquiry.create({
            data: {
              name: 'Rollback Test',
              email: 'rollback@test.local',
              message: 'forced rollback',
              serviceType: 'TEST',
            },
          })
          await tx.auditLog.create({
            data: {
              actorId: 'usr_test',
              actorRole: 'ADMIN',
              actorEmail: 'rollback@test.local',
              action: 'inquiry.create',
              resourceType: AuditResourceType.INQUIRY,
              resourceId: 'will-be-rolled-back',
              requestId: '01HQZX0000000000000000000A',
              ip: '127.0.0.1',
              ua: 'vitest',
              metadata: {},
              afterJson: {},
            },
          })
          throw new Error('forced rollback')
        })
      ).rejects.toThrow('forced rollback')

      const after = await prisma.auditLog.count()
      expect(after).toBe(before)
    })

    test('$transaction commit persists the audit row alongside the business write', async () => {
      const before = await prisma.auditLog.count()

      await prisma.$transaction(async (tx) => {
        await tx.inquiry.create({
          data: {
            name: 'Commit Test',
            email: 'commit@test.local',
            message: 'commit',
            serviceType: 'TEST',
          },
        })
        await tx.auditLog.create({
          data: {
            actorId: 'usr_test',
            actorRole: 'ADMIN',
            actorEmail: 'commit@test.local',
            action: 'inquiry.create',
            resourceType: AuditResourceType.INQUIRY,
            resourceId: 'will-be-committed',
            requestId: '01HQZX0000000000000000000B',
            ip: '127.0.0.1',
            ua: 'vitest',
            metadata: {},
            afterJson: {},
          },
        })
      })

      const after = await prisma.auditLog.count()
      expect(after).toBe(before + 1)
    })
  }
)
