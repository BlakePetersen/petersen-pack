// ABOUTME: API route to create Stripe checkout session for final gallery payment
// ABOUTME: Calculates total due and creates payment session with metadata

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calculateFinalPayment } from '@/lib/calculate-final-payment'
import Stripe from 'stripe'
import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

function getStripeClient() {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  })
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { galleryId } = await request.json()
    const stripe = getStripeClient()

    const gallery = await prisma.clientGallery.findUnique({
      where: { id: galleryId },
      include: {
        client: true,
        contract: true,
        changeRequests: {
          where: {
            requestType: 'RETOUCH',
            status: 'APPROVED',
          },
        },
      },
    })

    if (!gallery || !gallery.contract) {
      return NextResponse.json(
        { error: 'Gallery or contract not found' },
        { status: 404 }
      )
    }

    // Verify access - must be the gallery owner
    if (gallery.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const retouchesUsed = gallery.changeRequests.length

    const calculation = calculateFinalPayment({
      packagePrice: gallery.contract.totalAmount,
      depositAmount: gallery.contract.depositAmount,
      retouchPricePerImage: gallery.contract.pricePerExtraRetouch,
      retouchesIncluded: gallery.contract.retouchesIncluded,
      retouchesUsed,
    })

    if (calculation.totalDue === 0) {
      return NextResponse.json({ error: 'No payment due' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: calculation.totalDue,
            product_data: {
              name: `Final Payment - ${gallery.title}`,
              description: `Balance: $${(calculation.balanceRemaining / 100).toFixed(2)}${
                calculation.extraRetouches > 0
                  ? ` + ${calculation.extraRetouches} extra retouches ($${(calculation.extraRetouchCost / 100).toFixed(2)})`
                  : ''
              }`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: gallery.client.email,
      metadata: {
        type: 'FINAL_BALANCE',
        galleryId: gallery.id,
        contractId: gallery.contractId!,
        userId: session.user.id,
      },
      success_url: `${env.NEXT_PUBLIC_APP_URL}/client/${gallery.slug}?payment=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/client/${gallery.slug}`,
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })
  } catch (error) {
    logger.error({ err: error }, 'Stripe session creation error')
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
