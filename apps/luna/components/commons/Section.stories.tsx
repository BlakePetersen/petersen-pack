// ABOUTME: Storybook stories for Section component
// ABOUTME: Section layout patterns

import type { Meta, StoryObj } from '@storybook/nextjs'
import { Section } from './Section'

const meta: Meta<typeof Section> = {
  title: 'Commons/Section',
  component: Section,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Section>

export const Default: Story = {
  render: () => (
    <Section>
      <h2 className="mb-4 text-2xl font-bold">Section Content</h2>
      <p>This is content inside a section with standard spacing.</p>
    </Section>
  ),
}

export const Variants: Story = {
  render: () => (
    <div>
      <Section variant="default">
        <h2 className="mb-4 text-2xl font-bold">Default Variant</h2>
        <p>White background in light mode, gray-900 in dark mode.</p>
      </Section>
      <Section variant="gray">
        <h2 className="mb-4 text-2xl font-bold">Gray Variant</h2>
        <p>Gray-50 background in light mode, gray-800 in dark mode.</p>
      </Section>
    </div>
  ),
}
