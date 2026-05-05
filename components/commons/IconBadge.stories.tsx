// ABOUTME: Storybook stories for IconBadge component
// ABOUTME: Demonstrates icon badge sizes and use cases

import type { Meta, StoryObj } from '@storybook/nextjs'
import { IconBadge } from './IconBadge'

const meta = {
  title: 'Design System/IconBadge',
  component: IconBadge,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the icon badge',
    },
    icon: {
      description: 'React node for the icon content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof IconBadge>

export default meta
type Story = StoryObj<typeof meta>

const MailIcon = (
  <svg
    className="h-full w-full"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const PhoneIcon = (
  <svg
    className="h-full w-full"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

const LocationIcon = (
  <svg
    className="h-full w-full"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
)

const CameraIcon = (
  <svg
    className="h-full w-full"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
)

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">IconBadge Sizes</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Icon badges come in three sizes for different contexts.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <div className="text-center">
          <IconBadge size="sm" icon={MailIcon} />
          <p className="mt-3 font-mono text-caption text-muted-foreground">
            Small (32px)
          </p>
          <p className="text-caption text-muted-foreground">Inline with text</p>
        </div>

        <div className="text-center">
          <IconBadge size="md" icon={PhoneIcon} />
          <p className="mt-3 font-mono text-caption text-muted-foreground">
            Medium (40px)
          </p>
          <p className="text-caption text-muted-foreground">Default size</p>
        </div>

        <div className="text-center">
          <IconBadge size="lg" icon={LocationIcon} />
          <p className="mt-3 font-mono text-caption text-muted-foreground">
            Large (48px)
          </p>
          <p className="text-caption text-muted-foreground">
            Feature highlights
          </p>
        </div>
      </div>
    </div>
  ),
}

export const UsageExamples: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Usage Examples</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Icon badges are used to draw attention to important features or
          actions.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-serif text-heading-md">Contact Info</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <IconBadge size="sm" icon={MailIcon} />
              <div>
                <p className="text-body-md">hello@ashleypetersen.com</p>
                <p className="text-caption text-muted-foreground">
                  Email me for inquiries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <IconBadge size="sm" icon={PhoneIcon} />
              <div>
                <p className="text-body-md">(555) 123-4567</p>
                <p className="text-caption text-muted-foreground">
                  Available Mon-Fri 9am-5pm
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <IconBadge size="sm" icon={LocationIcon} />
              <div>
                <p className="text-body-md">San Francisco Bay Area</p>
                <p className="text-caption text-muted-foreground">
                  Serving East Bay and surrounding areas
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Feature Cards</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-gutter">
              <IconBadge size="md" icon={CameraIcon} className="mb-4" />
              <h4 className="mb-2 font-serif text-heading-sm">
                Professional Photography
              </h4>
              <p className="text-body-sm text-muted-foreground">
                High-quality images that tell your story
              </p>
            </div>
            <div className="rounded-lg border bg-card p-gutter">
              <IconBadge size="md" icon={LocationIcon} className="mb-4" />
              <h4 className="mb-2 font-serif text-heading-sm">
                On-Location Shoots
              </h4>
              <p className="text-body-sm text-muted-foreground">
                Beautiful outdoor and indoor settings
              </p>
            </div>
            <div className="rounded-lg border bg-card p-gutter">
              <IconBadge size="md" icon={MailIcon} className="mb-4" />
              <h4 className="mb-2 font-serif text-heading-sm">
                Fast Turnaround
              </h4>
              <p className="text-body-sm text-muted-foreground">
                Receive your edited photos within 2 weeks
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">
            With Background Gradient
          </h3>
          <div className="flex gap-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-orange-400">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-body-md font-medium">Book Your Session</p>
              <p className="text-caption text-muted-foreground">
                Brand gradient background for CTAs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}
