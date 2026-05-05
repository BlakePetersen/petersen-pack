// ABOUTME: Numbered process steps in responsive grid
// ABOUTME: Used for "How It Works" and "What to Expect" sections

type Step = {
  title: string
  description: string
}

type ProcessStepsProps = {
  steps: Step[]
  columns?: 2 | 3
}

export function ProcessSteps({ steps, columns }: ProcessStepsProps) {
  // Auto-determine columns: 3 or fewer steps = match count, more = 2 columns
  const colCount = columns ?? (steps.length <= 3 ? steps.length : 2)
  const gridClass =
    colCount === 3 ? 'md:grid-cols-3' : colCount === 2 ? 'md:grid-cols-2' : ''

  return (
    <div className={`grid gap-8 ${gridClass}`}>
      {steps.map((step, index) => (
        <div
          key={index}
          className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 font-serif text-2xl text-white transition-transform group-hover:scale-110 dark:bg-white dark:text-gray-900">
            {index + 1}
          </div>
          <h3 className="mb-3 font-serif text-xl text-gray-900 dark:text-white">
            {step.title}
          </h3>
          <p className="leading-relaxed text-gray-600 dark:text-gray-400">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  )
}
