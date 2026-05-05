// ABOUTME: Storybook stories for FilterNav component
// ABOUTME: Demonstrates filter and anchor navigation modes

import type { Meta, StoryObj } from '@storybook/nextjs'
import { FilterNav } from './FilterNav'

const meta = {
  title: 'Design System/FilterNav',
  component: FilterNav,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FilterNav>

export default meta
type Story = StoryObj<typeof meta>

export const FilterMode: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">
          FilterNav - Filter Mode
        </h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Used for filtering content based on categories or types. Clicking a
          filter triggers the onFilterChange callback.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 font-serif text-heading-md">
            Portfolio Categories
          </h3>
          <FilterNav
            mode="filter"
            items={[
              { label: 'All', value: 'all' },
              { label: 'Weddings', value: 'weddings' },
              { label: 'Family', value: 'family' },
              { label: 'Maternity', value: 'maternity' },
              { label: 'Engagement', value: 'engagement' },
            ]}
            onFilterChange={(value) => console.log('Filter changed:', value)}
          />
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">Blog Categories</h3>
          <FilterNav
            mode="filter"
            items={[
              { label: 'All Posts', value: 'all' },
              { label: 'Tips & Tricks', value: 'tips' },
              { label: 'Behind the Scenes', value: 'bts' },
              { label: 'Client Stories', value: 'stories' },
            ]}
            onFilterChange={(value) => console.log('Filter changed:', value)}
          />
        </div>
      </div>
    </div>
  ),
}

export const AnchorMode: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">
          FilterNav - Anchor Mode
        </h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Used for smooth scrolling navigation to sections within a page. Links
          to section IDs with smooth scroll behavior.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-4 font-serif text-heading-md">Page Navigation</h3>
          <FilterNav
            mode="anchor"
            items={[
              { label: 'Services', value: 'services' },
              { label: 'Portfolio', value: 'portfolio' },
              { label: 'About', value: 'about' },
              { label: 'Pricing', value: 'pricing' },
              { label: 'Contact', value: 'contact' },
            ]}
          />
        </div>

        <div>
          <h3 className="mb-4 font-serif text-heading-md">
            Pricing Page Sections
          </h3>
          <FilterNav
            mode="anchor"
            items={[
              { label: 'Packages', value: 'packages' },
              { label: 'Add-ons', value: 'addons' },
              { label: 'FAQs', value: 'faqs' },
            ]}
          />
        </div>
      </div>
    </div>
  ),
}

export const InContext: Story = {
  render: () => (
    <div className="space-y-12">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">
          FilterNav in Context
        </h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          Examples of FilterNav used in realistic page layouts.
        </p>
      </div>

      <div className="space-y-12">
        <div>
          <h3 className="mb-6 font-serif text-heading-md">
            Portfolio Page Header
          </h3>
          <div className="rounded-lg border bg-card p-gutter">
            <div className="mb-6 text-center">
              <h1 className="mb-2 font-serif text-display-md">Portfolio</h1>
              <p className="text-body-lg text-muted-foreground">
                Browse my photography work across different styles
              </p>
            </div>
            <FilterNav
              mode="filter"
              items={[
                { label: 'All', value: 'all' },
                { label: 'Weddings', value: 'weddings' },
                { label: 'Family', value: 'family' },
                { label: 'Maternity', value: 'maternity' },
                { label: 'Commercial', value: 'commercial' },
              ]}
              onFilterChange={(value) => console.log('Filter:', value)}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-6 font-serif text-heading-md">
            Sticky Navigation (Anchor Mode)
          </h3>
          <div className="rounded-lg border bg-card">
            <div className="border-b p-gutter">
              <h1 className="font-serif text-display-sm">Services & Pricing</h1>
            </div>
            <div className="sticky top-0 border-b bg-card/95 p-gutter backdrop-blur">
              <FilterNav
                mode="anchor"
                items={[
                  { label: 'Packages', value: 'packages' },
                  { label: 'Add-ons', value: 'addons' },
                  { label: 'Process', value: 'process' },
                  { label: 'FAQs', value: 'faqs' },
                ]}
              />
            </div>
            <div className="p-gutter">
              <p className="text-body-md text-muted-foreground">
                The FilterNav would remain visible when scrolling, allowing easy
                navigation between sections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
}
