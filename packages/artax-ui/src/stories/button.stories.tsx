// ABOUTME: Storybook stories for the Button component.
// ABOUTME: Demonstrates $ prefix default, [bracket] ghost, outline variants, and sizes.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../components/button'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'ghost', 'outline'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'deploy',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'cancel',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'configure',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'run',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'execute',
  },
}

export const Disabled: Story = {
  args: {
    children: 'deploy',
    disabled: true,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button>deploy</Button>
        <Button variant="ghost">cancel</Button>
        <Button variant="outline">configure</Button>
      </div>
      <div className="flex items-center gap-4">
        <Button size="sm">run</Button>
        <Button size="default">deploy</Button>
        <Button size="lg">execute</Button>
      </div>
      <div className="flex items-center gap-4">
        <Button disabled>deploy</Button>
        <Button variant="ghost" disabled>cancel</Button>
        <Button variant="outline" disabled>configure</Button>
      </div>
    </div>
  ),
}
