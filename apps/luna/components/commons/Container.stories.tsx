// ABOUTME: Storybook stories for Container component
// ABOUTME: Layout component stories

import type { Meta, StoryObj } from '@storybook/nextjs'
import { Container } from './Container'

const meta: Meta<typeof Container> = {
  title: 'Commons/Container',
  component: Container,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Container>

export const Default: Story = {
  render: () => (
    <Container>
      <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
        Content inside container with max-width constraint
      </div>
    </Container>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Container size="sm">
        <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
          Small container (max-w-3xl)
        </div>
      </Container>
      <Container size="md">
        <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
          Medium container (max-w-5xl)
        </div>
      </Container>
      <Container size="lg">
        <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
          Large container (max-w-7xl) - Default
        </div>
      </Container>
      <Container size="xl">
        <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
          Extra large container (max-w-[1400px])
        </div>
      </Container>
      <Container size="full">
        <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
          Full width container (max-w-full)
        </div>
      </Container>
    </div>
  ),
}

export const FullWidth: Story = {
  render: () => (
    <Container size="full">
      <div className="rounded bg-gray-100 p-4 dark:bg-gray-800">
        Full width content using Container component
      </div>
    </Container>
  ),
}
