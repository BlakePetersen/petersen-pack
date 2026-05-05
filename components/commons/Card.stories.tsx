// ABOUTME: Storybook stories for Card component
// ABOUTME: Demonstrates card layouts and content patterns

import type { Meta, StoryObj } from '@storybook/nextjs'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'Commons/Card',
  component: Card,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card>
      <h3 className="mb-2 text-lg font-semibold">Card Title</h3>
      <p className="text-gray-600 dark:text-gray-400">
        This is a simple card with some content inside.
      </p>
    </Card>
  ),
}

export const WithPadding: Story = {
  render: () => (
    <div className="space-y-4">
      <Card className="p-4">
        <p>Card with p-4 padding</p>
      </Card>
      <Card className="p-gutter">
        <p>Card with p-gutter padding</p>
      </Card>
      <Card className="p-gutter-lg">
        <p>Card with p-gutter-lg padding</p>
      </Card>
    </div>
  ),
}

export const WithBorder: Story = {
  render: () => (
    <Card className="border border-gray-200 p-gutter dark:border-gray-700">
      <h3 className="mb-2 text-lg font-semibold">Bordered Card</h3>
      <p className="text-gray-600 dark:text-gray-400">
        Card with visible border styling.
      </p>
    </Card>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark rounded-lg bg-gray-950 p-8">
      <Card className="p-gutter">
        <h3 className="mb-2 text-lg font-semibold text-white">
          Dark Mode Card
        </h3>
        <p className="text-gray-400">
          Card rendered in dark mode with appropriate styling.
        </p>
      </Card>
    </div>
  ),
}
