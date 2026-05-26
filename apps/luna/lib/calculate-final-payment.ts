// ABOUTME: Calculates final payment amount for client galleries
// ABOUTME: Handles package balance, extra retouches, and prevents negative values

export interface PaymentInput {
  packagePrice: number // in cents
  depositAmount: number // in cents
  retouchPricePerImage: number // in cents
  retouchesIncluded: number
  retouchesUsed: number
}

export interface PaymentCalculation {
  packagePrice: number
  depositAmount: number
  balanceRemaining: number
  retouchesIncluded: number
  retouchesUsed: number
  extraRetouches: number
  retouchPricePerImage: number
  extraRetouchCost: number
  totalDue: number
}

export function calculateFinalPayment(input: PaymentInput): PaymentCalculation {
  const {
    packagePrice,
    depositAmount,
    retouchPricePerImage,
    retouchesIncluded,
    retouchesUsed,
  } = input

  // Calculate remaining balance from package (prevent negative)
  const balanceRemaining = Math.max(0, packagePrice - depositAmount)

  // Calculate extra retouches (prevent negative)
  const extraRetouches = Math.max(0, retouchesUsed - retouchesIncluded)

  // Calculate cost of extra retouches
  const extraRetouchCost = extraRetouches * retouchPricePerImage

  // Calculate total due (prevent negative)
  const totalDue = Math.max(0, balanceRemaining + extraRetouchCost)

  return {
    packagePrice,
    depositAmount,
    balanceRemaining,
    retouchesIncluded,
    retouchesUsed,
    extraRetouches,
    retouchPricePerImage,
    extraRetouchCost,
    totalDue,
  }
}
