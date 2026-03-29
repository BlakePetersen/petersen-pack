// ABOUTME: Registry types, navigation data, and component definitions for the catalog.
// ABOUTME: Provides lookup functions and sidebar section structure for the reference site.

import type { ReactNode } from 'react'

export interface PropDef {
  name: string
  type: string
  default: string
  description: string
}

export interface CodeExample {
  label: string
  code: string
}

export interface ComponentDef {
  name: string
  slug: string
  tier: 'atoms' | 'molecules' | 'organisms'
  description: string
  imports: string
  props: PropDef[]
  variants?: string[]
  codeExamples: CodeExample[]
  a11y: string[]
  preview: (variant?: string) => ReactNode
}

const components: ComponentDef[] = [
  {
    name: 'Button',
    slug: 'button',
    tier: 'atoms',
    description: 'Primary interactive element for triggering actions.',
    imports: "import { Button } from 'artax-ui'",
    props: [
      { name: 'variant', type: "'default' | 'outline' | 'ghost'", default: "'default'", description: 'Visual style variant' },
      { name: 'size', type: "'default' | 'sm' | 'lg' | 'icon'", default: "'default'", description: 'Button size' },
      { name: 'asChild', type: 'boolean', default: 'false', description: 'Merge props onto child element' },
    ],
    variants: ['default', 'outline', 'ghost'],
    codeExamples: [
      { label: 'Basic', code: '<Button>Click me</Button>' },
      { label: 'Variants', code: '<Button variant="outline">Outline</Button>\n<Button variant="ghost">Ghost</Button>' },
    ],
    a11y: ['Uses native <button> element', 'Supports keyboard focus and activation'],
    preview: () => null,
  },
  {
    name: 'Card',
    slug: 'card',
    tier: 'molecules',
    description: 'Container for grouping related content with optional header and footer.',
    imports: "import { Card, CardHeader, CardTitle, CardContent } from 'artax-ui'",
    props: [
      { name: 'className', type: 'string', default: "''", description: 'Additional CSS classes' },
    ],
    codeExamples: [
      { label: 'Basic', code: '<Card>\n  <CardHeader>\n    <CardTitle>Title</CardTitle>\n  </CardHeader>\n  <CardContent>Content</CardContent>\n</Card>' },
    ],
    a11y: ['Uses semantic HTML elements', 'Card title provides accessible heading'],
    preview: () => null,
  },
]

export function getComponent(tier: string, slug: string): ComponentDef | undefined {
  return components.find((c) => c.tier === tier && c.slug === slug)
}

export function getComponentsByTier(tier: string): ComponentDef[] {
  return components.filter((c) => c.tier === tier)
}

export function getAllComponents(): ComponentDef[] {
  return components
}

interface SidebarSection {
  label: string
  items: { name: string; href: string }[]
}

export function getSidebarSections(): SidebarSection[] {
  return [
    {
      label: '',
      items: [
        { name: 'Overview', href: '/' },
        { name: 'Getting Started', href: '/getting-started' },
      ],
    },
    {
      label: '// atoms',
      items: [
        { name: 'Button', href: '/components/atoms/button' },
        { name: 'Input', href: '/components/atoms/input' },
        { name: 'Badge', href: '/components/atoms/badge' },
        { name: 'Separator', href: '/components/atoms/separator' },
        { name: 'CopyButton', href: '/components/atoms/copy-button' },
        { name: 'Toggle', href: '/components/atoms/toggle' },
      ],
    },
    {
      label: '// molecules',
      items: [
        { name: 'Card', href: '/components/molecules/card' },
        { name: 'Table', href: '/components/molecules/table' },
        { name: 'Callout', href: '/components/molecules/callout' },
        { name: 'CodeBlock', href: '/components/molecules/code-block' },
        { name: 'Tabs', href: '/components/molecules/tabs' },
        { name: 'Tooltip', href: '/components/molecules/tooltip' },
      ],
    },
    {
      label: '// organisms',
      items: [
        { name: 'Accordion', href: '/components/organisms/accordion' },
        { name: 'Dialog', href: '/components/organisms/dialog' },
        { name: 'Dropdown', href: '/components/organisms/dropdown' },
      ],
    },
    {
      label: '',
      items: [{ name: 'Tokens', href: '/tokens' }],
    },
  ]
}
