// ABOUTME: Integration test for AuditLog schema — insert round-trip + index presence
// ABOUTME: Requires DATABASE_URL to point at a DB with the add_audit_log migration applied

import { describe, it, expect, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { AuditResourceType } from '@prisma/client'

describe('AuditLog schema', () => {
  const insertedIds: string[] = []

  afterAll(async () => {
    if (insertedIds.length) {
      await prisma.auditLog.deleteMany({ where: { id: { in: insertedIds } } })
    }
    await prisma.$disconnect()
  })

  it('round-trips a row with all required + optional columns', async () => {
    const row = await prisma.auditLog.create({
      data: {
        actorId: 'test_actor_1',
        actorRole: 'ADMIN',
        actorEmail: 'test@example.com',
        action: 'booking.convert_inquiry',
        resourceType: AuditResourceType.BOOKING,
        resourceId: 'test_booking_1',
        requestId: '01HN3ZABCDEF0123456789XYZW',
        ip: '203.0.113.5',
        ua: 'vitest/1.0',
        metadata: { inquiryId: 'inq_1', depositAmount: 50000 },
        beforeJson: { status: 'DRAFT' },
        afterJson: { status: 'BOOKED' },
      },
    })
    insertedIds.push(row.id)

    expect(row.id).toMatch(/^c[a-z0-9]{24}$/) // cuid shape
    expect(row.actorId).toBe('test_actor_1')
    expect(row.actorRole).toBe('ADMIN')
    expect(row.actorEmail).toBe('test@example.com')
    expect(row.action).toBe('booking.convert_inquiry')
    expect(row.resourceType).toBe(AuditResourceType.BOOKING)
    expect(row.resourceId).toBe('test_booking_1')
    expect(row.requestId).toBe('01HN3ZABCDEF0123456789XYZW')
    expect(row.ip).toBe('203.0.113.5')
    expect(row.ua).toBe('vitest/1.0')
    expect(row.metadata).toEqual({ inquiryId: 'inq_1', depositAmount: 50000 })
    expect(row.beforeJson).toEqual({ status: 'DRAFT' })
    expect(row.afterJson).toEqual({ status: 'BOOKED' })
    expect(row.createdAt).toBeInstanceOf(Date)
  })

  it('allows beforeJson / afterJson to be null', async () => {
    const row = await prisma.auditLog.create({
      data: {
        actorId: 'test_actor_2',
        actorRole: 'ADMIN',
        actorEmail: 'test@example.com',
        action: 'contract.issue',
        resourceType: AuditResourceType.CONTRACT,
        resourceId: 'test_contract_1',
        requestId: '01HN3ZABCDEF0123456789XYZW',
        ip: '203.0.113.5',
        ua: 'vitest/1.0',
        metadata: { contractId: 'c_1' },
      },
    })
    insertedIds.push(row.id)
    expect(row.beforeJson).toBeNull()
    expect(row.afterJson).toBeNull()
  })

  it('has three indexes: (actorId, createdAt), (resourceType, resourceId, createdAt), (requestId)', async () => {
    const rows = await prisma.$queryRaw<Array<{ indexname: string }>>`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'AuditLog'
    `
    const names = rows.map((r) => r.indexname)
    expect(names.some((n) => /actorId.*createdAt/i.test(n))).toBe(true)
    expect(
      names.some((n) => /resourceType.*resourceId.*createdAt/i.test(n))
    ).toBe(true)
    expect(names.some((n) => /requestId/.test(n))).toBe(true)
  })

  it('EXPLAIN on actorId query uses the (actorId, createdAt DESC) index', async () => {
    const plan = await prisma.$queryRaw<Array<{ 'QUERY PLAN': string }>>`
      EXPLAIN SELECT * FROM "AuditLog" WHERE "actorId" = 'test_actor_1'
      ORDER BY "createdAt" DESC LIMIT 50
    `
    const planText = plan.map((p) => p['QUERY PLAN']).join('\n')
    // Look for Index Scan OR Bitmap Index Scan on an index involving actorId
    expect(/Index.*Scan/i.test(planText)).toBe(true)
    expect(/actorId/.test(planText)).toBe(true)
  })
})
