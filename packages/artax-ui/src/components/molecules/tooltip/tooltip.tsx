'use client'
// ABOUTME: Tooltip with Radix primitive for accessible tooltip behavior.
// ABOUTME: Primary exports are interactive Tooltip components; TooltipContentPrimitive is the static HTML shell without Radix dependencies.
import { Tooltip as RadixTooltip } from 'radix-ui'
import { cn } from '../../../lib/utils'

function TooltipContentPrimitive({
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

const TooltipProvider = RadixTooltip.Provider

const Tooltip = RadixTooltip.Root

const TooltipTrigger = RadixTooltip.Trigger

function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof RadixTooltip.Content>) {
  return (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 bg-popover border border-border px-3 py-1.5 font-mono text-xs text-popover-foreground shadow-md',
          className
        )}
        {...props}
      />
    </RadixTooltip.Portal>
  )
}

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipContentPrimitive
}
