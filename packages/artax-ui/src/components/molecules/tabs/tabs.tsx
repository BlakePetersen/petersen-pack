// ABOUTME: Server-safe Tabs structure components with terminal aesthetic.
// ABOUTME: Visual shells for tab layout; interactivity added by tabs-interactive.tsx.
import { cn } from '../../../lib/utils'

function TabsList({
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

function TabsTrigger({
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

function TabsContent({
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

export { TabsList, TabsTrigger, TabsContent }
