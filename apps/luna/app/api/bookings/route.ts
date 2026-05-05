// ABOUTME: Public booking creation API — composed wrapper chain (anonymous tier)
// ABOUTME: Replaces in-memory rate limiter (lib/rate-limit.ts deleted in P2.2d / SEC-01 sweep)

import { NextResponse } from 'next/server'
import { withRequestContext } from '@/lib/request-context'
import { withRateLimit } from '@/lib/wrappers'
import { prisma } from '@/lib/prisma'
import { sendBookingRequestNotifications } from '@/lib/email'
import { logger } from '@/lib/logger'

export const POST = withRequestContext(
  withRateLimit('anon', async (req) => {
    try {
      const body = await req.json()
      const {
        availabilitySlotId,
        name,
        email,
        phone,
        serviceType,
        sessionDuration,
        employeeCount,
        message,
      } = body

      if (
        !availabilitySlotId ||
        !name ||
        !email ||
        !serviceType ||
        !sessionDuration
      ) {
        return NextResponse.json(
          { message: 'Missing required fields' },
          { status: 400 }
        )
      }

      if (
        serviceType === 'Headshots - Team' &&
        (!employeeCount || employeeCount < 1)
      ) {
        return NextResponse.json(
          { message: 'Employee count is required for team headshots' },
          { status: 400 }
        )
      }

      const slot = await prisma.availabilitySlot.findUnique({
        where: { id: availabilitySlotId },
      })
      if (!slot) {
        return NextResponse.json(
          { message: 'Availability slot not found' },
          { status: 404 }
        )
      }
      if (!slot.isAvailable) {
        return NextResponse.json(
          { message: 'This time slot is no longer available' },
          { status: 400 }
        )
      }

      const booking = await prisma.booking.create({
        data: {
          availabilitySlotId,
          name,
          email,
          phone: phone || null,
          serviceType,
          sessionDuration: parseInt(sessionDuration),
          employeeCount: employeeCount ? parseInt(employeeCount) : null,
          message: message || null,
          status: 'PENDING',
        },
        include: { availabilitySlot: true },
      })

      await sendBookingRequestNotifications({
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        serviceType: booking.serviceType,
        sessionDuration: booking.sessionDuration,
        employeeCount: booking.employeeCount,
        message: booking.message,
        availabilitySlot: {
          date: booking.availabilitySlot.date,
          startTime: booking.availabilitySlot.startTime,
          endTime: booking.availabilitySlot.endTime,
        },
        createdAt: booking.createdAt,
      })

      return NextResponse.json(booking, { status: 201 })
    } catch (error) {
      logger.error({ err: error }, 'Error creating booking')
      return NextResponse.json(
        { message: 'Failed to create booking' },
        { status: 500 }
      )
    }
  })
)
