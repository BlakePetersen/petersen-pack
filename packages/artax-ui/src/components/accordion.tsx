// ABOUTME: Server-safe Accordion structure components with terminal aesthetic.
// ABOUTME: Visual shells for accordion layout; interactivity added by accordion-interactive.tsx.
import { cn } from '../lib/utils'

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('border-b border-terminal-border', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'flex w-full items-center justify-between py-4 font-mono text-sm text-terminal-text transition-colors hover:text-amber-accent',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function AccordionContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('pb-4 text-sm text-terminal-secondary', className)}
      {...props}
    />
  )
}

export { AccordionItem, AccordionTrigger, AccordionContent }
