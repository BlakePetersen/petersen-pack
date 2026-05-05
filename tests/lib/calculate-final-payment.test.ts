// ABOUTME: Unit tests for final payment calculation logic
// ABOUTME: Tests various scenarios including extra retouches and zero balance cases

import { describe, it, expect } from 'vitest'
import {
  calculateFinalPayment,
  type PaymentInput,
} from '@/lib/calculate-final-payment'

describe('calculateFinalPayment', () => {
  it('calculates correctly with no extra retouches', () => {
    const input: PaymentInput = {
      packagePrice: 500000, // $5,000
      depositAmount: 200000, // $2,000
      retouchPricePerImage: 7500, // $75
      retouchesIncluded: 50,
      retouchesUsed: 30,
    }

    const result = calculateFinalPayment(input)

    expect(result).toEqual({
      packagePrice: 500000,
      depositAmount: 200000,
      balanceRemaining: 300000, // $3,000
      retouchesIncluded: 50,
      retouchesUsed: 30,
      extraRetouches: 0,
      retouchPricePerImage: 7500,
      extraRetouchCost: 0,
      totalDue: 300000, // $3,000
    })
  })

  it('calculates correctly with extra retouches', () => {
    const input: PaymentInput = {
      packagePrice: 500000, // $5,000
      depositAmount: 200000, // $2,000
      retouchPricePerImage: 7500, // $75
      retouchesIncluded: 50,
      retouchesUsed: 65, // 15 extra
    }

    const result = calculateFinalPayment(input)

    expect(result).toEqual({
      packagePrice: 500000,
      depositAmount: 200000,
      balanceRemaining: 300000, // $3,000
      retouchesIncluded: 50,
      retouchesUsed: 65,
      extraRetouches: 15,
      retouchPricePerImage: 7500,
      extraRetouchCost: 112500, // 15 * $75 = $1,125
      totalDue: 412500, // $3,000 + $1,125 = $4,125
    })
  })

  it('calculates correctly with zero balance (deposit covers everything)', () => {
    const input: PaymentInput = {
      packagePrice: 500000, // $5,000
      depositAmount: 500000, // $5,000 (full amount)
      retouchPricePerImage: 7500, // $75
      retouchesIncluded: 50,
      retouchesUsed: 40,
    }

    const result = calculateFinalPayment(input)

    expect(result).toEqual({
      packagePrice: 500000,
      depositAmount: 500000,
      balanceRemaining: 0,
      retouchesIncluded: 50,
      retouchesUsed: 40,
      extraRetouches: 0,
      retouchPricePerImage: 7500,
      extraRetouchCost: 0,
      totalDue: 0,
    })
  })

  it('prevents negative values when deposit exceeds package price', () => {
    const input: PaymentInput = {
      packagePrice: 500000, // $5,000
      depositAmount: 600000, // $6,000 (overpayment)
      retouchPricePerImage: 7500, // $75
      retouchesIncluded: 50,
      retouchesUsed: 40,
    }

    const result = calculateFinalPayment(input)

    expect(result.balanceRemaining).toBe(0) // Should not be negative
    expect(result.totalDue).toBe(0) // Should not be negative
  })
})
