'use client'
// ABOUTME: Tabs with Radix primitive for accessible tab navigation.
// ABOUTME: Primary exports are interactive Tabs components; *Primitive variants are static HTML shells without Radix dependencies.
import { Tabs as RadixTabs } from 'radix-ui'
import { cn } from '../../../lib/utils'

function TabsListPrimitive({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex border-b border-border',
        className
      )}
      {...props}
    />
  )
}

function TabsTriggerPrimitive({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'px-4 py-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground',
        className
      )}
      {...props}
    />
  )
}

function TabsContentPrimitive({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('pt-4 text-sm text-foreground', className)}
      {...props}
    />
  )
}

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof RadixTabs.Root>) {
  return (
    <RadixTabs.Root
      className={cn('w-full', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn(
        'flex border-b border-border',
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'px-4 py-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary',
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof RadixTabs.Content>) {
  return (
    <RadixTabs.Content
      className={cn('pt-4 text-sm text-foreground', className)}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsListPrimitive,
  TabsTriggerPrimitive,
  TabsContentPrimitive
}
