// ABOUTME: Storybook stories for Button component
// ABOUTME: Demonstrates all variants, sizes, and states

import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button, ButtonLink } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Commons/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'tertiary',
        'destructive',
        'outline',
        'ghost',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const PrimaryCTASizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4 p-8">
      <ButtonLink href="#" variant="primary" size="sm">
        Small Primary
      </ButtonLink>
      <ButtonLink href="#" variant="primary" size="default">
        Medium Primary
      </ButtonLink>
      <ButtonLink href="#" variant="primary" size="lg">
        Large Primary
      </ButtonLink>
    </div>
  ),
}

export const SecondaryCTASizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4 p-8">
      <ButtonLink href="#" variant="secondary" size="sm">
        Small Secondary
      </ButtonLink>
      <ButtonLink href="#" variant="secondary" size="default">
        Medium Secondary
      </ButtonLink>
      <ButtonLink href="#" variant="secondary" size="lg">
        Large Secondary
      </ButtonLink>
    </div>
  ),
}

export const CTAComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex items-center gap-4">
        <ButtonLink href="#" variant="primary" size="sm">
          Primary SM
        </ButtonLink>
        <ButtonLink href="#" variant="secondary" size="sm">
          Secondary SM
        </ButtonLink>
      </div>
      <div className="flex items-center gap-4">
        <ButtonLink href="#" variant="primary" size="default">
          Primary Default
        </ButtonLink>
        <ButtonLink href="#" variant="secondary" size="default">
          Secondary Default
        </ButtonLink>
      </div>
      <div className="flex items-center gap-4">
        <ButtonLink href="#" variant="primary" size="lg">
          Primary LG
        </ButtonLink>
        <ButtonLink href="#" variant="secondary" size="lg">
          Secondary LG
        </ButtonLink>
      </div>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Default</Button>
      <Button disabled>Disabled</Button>
      <Button className="cursor-wait opacity-50">Loading</Button>
    </div>
  ),
}

export const WithLinks: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ButtonLink href="/about" variant="primary">
        Go to About
      </ButtonLink>
      <ButtonLink href="/contact" variant="outline">
        Contact Us
      </ButtonLink>
    </div>
  ),
}

export const GlassOpacity: Story = {
  render: () => (
    <div className="relative overflow-hidden rounded-lg">
      {/* Simulated hero image background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}
      />
      <div className="relative flex flex-col gap-6 p-12">
        <h3 className="font-serif text-2xl text-white">
          Hero Overlay with glassOpacity
        </h3>
        <p className="max-w-md text-sm text-white/70">
          Use glassOpacity (0-1) to control CTA transparency when placed over
          images. Lower values create a more see-through effect.
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <ButtonLink href="#" variant="secondary" size="lg" glassOpacity={1}>
              Opacity 1.0
            </ButtonLink>
            <span className="text-xs text-white/50">Default (solid)</span>
          </div>
          <div className="flex items-center gap-4">
            <ButtonLink
              href="#"
              variant="secondary"
              size="lg"
              glassOpacity={0.5}
            >
              Opacity 0.5
            </ButtonLink>
            <span className="text-xs text-white/50">Hero overlay</span>
          </div>
          <div className="flex items-center gap-4">
            <ButtonLink
              href="#"
              variant="secondary"
              size="lg"
              glassOpacity={0.25}
            >
              Opacity 0.25
            </ButtonLink>
            <span className="text-xs text-white/50">Subtle</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <ButtonLink href="#" variant="primary" size="lg" glassOpacity={0.5}>
            Primary 0.5
          </ButtonLink>
          <ButtonLink href="#" variant="secondary" size="lg" glassOpacity={0.5}>
            Secondary 0.5
          </ButtonLink>
        </div>
      </div>
    </div>
  ),
}

export const DarkMode: Story = {
  render: () => (
    <div className="dark rounded-lg bg-gray-950 p-8">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="tertiary">Tertiary</Button>
      </div>
    </div>
  ),
}
