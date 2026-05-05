// ABOUTME: Public API route for fetching pricing information
// ABOUTME: Returns pricing categories, packages, and add-ons

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const [categories, addOns] = await Promise.all([
      prisma.pricingCategory.findMany({
        where: { isActive: true },
        include: {
          packages: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.pricingAddOn.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ])

    return NextResponse.json({ categories, addOns })
  } catch (error) {
    logger.error({ err: error }, 'Error fetching pricing')
    return NextResponse.json(
      { error: 'Failed to fetch pricing' },
      { status: 500 }
    )
  }
}
