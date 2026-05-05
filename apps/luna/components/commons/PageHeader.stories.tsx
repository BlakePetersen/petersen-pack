// ABOUTME: Storybook stories for PageHeader component
// ABOUTME: Page header patterns

import type { Meta, StoryObj } from '@storybook/nextjs'
import { PageHeader } from './PageHeader'

const meta: Meta<typeof PageHeader> = {
  title: 'Commons/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: {
    title: 'Page Title',
    subtitle: 'This is a description of the page content.',
  },
}

export const WithoutSubtitle: Story = {
  args: {
    title: 'Simple Page Title',
  },
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark bg-gray-950 p-8">
      <PageHeader
        title="Dark Mode Header"
        subtitle="Header displayed in dark mode"
      />
    </div>
  ),
}
