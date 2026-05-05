// ABOUTME: Storybook stories for Typography design tokens
// ABOUTME: Demonstrates font families and text styles

import type { Meta, StoryObj } from '@storybook/nextjs'

const meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FontFamilies: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Font Families</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          The design system uses three primary font families, each optimized for
          specific use cases.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            font-sans (Inter)
          </div>
          <p className="mb-2 font-sans text-body-lg">
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="font-sans text-body-md text-muted-foreground">
            Used for body text, UI elements, and general content. Inter is a
            highly readable sans-serif optimized for screens.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            font-serif (Playfair Display)
          </div>
          <h1 className="mb-2 font-serif text-display-md">
            The quick brown fox jumps over the lazy dog
          </h1>
          <p className="font-sans text-body-md text-muted-foreground">
            Used for headings and display text. Playfair Display is an elegant
            serif that adds sophistication to headlines.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            font-mono (JetBrains Mono)
          </div>
          <code className="mb-2 block font-mono text-body-md">
            const greeting = &quot;Hello, World!&quot;
          </code>
          <p className="font-sans text-body-md text-muted-foreground">
            Used for code snippets, technical content, and fixed-width text.
            JetBrains Mono is designed for developer readability.
          </p>
        </div>
      </div>
    </div>
  ),
}

export const TextStyles: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Text Styles</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Combining font families with design system size tokens.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-serif text-heading-md">Display Sizes</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                display-xl (80px)
              </div>
              <h1 className="font-serif text-display-xl">Display XL</h1>
            </div>
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                display-lg (64px)
              </div>
              <h1 className="font-serif text-display-lg">Display Large</h1>
            </div>
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                display-md (48px)
              </div>
              <h1 className="font-serif text-display-md">Display Medium</h1>
            </div>
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                display-sm (40px)
              </div>
              <h1 className="font-serif text-display-sm">Display Small</h1>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Heading Sizes</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                heading-xl (32px)
              </div>
              <h2 className="font-serif text-heading-xl">Heading XL</h2>
            </div>
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                heading-lg (28px)
              </div>
              <h2 className="font-serif text-heading-lg">Heading Large</h2>
            </div>
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                heading-md (24px)
              </div>
              <h3 className="font-serif text-heading-md">Heading Medium</h3>
            </div>
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                heading-sm (20px)
              </div>
              <h4 className="font-serif text-heading-sm">Heading Small</h4>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Body Sizes</h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                body-lg (18px)
              </div>
              <p className="font-sans text-body-lg">
                Body Large - The quick brown fox jumps over the lazy dog.
                Perfect for introductory paragraphs and emphasis.
              </p>
            </div>
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                body-md (16px)
              </div>
              <p className="font-sans text-body-md">
                Body Medium - The quick brown fox jumps over the lazy dog. The
                default size for most body text and content.
              </p>
            </div>
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                body-sm (14px)
              </div>
              <p className="font-sans text-body-sm">
                Body Small - The quick brown fox jumps over the lazy dog. Used
                for secondary content and supporting text.
              </p>
            </div>
            <div>
              <div className="mb-1 font-mono text-caption text-muted-foreground">
                caption (12px)
              </div>
              <p className="font-sans text-caption">
                Caption - The quick brown fox jumps over the lazy dog. Used for
                labels, captions, and metadata.
              </p>
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
          Real-world examples of typography in action.
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border p-8">
          <h1 className="mb-4 font-serif text-display-md">
            Capturing Life&apos;s Precious Moments
          </h1>
          <p className="mb-6 font-sans text-body-lg text-muted-foreground">
            Professional photography services in the East Bay, San Francisco,
            and Contra Costa County.
          </p>
          <button className="rounded-lg bg-primary px-6 py-3 font-sans text-body-md text-primary-foreground">
            Book Your Session
          </button>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <div className="mb-4 flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted font-serif text-heading-lg">
              AP
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-serif text-heading-sm">
                Ashley Petersen
              </h3>
              <p className="font-sans text-body-sm text-muted-foreground">
                Professional Photographer
              </p>
            </div>
          </div>
          <p className="mb-4 font-sans text-body-md">
            &quot;Working with families to capture their most treasured memories
            brings me so much joy. Every photo session is an opportunity to tell
            a unique story.&quot;
          </p>
          <div className="font-sans text-caption text-muted-foreground">
            Posted 2 hours ago
          </div>
        </div>

        <div className="rounded-lg border p-8">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            components/ui/Button.tsx
          </div>
          <pre className="overflow-x-auto rounded bg-muted p-4 font-mono text-body-sm">
            {`export function Button({ children }: ButtonProps) {
  return (
    <button className="font-sans px-4 py-2">
      {children}
    </button>
  )
}`}
          </pre>
        </div>
      </div>
    </div>
  ),
}
