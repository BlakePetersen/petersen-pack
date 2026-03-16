'use client'
// ABOUTME: Client-side Toggle with Radix primitive for accessible toggle behavior.
// ABOUTME: Wraps Radix Toggle with terminal border and amber pressed state.
import { Toggle } from 'radix-ui'
import { cn } from '../../../lib/utils'

function ToggleInteractive({
  className,
  ...props
}: React.ComponentProps<typeof Toggle.Root>) {
  return (
    <Toggle.Root
      className={cn(
        'inline-flex items-center justify-center border border-border px-3 py-2 font-mono text-sm text-foreground transition-colors hover:bg-muted data-[state=on]:bg-muted data-[state=on]:text-primary',
        className
      )}
      {...props}
    />
  )
}

export { ToggleInteractive }
