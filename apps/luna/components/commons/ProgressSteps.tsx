// ABOUTME: Organism - Multi-step progress indicator
// ABOUTME: Displays all steps with separators and current step highlighting

import StepIndicator from './StepIndicator'

type Step = 'select-favorites' | 'select-retouch' | 'confirm'

type ProgressStepsProps = {
  currentStep: Step
  steps: Array<{
    id: Step
    number: number
    label: string
  }>
}

export default function ProgressSteps({
  currentStep,
  steps,
}: ProgressStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4 sm:gap-8">
              <StepIndicator
                number={step.number}
                label={step.label}
                isActive={currentStep === step.id}
              />
              {index < steps.length - 1 && (
                <div
                  className={`hidden h-0.5 w-8 sm:block sm:w-12 ${
                    index < currentIndex
                      ? 'bg-accent-400 dark:bg-accent-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
