'use client'
// ABOUTME: Client-side Dialog with Radix primitive for accessible modal behavior.
// ABOUTME: Wraps Radix Dialog with terminal overlay, surface, and border styling.
import { Dialog } from 'radix-ui'
import { cn } from '../../../lib/utils'

const DialogInteractive = Dialog.Root

const DialogInteractiveTrigger = Dialog.Trigger

function DialogInteractiveOverlay({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Overlay>) {
  return (
    <Dialog.Overlay
      className={cn(
        'fixed inset-0 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
}

function DialogInteractiveContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <DialogInteractiveOverlay />
      <Dialog.Content
        className={cn(
          'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-card border border-border p-6 shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

function DialogInteractiveTitle({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      className={cn(
        'font-mono text-lg font-medium text-foreground',
        className
      )}
      {...props}
    />
  )
}

function DialogInteractiveDescription({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function DialogInteractiveClose({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Close>) {
  return (
    <Dialog.Close
      className={cn(
        'absolute right-4 top-4 font-mono text-muted-foreground hover:text-primary transition-colors',
        className
      )}
      {...props}
    />
  )
}

export {
  DialogInteractive,
  DialogInteractiveTrigger,
  DialogInteractiveContent,
  DialogInteractiveOverlay,
  DialogInteractiveTitle,
  DialogInteractiveDescription,
  DialogInteractiveClose
}
