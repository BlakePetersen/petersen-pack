// ABOUTME: API endpoint to calculate final payment amount for a client gallery
// ABOUTME: Returns breakdown of package balance and extra retouch costs

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calculateFinalPayment } from '@/lib/calculate-final-payment'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ galleryId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { galleryId: id } = await params

    // Fetch gallery with contract and approved retouch requests
    const gallery = await prisma.clientGallery.findUnique({
      where: { id },
      include: {
        contract: true,
        changeRequests: {
          where: {
            requestType: 'RETOUCH',
            status: 'APPROVED',
          },
        },
      },
    })

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 })
    }

    // Verify access: admin OR gallery owner
    const isAdmin = session.user.role === 'ADMIN'
    const isOwner = session.user.id === gallery.clientId

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify contract exists
    if (!gallery.contract) {
      return NextResponse.json(
        { error: 'Gallery has no contract' },
        { status: 400 }
      )
    }

    // Count approved retouch requests
    const retouchesUsed = gallery.changeRequests.length

    // Calculate final payment
    const calculation = calculateFinalPayment({
      packagePrice: gallery.contract.totalAmount,
      depositAmount: gallery.contract.depositAmount,
      retouchPricePerImage: gallery.contract.pricePerExtraRetouch,
      retouchesIncluded: gallery.contract.retouchesIncluded,
      retouchesUsed,
    })

    return NextResponse.json(calculation)
  } catch (error) {
    logger.error({ err: error }, 'Error calculating final payment')
    return NextResponse.json(
      { error: 'Failed to calculate final payment' },
      { status: 500 }
    )
  }
}
