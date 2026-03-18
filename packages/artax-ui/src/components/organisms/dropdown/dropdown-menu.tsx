'use client'
// ABOUTME: DropdownMenu with Radix primitive for accessible menu behavior.
// ABOUTME: Primary exports are interactive Dropdown components; *Primitive variants are static HTML shells without Radix dependencies.
import { DropdownMenu } from 'radix-ui'
import { cn } from '../../../lib/utils'

function DropdownContentPrimitive({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-popover border border-border p-1 shadow-md',
        className
      )}
      {...props}
    />
  )
}

function DropdownItemPrimitive({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'cursor-pointer px-3 py-2 font-mono text-sm text-popover-foreground transition-colors hover:bg-muted',
        className
      )}
      {...props}
    />
  )
}

function DropdownSeparatorPrimitive({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('my-1 h-px bg-border', className)}
      {...props}
    />
  )
}

const Dropdown = DropdownMenu.Root

const DropdownTrigger = DropdownMenu.Trigger

function DropdownContent({
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

function DropdownItem({
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

function DropdownSeparator({
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

function DropdownLabel({
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
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  DropdownContentPrimitive,
  DropdownItemPrimitive,
  DropdownSeparatorPrimitive
}
