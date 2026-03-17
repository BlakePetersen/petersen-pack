'use client'
// ABOUTME: Client-side Tooltip with Radix primitive for accessible tooltip behavior.
// ABOUTME: Wraps Radix Tooltip with terminal surface, border, and monospace styling.
import { Tooltip } from 'radix-ui'
import { cn } from '../../../lib/utils'

const TooltipInteractiveProvider = Tooltip.Provider

const TooltipInteractive = Tooltip.Root

const TooltipInteractiveTrigger = Tooltip.Trigger

function TooltipInteractiveContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof Tooltip.Content>) {
  return (
    <Tooltip.Portal>
      <Tooltip.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 bg-popover border border-border px-3 py-1.5 font-mono text-xs text-popover-foreground shadow-md',
          className
        )}
        {...props}
      />
    </Tooltip.Portal>
  )
}

export {
  TooltipInteractiveProvider,
  TooltipInteractive,
  TooltipInteractiveTrigger,
  TooltipInteractiveContent
}
