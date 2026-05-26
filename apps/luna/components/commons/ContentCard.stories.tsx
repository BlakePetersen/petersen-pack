// ABOUTME: Storybook stories for ContentCard component
// ABOUTME: Demonstrates content cards with images, badges, and metadata

import type { Meta, StoryObj } from '@storybook/nextjs'
import { ContentCard } from './Card'

const meta = {
  title: 'Design System/ContentCard',
  component: ContentCard,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ContentCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    href: '#',
    image: {
      src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
      alt: 'Portrait photography',
      focalX: 0.5,
      focalY: 0.3,
    },
    title: 'Summer Portrait Session',
    subtitle: 'Portrait Photography',
    description:
      'Beautiful outdoor portrait session capturing natural moments in golden hour light.',
    metadata: (
      <div className="flex items-center gap-4 text-caption">
        <span>June 15, 2024</span>
        <span>•</span>
        <span>24 images</span>
      </div>
    ),
  },
}

export const WithBadge: Story = {
  args: {
    ...Default.args,
    badge: {
      text: 'Featured',
      variant: 'primary',
    },
  },
}

export const BlogPost: Story = {
  args: {
    href: '#',
    image: {
      src: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop',
      alt: 'Camera and notebook',
      focalX: 0.5,
      focalY: 0.4,
    },
    badge: {
      text: 'Tips',
      variant: 'accent',
    },
    title: '10 Tips for Perfect Golden Hour Photos',
    subtitle: 'Photography Tips',
    description:
      'Learn how to make the most of that magical hour before sunset for stunning portrait photography.',
    metadata: (
      <div className="flex items-center gap-4 text-caption text-muted-foreground">
        <span>March 12, 2024</span>
        <span>•</span>
        <span>5 min read</span>
      </div>
    ),
  },
}

export const GalleryCard: Story = {
  args: {
    href: '#',
    image: {
      src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
      alt: 'Wedding ceremony',
      focalX: 0.5,
      focalY: 0.35,
    },
    badge: {
      text: 'New',
      variant: 'primary',
    },
    title: 'Sarah & Michael Wedding',
    subtitle: 'Wedding Photography',
    description:
      'A beautiful celebration of love at Golden Gate Park, documenting every precious moment of their special day.',
    metadata: (
      <div className="flex items-center gap-4 text-caption text-muted-foreground">
        <span>150 images</span>
        <span>•</span>
        <span>April 2024</span>
      </div>
    ),
  },
}

export const GridLayout: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 font-serif text-heading-lg">
          ContentCard Grid Layout
        </h2>
        <p className="mb-8 text-body-md text-muted-foreground">
          ContentCards are typically displayed in a responsive grid for
          galleries, blog posts, or portfolio items.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ContentCard
          href="#"
          image={{
            src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
            alt: 'Portrait',
            focalX: 0.5,
            focalY: 0.3,
          }}
          badge={{ text: 'Featured', variant: 'primary' }}
          title="Summer Portraits"
          subtitle="Portrait Session"
          description="Golden hour portraits in the park"
        />
        <ContentCard
          href="#"
          image={{
            src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
            alt: 'Wedding',
            focalX: 0.5,
            focalY: 0.4,
          }}
          badge={{ text: 'New', variant: 'accent' }}
          title="Beach Wedding"
          subtitle="Wedding Photography"
          description="Intimate ceremony by the ocean"
        />
        <ContentCard
          href="#"
          image={{
            src: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=600&fit=crop',
            alt: 'Maternity',
            focalX: 0.5,
            focalY: 0.5,
          }}
          title="Expecting Joy"
          subtitle="Maternity Session"
          description="Celebrating new beginnings"
        />
      </div>
    </div>
  ),
}
