// ABOUTME: Storybook stories for spacing design tokens
// ABOUTME: Demonstrates gutter, section spacing, and responsive spacing

import type { Meta, StoryObj } from '@storybook/nextjs'

const meta = {
  title: 'Design System/Spacing',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SpacingTokens: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Spacing Tokens</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Core spacing tokens used throughout the design system for consistent
          layout and rhythm.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-serif text-heading-md">
            Gutter (24px / 1.5rem)
          </h3>
          <p className="mb-4 text-body-sm text-muted-foreground">
            Used for consistent horizontal and vertical padding in containers
            and components.
          </p>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="bg-blue-100 p-gutter dark:bg-blue-900">
              <div className="rounded bg-white p-4 text-body-sm dark:bg-gray-950">
                Content with <code className="font-mono">p-gutter</code> padding
                (24px)
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">
            Large Gutter (48px / 3rem)
          </h3>
          <p className="mb-4 text-body-sm text-muted-foreground">
            Used for generous spacing in hero sections and large containers.
          </p>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="bg-purple-100 p-gutter-lg dark:bg-purple-900">
              <div className="rounded bg-white p-4 text-body-sm dark:bg-gray-950">
                Content with <code className="font-mono">p-gutter-lg</code>{' '}
                padding (48px)
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">
            Section Spacing (96px / 6rem)
          </h3>
          <p className="mb-4 text-body-sm text-muted-foreground">
            Used for vertical spacing between major page sections.
          </p>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="bg-green-100 py-section dark:bg-green-900">
              <div className="mx-auto max-w-xs rounded bg-white p-4 text-center text-body-sm dark:bg-gray-950">
                Content with <code className="font-mono">py-section</code>{' '}
                padding (96px vertical)
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">
            Section Spacing Small (64px / 4rem)
          </h3>
          <p className="mb-4 text-body-sm text-muted-foreground">
            Used for smaller vertical spacing between sections, typically on
            mobile or compact layouts.
          </p>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="bg-orange-100 py-section-sm dark:bg-orange-900">
              <div className="mx-auto max-w-xs rounded bg-white p-4 text-center text-body-sm dark:bg-gray-950">
                Content with <code className="font-mono">py-section-sm</code>{' '}
                padding (64px vertical)
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">
            Header Height (112px / 7rem)
          </h3>
          <p className="mb-4 text-body-sm text-muted-foreground">
            Fixed height for the site header, used for scroll offset
            calculations.
          </p>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex h-header items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="rounded bg-white p-4 text-body-sm dark:bg-gray-950">
                Container with <code className="font-mono">h-header</code>{' '}
                height (112px)
              </div>
            </div>
          </div>
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
          Real-world examples showing how spacing tokens are applied in layouts.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-serif text-heading-md">Card Layout</h3>
          <div className="grid gap-gutter md:grid-cols-3">
            <div className="rounded-lg border bg-card p-gutter">
              <h4 className="mb-2 font-serif text-heading-sm">Card Title</h4>
              <p className="text-body-sm text-muted-foreground">
                Cards use gutter padding for consistent internal spacing.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-gutter">
              <h4 className="mb-2 font-serif text-heading-sm">Card Title</h4>
              <p className="text-body-sm text-muted-foreground">
                Grid gaps also use the gutter token.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-gutter">
              <h4 className="mb-2 font-serif text-heading-sm">Card Title</h4>
              <p className="text-body-sm text-muted-foreground">
                This creates a cohesive visual rhythm.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">
            Section Spacing Example
          </h3>
          <div className="space-y-section-sm">
            <div className="rounded-lg border bg-muted p-gutter">
              <h4 className="mb-2 font-serif text-heading-sm">Section 1</h4>
              <p className="text-body-sm text-muted-foreground">
                Sections are separated by section-sm spacing.
              </p>
            </div>
            <div className="rounded-lg border bg-muted p-gutter">
              <h4 className="mb-2 font-serif text-heading-sm">Section 2</h4>
              <p className="text-body-sm text-muted-foreground">
                This creates clear visual separation.
              </p>
            </div>
            <div className="rounded-lg border bg-muted p-gutter">
              <h4 className="mb-2 font-serif text-heading-sm">Section 3</h4>
              <p className="text-body-sm text-muted-foreground">
                Without feeling too cramped.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}
