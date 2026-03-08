// ABOUTME: Client component that renders Velite compiled MDX code strings.
// ABOUTME: Uses new Function() to evaluate MDX code, which requires client-side execution.

'use client'

import { createElement, useMemo } from 'react'
import * as runtime from 'react/jsx-runtime'
import { mdxComponents } from 'artax-ui'
import type { MDXComponents } from 'mdx/types'

function getMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MDXContent({
  code,
  components,
}: {
  code: string
  components?: MDXComponents
}) {
  const Component = useMemo(() => getMDXComponent(code), [code])
  return createElement(Component, {
    components: { ...mdxComponents, ...components },
  })
}
