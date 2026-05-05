// ABOUTME: Storybook stories for color design tokens
// ABOUTME: Demonstrates color palettes, brand gradient, and color usage

import type { Meta, StoryObj } from '@storybook/nextjs'

const meta = {
  title: 'Design System/Colors',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const BrandGradient: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Brand Gradient</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          The signature cyan-to-orange gradient is a core aesthetic of the
          brand, used for CTAs, accents, and visual interest.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            Primary: bg-gradient-to-br from-cyan-500 to-orange-400
          </div>
          <div className="h-32 rounded-lg bg-gradient-to-br from-cyan-500 to-orange-400" />
          <p className="mt-2 text-body-sm text-muted-foreground">
            The default brand gradient used throughout the site
          </p>
        </div>

        <div>
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            Button Example
          </div>
          <button className="rounded-lg bg-gradient-to-br from-cyan-500 to-orange-400 px-6 py-3 font-sans text-body-md text-white transition-transform hover:scale-105">
            Book Your Session
          </button>
        </div>

        <div>
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            Icon Background Example
          </div>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-orange-400">
            <svg
              className="h-8 w-8 text-white"
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
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-serif text-heading-md">Gradient Variations</h3>
        <div className="space-y-4">
          <div>
            <div className="mb-2 font-mono text-caption text-muted-foreground">
              bg-gradient-to-r from-cyan-500 to-orange-400 (left to right)
            </div>
            <div className="h-20 rounded-lg bg-gradient-to-r from-cyan-500 to-orange-400" />
          </div>

          <div>
            <div className="mb-2 font-mono text-caption text-muted-foreground">
              bg-gradient-to-tr from-cyan-500 to-orange-400 (bottom-left to
              top-right)
            </div>
            <div className="h-20 rounded-lg bg-gradient-to-tr from-cyan-500 to-orange-400" />
          </div>

          <div>
            <div className="mb-2 font-mono text-caption text-muted-foreground">
              bg-gradient-to-br from-cyan-500 to-orange-400 (top-left to
              bottom-right)
            </div>
            <div className="h-20 rounded-lg bg-gradient-to-br from-cyan-500 to-orange-400" />
          </div>

          <div>
            <div className="mb-2 font-mono text-caption text-muted-foreground">
              bg-gradient-to-br from-cyan-500 via-cyan-400 to-orange-400 (with
              via)
            </div>
            <div className="h-20 rounded-lg bg-gradient-to-br from-cyan-500 via-cyan-400 to-orange-400" />
          </div>
        </div>
      </div>
    </div>
  ),
}

export const ColorPalette: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Color Palette</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          All color tokens available in the design system.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="mb-4 font-serif text-heading-md">Cyan</h3>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade}>
                <div
                  className={`mb-2 h-20 rounded-lg bg-cyan-${shade}`}
                  style={{
                    backgroundColor:
                      shade === 50
                        ? '#ecfeff'
                        : shade === 100
                          ? '#cffafe'
                          : shade === 200
                            ? '#a5f3fc'
                            : shade === 300
                              ? '#67e8f9'
                              : shade === 400
                                ? '#22d3ee'
                                : shade === 500
                                  ? '#06b6d4'
                                  : shade === 600
                                    ? '#0891b2'
                                    : shade === 700
                                      ? '#0e7490'
                                      : shade === 800
                                        ? '#155e75'
                                        : '#164e63',
                  }}
                />
                <div className="font-mono text-caption text-muted-foreground">
                  {shade}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Orange</h3>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade}>
                <div
                  className={`mb-2 h-20 rounded-lg bg-orange-${shade}`}
                  style={{
                    backgroundColor:
                      shade === 50
                        ? '#fff7ed'
                        : shade === 100
                          ? '#ffedd5'
                          : shade === 200
                            ? '#fed7aa'
                            : shade === 300
                              ? '#fdba74'
                              : shade === 400
                                ? '#fb923c'
                                : shade === 500
                                  ? '#f97316'
                                  : shade === 600
                                    ? '#ea580c'
                                    : shade === 700
                                      ? '#c2410c'
                                      : shade === 800
                                        ? '#9a3412'
                                        : '#7c2d12',
                  }}
                />
                <div className="font-mono text-caption text-muted-foreground">
                  {shade}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Primary (Neutral)</h3>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade}>
                <div
                  className={`mb-2 h-20 rounded-lg border bg-primary-${shade}`}
                />
                <div className="font-mono text-caption text-muted-foreground">
                  {shade}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Accent</h3>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade}>
                <div
                  className={`mb-2 h-20 rounded-lg border bg-accent-${shade}`}
                />
                <div className="font-mono text-caption text-muted-foreground">
                  {shade}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
}

export const SemanticColors: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Semantic Colors</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Purpose-driven colors that adapt to light and dark modes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-background p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            background / foreground
          </div>
          <div className="rounded bg-background p-4 text-foreground">
            Default background and text colors
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            card / card-foreground
          </div>
          <div className="rounded bg-card p-4 text-card-foreground">
            Card backgrounds and text
          </div>
        </div>

        <div className="rounded-lg border bg-primary p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            primary / primary-foreground
          </div>
          <div className="rounded bg-primary p-4 text-primary-foreground">
            Primary actions and emphasis
          </div>
        </div>

        <div className="rounded-lg border bg-secondary p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            secondary / secondary-foreground
          </div>
          <div className="rounded bg-secondary p-4 text-secondary-foreground">
            Secondary actions
          </div>
        </div>

        <div className="rounded-lg border bg-muted p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            muted / muted-foreground
          </div>
          <div className="rounded bg-muted p-4 text-muted-foreground">
            Muted backgrounds and text
          </div>
        </div>

        <div className="rounded-lg border bg-accent p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            accent / accent-foreground
          </div>
          <div className="rounded bg-accent p-4 text-accent-foreground">
            Accent colors for highlights
          </div>
        </div>

        <div className="rounded-lg border bg-destructive p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            destructive / destructive-foreground
          </div>
          <div className="rounded bg-destructive p-4 text-destructive-foreground">
            Destructive actions and errors
          </div>
        </div>

        <div className="rounded-lg border p-6">
          <div className="mb-2 font-mono text-caption text-muted-foreground">
            border
          </div>
          <div className="rounded border-2 border-border p-4">
            Border colors
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
          Real-world examples showing how colors are used in the design system.
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border p-8">
          <h3 className="mb-4 font-serif text-heading-md">
            Hero Section with Gradient CTA
          </h3>
          <div className="space-y-6">
            <h1 className="font-serif text-display-md">
              Capturing Life&apos;s Precious Moments
            </h1>
            <p className="text-body-lg text-muted-foreground">
              Professional photography services in the East Bay, San Francisco,
              and Contra Costa County.
            </p>
            <div className="flex gap-4">
              <button className="rounded-lg bg-gradient-to-br from-cyan-500 to-orange-400 px-6 py-3 font-sans text-body-md text-white transition-transform hover:scale-105">
                Book Your Session
              </button>
              <button className="rounded-lg border border-border bg-background px-6 py-3 font-sans text-body-md text-foreground hover:bg-muted">
                View Portfolio
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <h3 className="mb-4 font-serif text-heading-md">Contact Form</h3>
          <form className="space-y-4">
            <div>
              <label className="mb-1 block text-body-sm text-muted-foreground">
                Your Name
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="mb-1 block text-body-sm text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-br from-cyan-500 to-orange-400 px-6 py-3 font-sans text-body-md text-white transition-transform hover:scale-[1.02]"
            >
              Send Message
            </button>
          </form>
        </div>

        <div className="rounded-lg border bg-card p-8">
          <h3 className="mb-4 font-serif text-heading-md">
            Icon Cards with Gradient
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {['Family', 'Maternity', 'Weddings'].map((service) => (
              <div key={service} className="rounded-lg border bg-card p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-orange-400">
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
                  </svg>
                </div>
                <h4 className="mb-2 font-serif text-heading-sm">{service}</h4>
                <p className="text-body-sm text-muted-foreground">
                  Capturing your most precious moments with care and artistry.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
}
