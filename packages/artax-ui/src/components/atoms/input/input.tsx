// ABOUTME: Terminal-styled Input with monospace font and amber focus ring.
// ABOUTME: Uses cn() for class merging with terminal border and placeholder styling.
import { cn } from '../../../lib/utils'

function Input({
  className,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'flex h-9 w-full border border-border bg-background px-3 py-1 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export { Input }
