// ABOUTME: Terminal-styled Badge with monospace font and amber/outline/secondary variants.
// ABOUTME: Uses cva for variant props and cn() for class merging.
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 font-mono text-xs transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-border text-foreground',
        secondary: 'bg-muted text-secondary-foreground',
        info: 'bg-[var(--surface-info)] text-info',
        success: 'bg-[var(--surface-success)] text-success',
        warning: 'bg-[var(--surface-warning)] text-warning',
        destructive: 'bg-destructive/10 text-destructive'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  )
}

export { Badge, badgeVariants }
