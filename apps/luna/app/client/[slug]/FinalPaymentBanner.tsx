'use client'

// ABOUTME: Banner component for final payment on client gallery
// ABOUTME: Shows payment breakdown and Stripe checkout button

import { useState } from 'react'
import type { PaymentCalculation } from '@/lib/calculate-final-payment'
import { logger } from '@/lib/logger.edge'

interface FinalPaymentBannerProps {
  galleryId: string
  calculation: PaymentCalculation
  expiresAt: Date | null
}

export function FinalPaymentBanner({
  galleryId,
  calculation,
  expiresAt,
}: FinalPaymentBannerProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/create-final-payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment session')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      logger.error({ err: error }, 'Payment error')
      setLoading(false)
    }
  }

  const daysRemaining = expiresAt
    ? Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="mb-8 border-l-4 border-amber-500 bg-amber-50 p-6">
      <h3 className="mb-4 text-lg font-semibold">Final Payment Required</h3>

      <div className="mb-4 space-y-2">
        <div className="flex justify-between">
          <span>Remaining Balance:</span>
          <span className="font-medium">
            ${(calculation.balanceRemaining / 100).toFixed(2)}
          </span>
        </div>

        {calculation.extraRetouches > 0 && (
          <div className="flex justify-between">
            <span>Extra Retouches ({calculation.extraRetouches}):</span>
            <span className="font-medium">
              ${(calculation.extraRetouchCost / 100).toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between border-t pt-2 text-xl font-bold">
          <span>Total Due:</span>
          <span>${(calculation.totalDue / 100).toFixed(2)}</span>
        </div>
      </div>

      {daysRemaining !== null && (
        <p className="mb-4 text-sm text-amber-800">
          Gallery expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
        </p>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  )
}
