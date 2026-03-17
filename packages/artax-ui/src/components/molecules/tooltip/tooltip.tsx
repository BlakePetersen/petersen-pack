// ABOUTME: Server-safe Tooltip structure component with terminal aesthetic.
// ABOUTME: Visual shell for tooltip content; interactivity added by tooltip-interactive.tsx.
import { cn } from '../../../lib/utils'

function TooltipContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-popover border border-border px-3 py-1.5 font-mono text-xs text-popover-foreground shadow-md',
        className
      )}
      {...props}
    />
  )
}

export { TooltipContent }
