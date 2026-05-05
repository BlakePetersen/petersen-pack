// ABOUTME: Storybook stories for Heading component
// ABOUTME: Demonstrates semantic heading usage with styled variants

import type { Meta, StoryObj } from '@storybook/nextjs'
import { Heading } from './Heading'

const meta = {
  title: 'Design System/Heading',
  component: Heading,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'The HTML heading element to render',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof Heading>

export default meta
type Story = StoryObj<typeof meta>

export const HeadingLevels: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Heading Component</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          The Heading component provides semantic HTML headings with consistent
          styling. Always use semantic HTML (h1-h6) for accessibility, and style
          with Tailwind classes as needed.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-2 font-mono text-caption text-muted-foreground">
            {'<Heading as="h1">'}
          </p>
          <Heading as="h1">Heading Level 1</Heading>
        </div>

        <div>
          <p className="mb-2 font-mono text-caption text-muted-foreground">
            {'<Heading as="h2">'}
          </p>
          <Heading as="h2">Heading Level 2</Heading>
        </div>

        <div>
          <p className="mb-2 font-mono text-caption text-muted-foreground">
            {'<Heading as="h3">'}
          </p>
          <Heading as="h3">Heading Level 3</Heading>
        </div>

        <div>
          <p className="mb-2 font-mono text-caption text-muted-foreground">
            {'<Heading as="h4">'}
          </p>
          <Heading as="h4">Heading Level 4</Heading>
        </div>

        <div>
          <p className="mb-2 font-mono text-caption text-muted-foreground">
            {'<Heading as="h5">'}
          </p>
          <Heading as="h5">Heading Level 5</Heading>
        </div>

        <div>
          <p className="mb-2 font-mono text-caption text-muted-foreground">
            {'<Heading as="h6">'}
          </p>
          <Heading as="h6">Heading Level 6</Heading>
        </div>
      </div>
    </div>
  ),
}

export const WithCustomStyling: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">
          Custom Styled Headings
        </h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Headings can be styled with any design system typography tokens while
          maintaining semantic HTML structure.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-2 font-mono text-caption text-muted-foreground">
            {
              '<Heading as="h2" className="text-display-md font-serif">Display Styled H2</Heading>'
            }
          </p>
          <Heading as="h2" className="font-serif text-display-md">
            Display Styled H2
          </Heading>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Semantic h2, but styled as display-md
          </p>
        </div>

        <div>
          <p className="mb-2 font-mono text-caption text-muted-foreground">
            {
              '<Heading as="h3" className="text-heading-xl text-primary">Colored Heading</Heading>'
            }
          </p>
          <Heading as="h3" className="text-heading-xl text-primary">
            Colored Heading
          </Heading>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Heading with custom color
          </p>
        </div>

        <div>
          <p className="mb-2 font-mono text-caption text-muted-foreground">
            {
              '<Heading as="h1" className="text-heading-md font-sans font-normal">Sans Serif</Heading>'
            }
          </p>
          <Heading as="h1" className="font-sans text-heading-md font-normal">
            Sans Serif Heading
          </Heading>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Using sans-serif instead of default serif
          </p>
        </div>
      </div>
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">Headings in Context</h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Examples of headings used in realistic page layouts.
        </p>
      </div>

      <div className="space-y-12">
        <article className="rounded-lg border bg-card p-gutter">
          <Heading as="h1" className="mb-4 font-serif text-display-md">
            Article Title
          </Heading>
          <p className="mb-6 text-body-lg text-muted-foreground">
            A subtitle or introduction can follow the main heading.
          </p>

          <Heading as="h2" className="mb-4 mt-8 font-serif text-heading-xl">
            Section Heading
          </Heading>
          <p className="mb-4 text-body-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          <Heading as="h3" className="mb-3 mt-6 font-serif text-heading-lg">
            Subsection Heading
          </Heading>
          <p className="text-body-md">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        </article>

        <div className="rounded-lg border bg-muted p-gutter">
          <Heading as="h2" className="mb-6 font-serif text-heading-xl">
            Feature Grid
          </Heading>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <Heading as="h3" className="mb-2 font-serif text-heading-md">
                Feature One
              </Heading>
              <p className="text-body-sm text-muted-foreground">
                Description of the first feature.
              </p>
            </div>
            <div>
              <Heading as="h3" className="mb-2 font-serif text-heading-md">
                Feature Two
              </Heading>
              <p className="text-body-sm text-muted-foreground">
                Description of the second feature.
              </p>
            </div>
            <div>
              <Heading as="h3" className="mb-2 font-serif text-heading-md">
                Feature Three
              </Heading>
              <p className="text-body-sm text-muted-foreground">
                Description of the third feature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}
