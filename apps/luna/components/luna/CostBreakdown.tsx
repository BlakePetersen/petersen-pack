// ABOUTME: Organism - Cost breakdown display for order confirmation
// ABOUTME: Shows line items and total cost calculation

type CostBreakdownProps = {
  retouchCount: number
  pricePerRetouch: number
}

export default function CostBreakdown({
  retouchCount,
  pricePerRetouch,
}: CostBreakdownProps) {
  const totalCost = retouchCount * pricePerRetouch

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Cost Summary
      </h3>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Favorite Images</span>
          <span>Free</span>
        </div>
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>
            Retouching ({retouchCount} × ${pricePerRetouch})
          </span>
          <span>${totalCost}</span>
        </div>
        <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
            <span>Total</span>
            <span>${totalCost}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
