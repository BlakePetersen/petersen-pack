// ABOUTME: Terminal-styled Callout/admonition with left border accent.
// ABOUTME: Supports info, warning, error, success variants with semantic terminal colors.
import { cn } from '../../../lib/utils'

const variantStyles = {
  info: 'border-l-info',
  warning: 'border-l-warning',
  error: 'border-l-destructive',
  success: 'border-l-success'
} as const

type CalloutVariant = keyof typeof variantStyles

function Callout({
  className,
  variant = 'info',
  children,
  ...props
}: React.ComponentProps<'div'> & { variant?: CalloutVariant }) {
  return (
    <div
      className={cn(
        'bg-card border border-border border-l-4 p-4 font-mono text-sm text-foreground',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Callout }
export type { CalloutVariant }
