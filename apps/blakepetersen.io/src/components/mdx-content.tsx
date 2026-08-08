// ABOUTME: Client component that renders Velite compiled MDX code strings.
// ABOUTME: Uses new Function() to evaluate MDX code, which requires client-side execution.

'use client'

import { createElement, useMemo } from 'react'
import * as runtime from 'react/jsx-runtime'
import { mdxComponents } from 'artax-ui'
import type { MDXComponents } from 'mdx/types'
import { HeadingAnchor } from './heading-anchor'

type HeadingProps = React.ComponentPropsWithoutRef<'h2'>

const headingOverrides: MDXComponents = {
  h2: ({ children, id, className, ...props }: HeadingProps) =>
    createElement(
      'h2',
      {
        id,
        className:
          `group relative font-mono text-xl font-bold text-foreground mt-8 mb-3 ${className || ''}`.trim(),
        ...props
      },
      createElement(HeadingAnchor, { id }),
      createElement('span', { className: 'text-muted-foreground' }, '// '),
      children
    ),
  h3: ({ children, id, className, ...props }: HeadingProps) =>
    createElement(
      'h3',
      {
        id,
        className:
          `group relative font-mono text-lg font-semibold text-foreground mt-6 mb-2 ${className || ''}`.trim(),
        ...props
      },
      createElement(HeadingAnchor, { id }),
      createElement('span', { className: 'text-muted-foreground' }, '> '),
      children
    )
}

function getMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MDXContent({
  code,
  components
}: {
  code: string
  components?: MDXComponents
}) {
  const Component = useMemo(() => getMDXComponent(code), [code])
  return createElement(Component, {
    components: { ...mdxComponents, ...headingOverrides, ...components }
  })
}
