// ABOUTME: Server-safe code block wrapper with header bar, filename, and language badge.
// ABOUTME: Renders Shiki-processed HTML output with terminal chrome and copy button.
import { cn } from '../../../lib/utils'
import { CopyButton } from '../../atoms/copy-button/copy-button'

function CodeBlock({
  className,
  filename,
  language,
  rawCode,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  filename?: string
  language?: string
  rawCode?: string
}) {
  const showHeader = Boolean(filename || language)

  return (
    <div
      className={cn(
        'bg-card border border-border my-4 overflow-hidden font-mono text-sm',
        className,
      )}
      {...props}
    >
      {showHeader && (
        <div
          className="flex items-center justify-between border-b border-border px-4 py-2"
          data-testid="code-header"
        >
          <span className="text-muted-foreground text-xs">
            {filename ? `// ${filename}` : ''}
          </span>
          {language && (
            <span className="bg-muted text-secondary-foreground px-1.5 py-0.5 text-xs rounded">
              {language}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <div
          className={cn(
            'overflow-x-auto',
            '[&_pre]:!bg-transparent [&_pre]:!p-4 [&_pre]:!m-0',
            '[&_.highlighted]:bg-primary/10',
          )}
        >
          {children}
        </div>
        {rawCode && (
          <CopyButton
            text={rawCode}
            className="absolute top-2 right-2"
          />
        )}
      </div>
    </div>
  )
}

export { CodeBlock }
