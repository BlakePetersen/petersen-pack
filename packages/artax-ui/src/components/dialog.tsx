// ABOUTME: Server-safe Dialog structure components with terminal aesthetic.
// ABOUTME: Visual shells for dialog layout; interactivity added by dialog-interactive.tsx.
import { cn } from '../lib/utils'

function DialogOverlay({
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

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-terminal-surface border border-terminal-border p-6 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'font-mono text-lg font-medium text-terminal-text',
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm text-terminal-muted', className)}
      {...props}
    />
  )
}

export { DialogOverlay, DialogContent, DialogTitle, DialogDescription }
