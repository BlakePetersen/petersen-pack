// ABOUTME: Terminal-styled Table with box-drawing border aesthetic and monospace font.
// ABOUTME: Exports Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption.
import { cn } from '../../../lib/utils'

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <table
      className={cn(
        'w-full border-collapse font-mono text-sm border border-terminal-border',
        className
      )}
      {...props}
    />
  )
}

function TableHeader({
  className,
  ...props
}: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cn('border-b border-terminal-border', className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody className={cn('', className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b border-terminal-border transition-colors hover:bg-terminal-active',
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-10 px-4 text-left align-middle font-mono font-medium text-terminal-muted',
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn('p-4 align-middle text-terminal-text', className)}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      className={cn(
        'mt-4 text-sm font-mono text-terminal-muted',
        className
      )}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption
}
