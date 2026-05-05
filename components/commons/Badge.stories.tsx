// ABOUTME: Storybook stories for Badge component
// ABOUTME: Demonstrates badge variants and use cases

import type { Meta, StoryObj } from '@storybook/nextjs'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Commons/Badge',
  component: Badge,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Badge>

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="accent">Accent</Badge>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Badge className="px-2 py-0.5 text-xs">Small</Badge>
      <Badge>Default</Badge>
      <Badge className="px-3 py-1 text-sm">Large</Badge>
    </div>
  ),
}

export const StatusIndicators: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Active
        </Badge>
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          Pending
        </Badge>
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Inactive
        </Badge>
      </div>
    </div>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark rounded-lg bg-gray-950 p-8">
      <div className="flex flex-wrap gap-3">
        <Badge variant="solid">Solid</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="accent">Accent</Badge>
      </div>
    </div>
  ),
}
