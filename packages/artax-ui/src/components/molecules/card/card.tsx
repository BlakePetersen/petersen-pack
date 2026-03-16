// ABOUTME: Terminal-styled Card with surface background, border, and // header prefix.
// ABOUTME: Exports Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter.
import { cn } from '../../../lib/utils'

function Card({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'border border-terminal-border bg-terminal-surface text-terminal-text',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6 font-mono', className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  children,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'font-mono text-sm font-medium leading-none tracking-tight',
        className
      )}
      {...props}
    >
      <span className="text-terminal-muted">// </span>
      {children}
    </div>
  )
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-sm text-terminal-muted', className)}
      {...props}
    />
  )
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
