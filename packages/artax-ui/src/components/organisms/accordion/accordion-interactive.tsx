'use client'
// ABOUTME: Client-side Accordion with Radix primitive for keyboard/focus management.
// ABOUTME: Wraps Radix Accordion with terminal aesthetic styling.
import { Accordion } from 'radix-ui'
import { cn } from '../../../lib/utils'

function AccordionInteractive({
  className,
  ...props
}: React.ComponentProps<typeof Accordion.Root>) {
  return (
    <Accordion.Root
      className={cn('w-full', className)}
      {...props}
    />
  )
}

function AccordionInteractiveItem({
  className,
  ...props
}: React.ComponentProps<typeof Accordion.Item>) {
  return (
    <Accordion.Item
      className={cn('border-b border-terminal-border', className)}
      {...props}
    />
  )
}

function AccordionInteractiveTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Accordion.Trigger>) {
  return (
    <Accordion.Header className="flex">
      <Accordion.Trigger
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-mono text-sm text-terminal-text transition-colors hover:text-amber-accent [&[data-state=open]]:text-amber-accent',
          className
        )}
        {...props}
      >
        {children}
      </Accordion.Trigger>
    </Accordion.Header>
  )
}

function AccordionInteractiveContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Accordion.Content>) {
  return (
    <Accordion.Content
      className={cn(
        'overflow-hidden text-sm text-terminal-secondary data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className
      )}
      {...props}
    >
      <div className="pb-4">{children}</div>
    </Accordion.Content>
  )
}

export {
  AccordionInteractive,
  AccordionInteractiveItem,
  AccordionInteractiveTrigger,
  AccordionInteractiveContent
}
