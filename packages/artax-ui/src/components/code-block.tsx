// ABOUTME: Terminal-styled code block wrapper with $ prompt and optional filename.
// ABOUTME: Provides visual chrome around code content with terminal surface styling.
import { cn } from '../lib/utils'

function CodeBlock({
  className,
  filename,
  children,
  ...props
}: React.ComponentProps<'div'> & { filename?: string }) {
  return (
    <div
      className={cn(
        'bg-terminal-surface border border-terminal-border font-mono text-sm',
        className
      )}
      {...props}
    >
      {filename && (
        <div className="border-b border-terminal-border px-4 py-2">
          <span className="text-terminal-muted">{filename}</span>
        </div>
      )}
      <div className="p-4">
        <span className="text-terminal-muted mr-2">$</span>
        <span className="text-terminal-text">{children}</span>
      </div>
    </div>
  )
}

export { CodeBlock }
