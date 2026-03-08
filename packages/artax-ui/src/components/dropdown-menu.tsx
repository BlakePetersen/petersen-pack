// ABOUTME: Server-safe DropdownMenu structure components with terminal aesthetic.
// ABOUTME: Visual shells for dropdown layout; interactivity added by dropdown-interactive.tsx.
import { cn } from '../lib/utils'

function DropdownContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-terminal-surface border border-terminal-border p-1 shadow-md',
        className
      )}
      {...props}
    />
  )
}

function DropdownItem({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'cursor-pointer px-3 py-2 font-mono text-sm text-terminal-text transition-colors hover:bg-terminal-active',
        className
      )}
      {...props}
    />
  )
}

function DropdownSeparator({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('my-1 h-px bg-terminal-border', className)}
      {...props}
    />
  )
}

export { DropdownContent, DropdownItem, DropdownSeparator }
