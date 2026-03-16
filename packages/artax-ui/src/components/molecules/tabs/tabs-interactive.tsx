'use client'
// ABOUTME: Client-side Tabs with Radix primitive for accessible tab navigation.
// ABOUTME: Wraps Radix Tabs with terminal border, amber active indicator, and monospace styling.
import { Tabs } from 'radix-ui'
import { cn } from '../../../lib/utils'

function TabsInteractive({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.Root>) {
  return (
    <Tabs.Root
      className={cn('w-full', className)}
      {...props}
    />
  )
}

function TabsInteractiveList({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.List>) {
  return (
    <Tabs.List
      className={cn(
        'flex border-b border-terminal-border',
        className
      )}
      {...props}
    />
  )
}

function TabsInteractiveTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.Trigger>) {
  return (
    <Tabs.Trigger
      className={cn(
        'px-4 py-2 font-mono text-sm text-terminal-muted transition-colors hover:text-terminal-text data-[state=active]:text-amber-accent data-[state=active]:border-b-2 data-[state=active]:border-amber-accent',
        className
      )}
      {...props}
    />
  )
}

function TabsInteractiveContent({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.Content>) {
  return (
    <Tabs.Content
      className={cn('pt-4 text-sm text-terminal-text', className)}
      {...props}
    />
  )
}

export {
  TabsInteractive,
  TabsInteractiveList,
  TabsInteractiveTrigger,
  TabsInteractiveContent
}
