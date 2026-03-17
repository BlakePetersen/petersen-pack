'use client'
// ABOUTME: Dialog with Radix primitive for accessible modal behavior.
// ABOUTME: Primary exports are interactive Dialog components; *Primitive variants are static HTML shells without Radix dependencies.
import { Dialog as RadixDialog } from 'radix-ui'
import { cn } from '../../../lib/utils'

function DialogOverlayPrimitive({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('fixed inset-0 bg-black/80', className)}
      {...props}
    />
  )
}

function DialogContentPrimitive({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-card border border-border p-6 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitlePrimitive({
  className,
  ...props
}: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'font-mono text-lg font-medium text-foreground',
        className
      )}
      {...props}
    />
  )
}

function DialogDescriptionPrimitive({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

const Dialog = RadixDialog.Root

const DialogTrigger = RadixDialog.Trigger

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Overlay>) {
  return (
    <RadixDialog.Overlay
      className={cn(
        'fixed inset-0 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadixDialog.Content>) {
  return (
    <RadixDialog.Portal>
      <DialogOverlay />
      <RadixDialog.Content
        className={cn(
          'fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-card border border-border p-6 shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      className={cn(
        'font-mono text-lg font-medium text-foreground',
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function DialogClose({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Close>) {
  return (
    <RadixDialog.Close
      className={cn(
        'absolute right-4 top-4 font-mono text-muted-foreground hover:text-primary transition-colors',
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlayPrimitive,
  DialogContentPrimitive,
  DialogTitlePrimitive,
  DialogDescriptionPrimitive
}
