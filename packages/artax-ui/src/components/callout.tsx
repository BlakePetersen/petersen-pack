// ABOUTME: Terminal-styled Callout/admonition with left border accent.
// ABOUTME: Supports info, warning, error, success variants with semantic terminal colors.
import { cn } from '../lib/utils'

const variantStyles = {
  info: 'border-l-terminal-cyan',
  warning: 'border-l-amber-accent',
  error: 'border-l-terminal-red',
  success: 'border-l-terminal-green'
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
        'bg-terminal-surface border border-terminal-border border-l-4 p-4 font-mono text-sm text-terminal-text',
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
