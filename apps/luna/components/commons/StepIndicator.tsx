// ABOUTME: Atom - Single step indicator circle with number
// ABOUTME: Basic building block for progress displays

type StepIndicatorProps = {
  number: number
  label: string
  isActive: boolean
}

export default function StepIndicator({
  number,
  label,
  isActive,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
          isActive
            ? 'bg-accent-600 text-white shadow-sm dark:bg-accent-500'
            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}
      >
        {number}
      </div>
      <span
        className={`text-sm font-medium transition-colors ${
          isActive
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
