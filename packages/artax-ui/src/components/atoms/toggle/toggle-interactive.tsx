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
        'inline-flex items-center justify-center border border-terminal-border px-3 py-2 font-mono text-sm text-terminal-text transition-colors hover:bg-terminal-active data-[state=on]:bg-terminal-active data-[state=on]:text-amber-accent',
        className
      )}
      {...props}
    />
  )
}

export { ToggleInteractive }
