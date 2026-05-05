// ABOUTME: Reusable badge component with multiple variants
// ABOUTME: Supports solid, primary, outline, and accent styles with optional dismiss

import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all backdrop-blur-xl',
  {
    variants: {
      variant: {
        solid:
          'bg-white/90 text-gray-900 shadow-soft backdrop-blur-sm dark:bg-gray-900/90 dark:text-white',
        primary: 'text-white shadow-soft',
        outline:
          'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300',
        accent:
          'bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  }
)

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

export function Badge({
  children,
  variant,
  dismissible,
  onDismiss,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant }), className)}
      style={
        variant === 'primary'
          ? {
              background:
                'linear-gradient(135deg, rgba(251, 146, 60, 0.9), rgba(244, 114, 182, 0.9), rgba(168, 85, 247, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }
          : undefined
      }
    >
      {children}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-1 transition-opacity hover:opacity-80"
          aria-label="Dismiss"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  )
}
