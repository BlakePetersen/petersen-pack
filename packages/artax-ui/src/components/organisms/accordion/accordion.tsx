'use client'
// ABOUTME: Accordion with Radix primitive for keyboard/focus management.
// ABOUTME: Primary exports are interactive Accordion components; *Primitive variants are static HTML shells without Radix dependencies.
import { Accordion as RadixAccordion } from 'radix-ui'
import { cn } from '../../../lib/utils'

function AccordionItemPrimitive({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('border-b border-border', className)}
      {...props}
    />
  )
}

function AccordionTriggerPrimitive({
  className,
  children,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'flex w-full items-center justify-between py-4 font-mono text-sm text-foreground transition-colors hover:text-primary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function AccordionContentPrimitive({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('pb-4 text-sm text-secondary-foreground', className)}
      {...props}
    />
  )
}

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof RadixAccordion.Root>) {
  return (
    <RadixAccordion.Root
      className={cn('w-full', className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof RadixAccordion.Item>) {
  return (
    <RadixAccordion.Item
      className={cn('border-b border-border', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadixAccordion.Trigger>) {
  return (
    <RadixAccordion.Header className="flex">
      <RadixAccordion.Trigger
        className={cn(
          'flex flex-1 items-center justify-between py-4 font-mono text-sm text-foreground transition-colors hover:text-primary [&[data-state=open]]:text-primary',
          className
        )}
        {...props}
      >
        {children}
      </RadixAccordion.Trigger>
    </RadixAccordion.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadixAccordion.Content>) {
  return (
    <RadixAccordion.Content
      className={cn(
        'overflow-hidden text-sm text-secondary-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className
      )}
      {...props}
    >
      <div className="pb-4">{children}</div>
    </RadixAccordion.Content>
  )
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionItemPrimitive,
  AccordionTriggerPrimitive,
  AccordionContentPrimitive
}
