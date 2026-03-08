// ABOUTME: Terminal-styled Button with $ command prefix and [bracket] ghost variant.
// ABOUTME: Uses cva for variant/size props and cn() for class merging.
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-mono text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-accent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-amber-accent text-terminal-bg hover:bg-amber-accent/90',
        ghost:
          'text-terminal-muted hover:text-terminal-text hover:bg-terminal-active',
        outline:
          'border border-terminal-border text-terminal-text hover:border-amber-accent'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-6'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

function Button({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {(variant === 'default' || variant == null) && (
        <span className="mr-1">$</span>
      )}
      {variant === 'ghost' && <span className="mr-1">[</span>}
      {children}
      {variant === 'ghost' && <span className="ml-1">]</span>}
    </button>
  )
}

export { Button, buttonVariants }
