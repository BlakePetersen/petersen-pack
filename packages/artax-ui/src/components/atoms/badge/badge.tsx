// ABOUTME: Terminal-styled Badge with monospace font and amber/outline/secondary variants.
// ABOUTME: Uses cva for variant props and cn() for class merging.
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center px-2 py-0.5 font-mono text-xs transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-amber-accent text-terminal-bg',
        outline: 'border border-terminal-border text-terminal-text',
        secondary: 'bg-terminal-active text-terminal-secondary'
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
