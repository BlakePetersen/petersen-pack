// ABOUTME: Server-safe Toggle structure component with terminal aesthetic.
// ABOUTME: Visual shell for toggle button; interactivity added by toggle-interactive.tsx.
import { cn } from '../../../lib/utils'

function ToggleBase({
  className,
  ...props
}: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center border border-border px-3 py-2 font-mono text-sm text-foreground transition-colors hover:bg-muted',
        className
      )}
      {...props}
    />
  )
}

export { ToggleBase }
