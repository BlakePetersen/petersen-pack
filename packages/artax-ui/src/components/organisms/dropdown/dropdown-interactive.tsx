'use client'
// ABOUTME: Client-side DropdownMenu with Radix primitive for accessible menu behavior.
// ABOUTME: Wraps Radix DropdownMenu with terminal surface, border, and hover styling.
import { DropdownMenu } from 'radix-ui'
import { cn } from '../../../lib/utils'

const DropdownInteractive = DropdownMenu.Root

const DropdownInteractiveTrigger = DropdownMenu.Trigger

function DropdownInteractiveContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[8rem] bg-popover border border-border p-1 shadow-md',
          className
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  )
}

function DropdownInteractiveItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Item>) {
  return (
    <DropdownMenu.Item
      className={cn(
        'cursor-pointer px-3 py-2 font-mono text-sm text-popover-foreground outline-none transition-colors hover:bg-muted focus:bg-muted',
        className
      )}
      {...props}
    />
  )
}

function DropdownInteractiveSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Separator>) {
  return (
    <DropdownMenu.Separator
      className={cn('my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

function DropdownInteractiveLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Label>) {
  return (
    <DropdownMenu.Label
      className={cn(
        'px-3 py-2 font-mono text-xs text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownInteractive,
  DropdownInteractiveTrigger,
  DropdownInteractiveContent,
  DropdownInteractiveItem,
  DropdownInteractiveSeparator,
  DropdownInteractiveLabel
}
