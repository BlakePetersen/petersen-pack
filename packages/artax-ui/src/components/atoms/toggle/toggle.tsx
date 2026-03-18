'use client'
// ABOUTME: Toggle button with Radix primitive for accessible toggle behavior.
// ABOUTME: Primary export is the interactive Toggle; TogglePrimitive is the static HTML shell without Radix dependencies.
import { Toggle as RadixToggle } from 'radix-ui'
import { cn } from '../../../lib/utils'

function TogglePrimitive({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center border border-border px-3 py-2 font-mono text-sm text-foreground transition-colors hover:bg-muted',
        className
      )}
      {...props}
    />
  )
}

function Toggle({
  className,
  ...props
}: React.ComponentProps<typeof RadixToggle.Root>) {
  return (
    <RadixToggle.Root
      className={cn(
        'inline-flex items-center justify-center border border-border px-3 py-2 font-mono text-sm text-foreground transition-colors hover:bg-muted data-[state=on]:bg-muted data-[state=on]:text-primary',
        className
      )}
      {...props}
    />
  )
}

export { Toggle, TogglePrimitive }
