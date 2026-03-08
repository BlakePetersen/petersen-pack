// ABOUTME: MDX component map with terminal-styled renderers for all MDX primitives.
// ABOUTME: Exports mdxComponents object for spreading into MDX providers in consuming apps.
import React from 'react'
import { cn } from '../lib/utils'
import { CodeBlock } from '../components/code-block'

type Props = React.ComponentPropsWithoutRef<'div'> & { children?: React.ReactNode }
type HeadingProps = React.ComponentPropsWithoutRef<'h1'>
type AnchorProps = React.ComponentPropsWithoutRef<'a'>
type ImgProps = React.ComponentPropsWithoutRef<'img'>
type TableCellProps = React.ComponentPropsWithoutRef<'td'>
type TableHeaderCellProps = React.ComponentPropsWithoutRef<'th'>

export const mdxComponents = {
  h1: ({ className, children, ...props }: HeadingProps) => (
    <h1
      className={cn(
        'font-mono text-2xl font-bold text-terminal-text mt-10 mb-4',
        className
      )}
      {...props}
    >
      <span className="text-terminal-muted">┌───</span>{' '}
      {children}{' '}
      <span className="text-terminal-muted">───┐</span>
    </h1>
  ),

  h2: ({ className, children, ...props }: HeadingProps) => (
    <h2
      className={cn(
        'font-mono text-xl font-bold text-terminal-text mt-8 mb-3',
        className
      )}
      {...props}
    >
      <span className="text-terminal-muted">// </span>
      {children}
    </h2>
  ),

  h3: ({ className, children, ...props }: HeadingProps) => (
    <h3
      className={cn(
        'font-mono text-lg font-semibold text-terminal-text mt-6 mb-2',
        className
      )}
      {...props}
    >
      <span className="text-terminal-muted">&gt; </span>
      {children}
    </h3>
  ),

  h4: ({ className, children, ...props }: HeadingProps) => (
    <h4
      className={cn(
        'font-mono text-base font-semibold text-terminal-secondary mt-4 mb-2',
        className
      )}
      {...props}
    >
      <span className="text-terminal-muted">&gt; </span>
      {children}
    </h4>
  ),

  h5: ({ className, children, ...props }: HeadingProps) => (
    <h5
      className={cn(
        'font-mono text-sm font-medium text-terminal-secondary mt-4 mb-1',
        className
      )}
      {...props}
    >
      <span className="text-terminal-disabled">&gt; </span>
      {children}
    </h5>
  ),

  h6: ({ className, children, ...props }: HeadingProps) => (
    <h6
      className={cn(
        'font-mono text-sm font-medium text-terminal-muted mt-4 mb-1',
        className
      )}
      {...props}
    >
      <span className="text-terminal-disabled">&gt; </span>
      {children}
    </h6>
  ),

  p: ({ className, ...props }: Props) => (
    <p
      className={cn('font-sans text-terminal-text leading-7 mb-4', className)}
      {...props}
    />
  ),

  a: ({ className, ...props }: AnchorProps) => (
    <a
      className={cn(
        'text-amber-accent underline-offset-4 hover:underline font-mono',
        className
      )}
      {...props}
    />
  ),

  ul: ({ className, ...props }: Props) => (
    <ul
      className={cn('list-disc list-inside mb-4 space-y-1 text-terminal-text', className)}
      {...props}
    />
  ),

  ol: ({ className, ...props }: Props) => (
    <ol
      className={cn('list-decimal list-inside mb-4 space-y-1 text-terminal-text', className)}
      {...props}
    />
  ),

  li: ({ className, ...props }: Props) => (
    <li
      className={cn('text-terminal-text', className)}
      {...props}
    />
  ),

  blockquote: ({ className, ...props }: Props) => (
    <blockquote
      className={cn(
        'border-l-2 border-amber-accent bg-terminal-surface pl-4 py-2 my-4 italic text-terminal-secondary',
        className
      )}
      {...props}
    />
  ),

  hr: ({ className, ...props }: React.ComponentPropsWithoutRef<'hr'>) => (
    <hr
      className={cn('border-none text-terminal-muted my-6', className)}
      {...props}
      style={{ display: 'none' }}
    />
  ),

  code: ({ className, ...props }: Props) => {
    // Shiki-processed code elements have inline styles; don't apply inline code styling to those
    const isShikiCode = className?.includes('shiki') || (props as Record<string, unknown>).style
    if (isShikiCode) {
      return <code className={className} {...props} />
    }
    return (
      <code
        className={cn(
          'bg-terminal-active text-amber-accent px-1 py-0.5 font-mono text-sm',
          className,
        )}
        {...props}
      />
    )
  },

  pre: ({ children, className, ...props }: Props) => {
    // Extract metadata from the Shiki-generated code child element
    const codeChild = React.Children.toArray(children).find(
      (child): child is React.ReactElement =>
        React.isValidElement(child) && (child as React.ReactElement).type === 'code',
    ) as React.ReactElement | undefined

    const codeProps = codeChild?.props as Record<string, unknown> | undefined
    const language = (codeProps?.['data-language'] as string) || undefined
    const meta = (codeProps?.['data-meta'] as string) || ''
    const titleMatch = meta.match(/title="([^"]+)"/)
    const filename = titleMatch?.[1] || undefined

    // Extract raw code text for copy button
    function extractText(node: React.ReactNode): string {
      if (typeof node === 'string') return node
      if (typeof node === 'number') return String(node)
      if (!React.isValidElement(node)) return ''
      const el = node as React.ReactElement
      const elProps = el.props as { children?: React.ReactNode }
      return React.Children.toArray(elProps.children).map(extractText).join('')
    }
    const rawCode = codeChild ? extractText(codeChild) : undefined

    return (
      <CodeBlock
        filename={filename}
        language={language}
        rawCode={rawCode}
        className={className}
      >
        <pre className={(props as Record<string, unknown>).className as string} {...props}>
          {children}
        </pre>
      </CodeBlock>
    )
  },

  table: ({ className, ...props }: Props) => (
    <div className="my-4 w-full overflow-auto">
      <table
        className={cn('w-full border-collapse font-mono text-sm', className)}
        {...props}
      />
    </div>
  ),

  thead: ({ className, ...props }: Props) => (
    <thead
      className={cn('border-b border-terminal-border', className)}
      {...props}
    />
  ),

  tbody: ({ className, ...props }: Props) => (
    <tbody className={cn('', className)} {...props} />
  ),

  tr: ({ className, ...props }: Props) => (
    <tr
      className={cn('border-b border-terminal-border', className)}
      {...props}
    />
  ),

  th: ({ className, ...props }: TableHeaderCellProps) => (
    <th
      className={cn(
        'text-left p-2 font-bold text-terminal-muted',
        className
      )}
      {...props}
    />
  ),

  td: ({ className, ...props }: TableCellProps) => (
    <td
      className={cn('p-2 text-terminal-text', className)}
      {...props}
    />
  ),

  img: ({ className, alt, ...props }: ImgProps) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cn('border border-terminal-border my-4', className)}
      alt={alt}
      {...props}
    />
  ),

  strong: ({ className, ...props }: Props) => (
    <strong
      className={cn('text-terminal-text font-bold', className)}
      {...props}
    />
  ),

  em: ({ className, ...props }: Props) => (
    <em className={cn('italic', className)} {...props} />
  ),
}
