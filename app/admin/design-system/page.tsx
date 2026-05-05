// ABOUTME: Design system kitchen sink showcase page
// ABOUTME: Displays all design primitives and components in one view

'use client'

import { logger } from '@/lib/logger.edge'
import {
  Button,
  ButtonLink,
  Container,
  Section,
  Heading,
  Badge,
  Card,
  PageHeader,
  IconBadge,
  FilterNav,
  ContentCard,
} from '@/components/commons'
import { DesignSystemNav } from '@/components/sol/DesignSystemNav'

const sections = [
  { id: 'architecture', label: 'Architecture' },
  {
    id: 'foundations',
    label: 'Foundations',
    subsections: [
      { id: 'spacing', label: 'Spacing' },
      { id: 'typography', label: 'Typography' },
      { id: 'colors', label: 'Colors' },
      { id: 'border-radius', label: 'Border Radius' },
    ],
  },
  {
    id: 'components',
    label: 'Components',
    subsections: [
      { id: 'buttons', label: 'Buttons' },
      { id: 'badges', label: 'Badges' },
      { id: 'cards', label: 'Cards' },
    ],
  },
  {
    id: 'layout',
    label: 'Layout',
    subsections: [
      { id: 'layout-components', label: 'Layout Components' },
      { id: 'page-header', label: 'PageHeader' },
    ],
  },
  {
    id: 'specialized',
    label: 'Specialized',
    subsections: [
      { id: 'icon-badge', label: 'IconBadge' },
      { id: 'filter-nav', label: 'FilterNav' },
      { id: 'content-card', label: 'ContentCard' },
    ],
  },
  {
    id: 'patterns',
    label: 'Patterns',
    subsections: [
      { id: 'gradients', label: 'Gradients' },
      { id: 'forms', label: 'Forms' },
    ],
  },
  {
    id: 'admin',
    label: 'Admin UI',
    subsections: [
      { id: 'admin-badges', label: 'Status Badges' },
      { id: 'admin-cards', label: 'Card Patterns' },
      { id: 'admin-tables', label: 'Table Patterns' },
      { id: 'admin-forms', label: 'Form Patterns' },
      { id: 'admin-empty', label: 'Empty States' },
    ],
  },
]

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white bg-white/95 backdrop-blur-sm dark:bg-gray-950 dark:bg-gray-950/95">
        <Container>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <svg
                className="h-8 w-8 text-blue-500 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              <div>
                <h1 className="text-heading-xl font-bold">
                  Luna Design System
                </h1>
                <p className="text-body-sm text-muted-foreground">
                  Public site component primitives and design tokens
                </p>
              </div>
            </div>
            <a
              href="/admin/design-system-admin"
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>View Sol (Admin)</span>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </a>
          </div>
        </Container>
      </div>

      {/* Two Column Layout: Sidebar + Content */}
      <div className="container mx-auto px-gutter py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sticky Sidebar Navigation */}
          <aside className="hidden lg:block">
            <DesignSystemNav sections={sections} />
          </aside>

          {/* Main Content */}
          <div className="min-w-0">
            {/* Architecture Overview */}
            <Section className="mb-12" id="architecture">
              <Container>
                <div className="prose max-w-none dark:prose-invert">
                  <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                    Architecture
                  </h2>
                  <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                    The Luna Design System is organized into three main
                    directories, each serving a specific purpose in our
                    architecture:
                  </p>

                  <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Commons Card */}
                    <Card className="border-2 border-gray-200 dark:border-gray-800">
                      <div className="p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                            <svg
                              className="h-6 w-6 text-blue-600 dark:text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Commons
                          </h3>
                        </div>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                          Shared primitive components used by both Luna and Sol
                        </p>
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                          /components/commons/
                        </code>
                      </div>
                    </Card>

                    {/* Luna Card */}
                    <Card className="border-2 border-blue-200 dark:border-blue-800">
                      <div className="p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                            <svg
                              className="h-6 w-6 text-blue-600 dark:text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Luna
                          </h3>
                        </div>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                          Public-facing portfolio and client components
                        </p>
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                          /components/luna/
                        </code>
                      </div>
                    </Card>

                    {/* Sol Card */}
                    <Card className="border-2 border-orange-200 dark:border-orange-800">
                      <div className="p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900">
                            <svg
                              className="h-6 w-6 text-orange-600 dark:text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Sol
                          </h3>
                        </div>
                        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                          Admin interface and CMS management components
                        </p>
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                          /components/sol/
                        </code>
                      </div>
                    </Card>
                  </div>

                  <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                      <svg
                        className="h-5 w-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Comprehensive Documentation
                    </h3>
                    <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                      For detailed information on contributing, patterns,
                      testing, and code standards, see our documentation:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href="https://github.com/yourusername/luna/blob/main/docs/design-system/README.md"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Architecture Overview
                      </a>
                      <a
                        href="https://github.com/yourusername/luna/blob/main/docs/design-system/patterns.md"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                        Design Patterns
                      </a>
                      <a
                        href="https://github.com/yourusername/luna/blob/main/docs/design-system/testing.md"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        Testing Guidelines
                      </a>
                      <a
                        href="https://github.com/yourusername/luna/blob/main/docs/design-system/linting.md"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                        Code Standards
                      </a>
                      <a
                        href="https://github.com/yourusername/luna/blob/main/docs/design-system/contributing.md"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        Contributing Guide
                      </a>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Foundations Section Header */}
            <div id="foundations" className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Foundations
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Core design tokens and visual primitives
              </p>
            </div>

            {/* Spacing */}
            <Section id="spacing">
              <Container>
                <Heading as="h2" className="mb-8">
                  Spacing Tokens
                </Heading>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Gutter (24px / 1.5rem)
                    </h3>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <div className="bg-blue-100 p-gutter dark:bg-blue-900">
                        <div className="bg-white p-4 text-body-sm dark:bg-gray-950">
                          Content with p-gutter padding
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Section Spacing (96px / 6rem)
                    </h3>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <div className="bg-green-100 py-section dark:bg-green-900">
                        <div className="mx-auto max-w-xs bg-white p-4 text-center text-body-sm dark:bg-gray-950">
                          Content with py-section padding
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Section Spacing Small (64px / 4rem)
                    </h3>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <div className="bg-purple-100 py-section-sm dark:bg-purple-900">
                        <div className="mx-auto max-w-xs bg-white p-4 text-center text-body-sm dark:bg-gray-950">
                          Content with py-section-sm padding
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Typography */}
            <Section className="bg-gray-50 dark:bg-gray-900" id="typography">
              <Container>
                <Heading as="h2" className="mb-8">
                  Typography - Display
                </Heading>

                <div className="space-y-6 rounded-lg bg-white p-gutter dark:bg-gray-950">
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      display-xl (80px)
                    </p>
                    <p className="text-display-xl">The quick brown fox</p>
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      display-lg (64px)
                    </p>
                    <p className="text-display-lg">The quick brown fox</p>
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      display-md (48px)
                    </p>
                    <p className="text-display-md">The quick brown fox</p>
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      display-sm (40px)
                    </p>
                    <p className="text-display-sm">The quick brown fox</p>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Typography - Headings (merged into typography section above) */}
            <Section>
              <Container>
                <Heading as="h2" className="mb-8">
                  Typography - Headings
                </Heading>

                <div className="space-y-6 rounded-lg border bg-white p-gutter dark:bg-gray-950">
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      heading-xl (32px) - h1
                    </p>
                    <h1 className="text-heading-xl">
                      The quick brown fox jumps over
                    </h1>
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      heading-lg (28px) - h2
                    </p>
                    <h2 className="text-heading-lg">
                      The quick brown fox jumps over
                    </h2>
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      heading-md (24px) - h3
                    </p>
                    <h3 className="text-heading-md">
                      The quick brown fox jumps over
                    </h3>
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      heading-sm (20px) - h4
                    </p>
                    <h4 className="text-heading-sm">
                      The quick brown fox jumps over
                    </h4>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Typography - Body */}
            <Section className="bg-gray-50 dark:bg-gray-900">
              <Container>
                <Heading as="h2" className="mb-8">
                  Typography - Body Text
                </Heading>

                <div className="space-y-6 rounded-lg bg-white p-gutter dark:bg-gray-950">
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      body-lg (18px)
                    </p>
                    <p className="text-body-lg">
                      The quick brown fox jumps over the lazy dog. Professional
                      photography services for all occasions.
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      body-md (16px)
                    </p>
                    <p className="text-body-md">
                      The quick brown fox jumps over the lazy dog. Professional
                      photography services for all occasions.
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      body-sm (14px)
                    </p>
                    <p className="text-body-sm">
                      The quick brown fox jumps over the lazy dog. Professional
                      photography services for all occasions.
                    </p>
                  </div>
                  <div>
                    <p className="mb-2 text-caption text-muted-foreground">
                      caption (12px)
                    </p>
                    <p className="text-caption">
                      The quick brown fox jumps over the lazy dog. Professional
                      photography services for all occasions.
                    </p>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Components Section Header */}
            <div id="components" className="mb-8 mt-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Components
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Reusable UI components
              </p>
            </div>

            {/* Buttons */}
            <Section id="buttons">
              <Container>
                <Heading as="h2" className="mb-8">
                  Buttons
                </Heading>

                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-heading-sm">Variants</h3>
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
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Sizes</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button size="sm">Small</Button>
                      <Button size="default">Default</Button>
                      <Button size="lg">Large</Button>
                      <Button size="icon">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">States</h3>
                    <div className="flex flex-wrap gap-4">
                      <Button>Normal</Button>
                      <Button disabled>Disabled</Button>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Badges */}
            <Section className="bg-gray-50 dark:bg-gray-900" id="badges">
              <Container>
                <Heading as="h2" className="mb-8">
                  Badges
                </Heading>

                <div className="flex flex-wrap gap-4">
                  <Badge variant="solid">Solid</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="accent">Accent</Badge>
                </div>
              </Container>
            </Section>

            {/* Cards */}
            <Section id="cards">
              <Container>
                <Heading as="h2" className="mb-8">
                  Cards
                </Heading>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="p-6">
                    <h3 className="mb-2 text-heading-md">Card Title</h3>
                    <p className="mb-4 text-body-sm text-muted-foreground">
                      This is a basic card component with standard styling.
                    </p>
                    <Button size="sm">Action</Button>
                  </Card>

                  <Card className="border-2 border-primary p-6">
                    <h3 className="mb-2 text-heading-md">Highlighted Card</h3>
                    <p className="mb-4 text-body-sm text-muted-foreground">
                      This card has a highlighted border to draw attention.
                    </p>
                    <Button variant="primary" size="sm">
                      Action
                    </Button>
                  </Card>

                  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                    <h3 className="mb-2 text-heading-md">Gradient Card</h3>
                    <p className="mb-4 text-body-sm text-muted-foreground">
                      This card has a subtle gradient background.
                    </p>
                    <Button variant="outline" size="sm">
                      Action
                    </Button>
                  </Card>
                </div>
              </Container>
            </Section>

            {/* Colors */}
            <Section className="bg-gray-50 dark:bg-gray-900" id="colors">
              <Container>
                <Heading as="h2" className="mb-8">
                  Color System
                </Heading>

                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-heading-sm">Semantic Colors</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg border bg-background" />
                        <p className="text-body-sm font-medium">Background</p>
                        <code className="text-caption">bg-background</code>
                      </div>
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-primary" />
                        <p className="text-body-sm font-medium">Primary</p>
                        <code className="text-caption">bg-primary</code>
                      </div>
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-secondary" />
                        <p className="text-body-sm font-medium">Secondary</p>
                        <code className="text-caption">bg-secondary</code>
                      </div>
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-accent" />
                        <p className="text-body-sm font-medium">Accent</p>
                        <code className="text-caption">bg-accent</code>
                      </div>
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-destructive" />
                        <p className="text-body-sm font-medium">Destructive</p>
                        <code className="text-caption">bg-destructive</code>
                      </div>
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg bg-muted" />
                        <p className="text-body-sm font-medium">Muted</p>
                        <code className="text-caption">bg-muted</code>
                      </div>
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg border-2 border-border" />
                        <p className="text-body-sm font-medium">Border</p>
                        <code className="text-caption">border-border</code>
                      </div>
                      <div className="space-y-2">
                        <div className="h-24 rounded-lg border bg-card" />
                        <p className="text-body-sm font-medium">Card</p>
                        <code className="text-caption">bg-card</code>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Border Radius */}
            <Section id="border-radius">
              <Container>
                <Heading as="h2" className="mb-8">
                  Border Radius
                </Heading>

                <div className="grid gap-6 md:grid-cols-4">
                  <div className="text-center">
                    <div className="mb-2 h-24 rounded-sm bg-primary/10" />
                    <p className="text-body-sm font-medium">Small</p>
                    <code className="text-caption">rounded-sm</code>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 h-24 rounded-md bg-primary/10" />
                    <p className="text-body-sm font-medium">Medium</p>
                    <code className="text-caption">rounded-md</code>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 h-24 rounded-lg bg-primary/10" />
                    <p className="text-body-sm font-medium">Large</p>
                    <code className="text-caption">rounded-lg</code>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 h-24 rounded-full bg-primary/10" />
                    <p className="text-body-sm font-medium">Full</p>
                    <code className="text-caption">rounded-full</code>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Layout Section Header */}
            <div id="layout" className="mb-8 mt-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Layout
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Layout primitives and containers
              </p>
            </div>

            {/* Component Examples */}
            <Section
              className="bg-gray-50 dark:bg-gray-900"
              id="layout-components"
            >
              <Container>
                <Heading as="h2" className="mb-8">
                  Layout Components
                </Heading>

                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-heading-sm">Section Component</h3>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <Section className="!py-8">
                        <Container>
                          <p className="text-body-md">
                            Section component with white variant and Container
                            inside
                          </p>
                        </Container>
                      </Section>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Container Sizes</h3>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Container size="sm">
                          <p className="rounded bg-blue-100 p-4 text-body-sm dark:bg-blue-900">
                            Small (max-w-3xl)
                          </p>
                        </Container>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Container size="md">
                          <p className="rounded bg-green-100 p-4 text-body-sm dark:bg-green-900">
                            Medium (max-w-5xl)
                          </p>
                        </Container>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <Container size="lg">
                          <p className="rounded bg-purple-100 p-4 text-body-sm dark:bg-purple-900">
                            Large (max-w-7xl)
                          </p>
                        </Container>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* PageHeader Component */}
            <Section id="page-header">
              <Container>
                <Heading as="h2" className="mb-8">
                  PageHeader Component
                </Heading>
                <p className="mb-8 text-gray-600 dark:text-gray-400">
                  Scroll-triggered sticky header with frosted glass effect.
                  Hidden initially, fades in after scrolling ~100px.
                </p>

                <div className="space-y-12">
                  <div>
                    <h3 className="mb-4 text-heading-sm">Title Only</h3>
                    <pre className="rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
                      {`<PageHeader title="Portfolio" />`}
                    </pre>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">With Breadcrumb</h3>
                    <pre className="rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800">
                      {`<PageHeader
  title="Lifestyle"
  breadcrumb={[{ label: 'Portfolio', href: '/portfolio' }]}
/>`}
                    </pre>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Specialized Section Header */}
            <div id="specialized" className="mb-8 mt-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Specialized Components
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Purpose-built UI components
              </p>
            </div>

            {/* IconBadge Component */}
            <Section className="bg-gray-50 dark:bg-gray-900" id="icon-badge">
              <Container>
                <Heading as="h2" className="mb-8">
                  IconBadge Component
                </Heading>

                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-heading-sm">Sizes</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-center">
                        <IconBadge
                          size="sm"
                          icon={
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
                          }
                        />
                        <p className="mt-2 text-caption">Small (32px)</p>
                      </div>
                      <div className="text-center">
                        <IconBadge
                          size="md"
                          icon={
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
                          }
                        />
                        <p className="mt-2 text-caption">Medium (40px)</p>
                      </div>
                      <div className="text-center">
                        <IconBadge
                          size="lg"
                          icon={
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
                          }
                        />
                        <p className="mt-2 text-caption">Large (48px)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* FilterNav Component */}
            <Section id="filter-nav">
              <Container>
                <Heading as="h2" className="mb-8">
                  FilterNav Component
                </Heading>

                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-heading-sm">Filter Mode</h3>
                    <FilterNav
                      mode="filter"
                      items={[
                        { label: 'Portrait', value: 'portrait' },
                        { label: 'Landscape', value: 'landscape' },
                        { label: 'Wedding', value: 'wedding' },
                        { label: 'Commercial', value: 'commercial' },
                      ]}
                      onFilterChange={(value) =>
                        logger.info({ value }, 'Filter changed')
                      }
                    />
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Anchor Mode (for section navigation)
                    </h3>
                    <FilterNav
                      mode="anchor"
                      items={[
                        { label: 'Services', value: 'services' },
                        { label: 'Portfolio', value: 'portfolio' },
                        { label: 'About', value: 'about' },
                        { label: 'Contact', value: 'contact' },
                      ]}
                    />
                  </div>
                </div>
              </Container>
            </Section>

            {/* ContentCard Component */}
            <Section className="bg-gray-50 dark:bg-gray-900" id="content-card">
              <Container>
                <Heading as="h2" className="mb-8">
                  ContentCard Component
                </Heading>

                <div className="grid gap-6 md:grid-cols-2">
                  <ContentCard
                    href="#"
                    image={{
                      src: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
                      alt: 'Portrait photography',
                      focalX: 0.5,
                      focalY: 0.3,
                    }}
                    badge={{
                      text: 'Featured',
                      variant: 'primary',
                    }}
                    title="Summer Portrait Session"
                    subtitle="Portrait Photography"
                    description="Beautiful outdoor portrait session capturing natural moments in golden hour light."
                    metadata={
                      <div className="flex items-center gap-4 text-caption">
                        <span>June 15, 2024</span>
                        <span>•</span>
                        <span>24 images</span>
                      </div>
                    }
                  />

                  <ContentCard
                    href="#"
                    image={{
                      src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop',
                      alt: 'Wedding photography',
                      focalX: 0.5,
                      focalY: 0.4,
                    }}
                    badge={{
                      text: 'New',
                      variant: 'accent',
                    }}
                    title="Elegant Wedding Ceremony"
                    subtitle="Wedding Photography"
                    description="Documenting the special moments of a beautiful wedding day filled with love and joy."
                    metadata={
                      <div className="flex items-center gap-4 text-caption">
                        <span>July 1, 2024</span>
                        <span>•</span>
                        <span>150 images</span>
                      </div>
                    }
                  />
                </div>
              </Container>
            </Section>

            {/* Patterns Section Header */}
            <div id="patterns" className="mb-8 mt-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Patterns
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Common design patterns and utilities
              </p>
            </div>

            {/* Gradient Patterns */}
            <Section className="bg-gray-50 dark:bg-gray-900" id="gradients">
              <Container>
                <Heading as="h2" className="mb-8">
                  Gradient Patterns
                </Heading>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Primary Brand Gradient
                    </h3>
                    <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-orange-400">
                      <code className="rounded bg-black/20 px-3 py-1 text-sm text-white">
                        from-cyan-500 to-orange-400
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Primary to Accent</h3>
                    <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-r from-primary-600 to-accent-600">
                      <code className="rounded bg-black/20 px-3 py-1 text-sm text-white">
                        from-primary-600 to-accent-600
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Subtle Background Gradient
                    </h3>
                    <div className="flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-accent-100 dark:from-gray-700 dark:to-gray-600">
                      <code className="rounded bg-white/60 px-3 py-1 text-sm text-gray-700 dark:bg-black/20 dark:text-white">
                        from-primary-100 to-accent-100
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Overlay Gradient (hover state)
                    </h3>
                    <div className="group relative h-32 cursor-pointer overflow-hidden rounded-lg bg-gray-300 dark:bg-gray-700">
                      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent pb-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-sm text-white">
                          Hover to see gradient
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Input and Form Patterns */}
            <Section id="forms">
              <Container>
                <Heading as="h2" className="mb-8">
                  Input & Form Patterns
                </Heading>

                <div className="max-w-2xl space-y-6">
                  <div>
                    <h3 className="mb-4 text-heading-sm">Default Input</h3>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Success State</h3>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value="john@example.com"
                      readOnly
                      className="w-full rounded-lg border border-green-400 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-green-100 dark:border-green-500 dark:bg-gray-800 dark:text-white dark:focus:ring-green-900"
                    />
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Error State</h3>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value="invalid-email"
                      readOnly
                      className="w-full rounded-lg border border-red-400 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-red-100 dark:border-red-500 dark:bg-gray-800 dark:text-white dark:focus:ring-red-900"
                    />
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Please enter a valid email address
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Textarea</h3>
                    <textarea
                      placeholder="Enter your message..."
                      rows={4}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Select Dropdown</h3>
                    <select className="w-full rounded-lg border border-gray-200 px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-900">
                      <option>Select a service...</option>
                      <option>Portrait Photography</option>
                      <option>Wedding Photography</option>
                      <option>Commercial Photography</option>
                    </select>
                  </div>
                </div>
              </Container>
            </Section>

            {/* ADMIN PRIMITIVES SECTION */}
            <div id="admin" className="mb-8 mt-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin UI Primitives
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Components and patterns for admin interfaces
              </p>
            </div>

            <Section className="bg-gray-50 dark:bg-gray-900">
              <Container>
                <div className="mb-12 text-center">
                  <Heading as="h1" className="mb-4">
                    Admin Primitives
                  </Heading>
                  <p className="text-body-lg text-gray-600 dark:text-gray-400">
                    Components and patterns specific to the admin interface
                  </p>
                </div>
              </Container>
            </Section>

            {/* Admin Status Badges */}
            <Section id="admin-badges">
              <Container>
                <Heading as="h2" className="mb-8">
                  Admin Status Badges
                </Heading>

                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Inquiry Status Badges
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        NEW
                      </span>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        CONTACTED
                      </span>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                        CONVERTED
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        CLOSED
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Feature Badges</h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Featured
                      </span>
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Popular
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        Inactive
                      </span>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        🔒 Protected
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Availability Status
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Available
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        Unavailable
                      </span>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Admin Cards */}
            <Section className="bg-gray-50 dark:bg-gray-900" id="admin-cards">
              <Container>
                <Heading as="h2" className="mb-8">
                  Admin Card Patterns
                </Heading>

                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Dashboard Stat Cards
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {/* Stat Card 1 */}
                      <div className="rounded-lg bg-white p-gutter shadow-soft dark:bg-gray-800">
                        <div className="flex items-center">
                          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900">
                            <svg
                              className="h-6 w-6 text-blue-600 dark:text-blue-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Total Clients
                            </p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">
                              24
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stat Card 2 */}
                      <div className="rounded-lg bg-white p-gutter shadow-soft dark:bg-gray-800">
                        <div className="flex items-center">
                          <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900">
                            <svg
                              className="h-6 w-6 text-purple-600 dark:text-purple-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Galleries
                            </p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">
                              12
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stat Card 3 */}
                      <div className="rounded-lg bg-white p-gutter shadow-soft dark:bg-gray-800">
                        <div className="flex items-center">
                          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900">
                            <svg
                              className="h-6 w-6 text-green-600 dark:text-green-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Bookings
                            </p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">
                              8
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stat Card 4 */}
                      <div className="rounded-lg bg-white p-gutter shadow-soft dark:bg-gray-800">
                        <div className="flex items-center">
                          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900">
                            <svg
                              className="h-6 w-6 text-yellow-600 dark:text-yellow-200"
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
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Inquiries
                            </p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">
                              5
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Content Cards</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Gallery Card */}
                      <div className="rounded-lg border border-gray-200 bg-white p-gutter shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Summer Portraits 2024
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              24 images
                            </p>
                          </div>
                          <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Featured
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700">
                            Manage Images
                          </button>
                          <button className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                            View
                          </button>
                        </div>
                      </div>

                      {/* Booking Card */}
                      <div className="rounded-lg border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                John Smith
                              </h3>
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Pending
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              john@example.com
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span>Dec 15, 2024</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>2:00 PM</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                            Confirm
                          </button>
                          <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Admin Tables */}
            <Section id="admin-tables">
              <Container>
                <Heading as="h2" className="mb-8">
                  Admin Table Patterns
                </Heading>

                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-heading-sm">Filter Tabs</h3>
                    <div className="border-b border-gray-200 dark:border-gray-700">
                      <div className="-mb-px flex space-x-8">
                        <button className="whitespace-nowrap border-b-2 border-blue-500 px-1 pb-4 text-sm font-medium text-blue-600 dark:border-blue-400 dark:text-blue-400">
                          All
                          <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-300">
                            12
                          </span>
                        </button>
                        <button className="whitespace-nowrap border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300">
                          New
                          <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-300">
                            5
                          </span>
                        </button>
                        <button className="whitespace-nowrap border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300">
                          Contacted
                          <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-300">
                            4
                          </span>
                        </button>
                        <button className="whitespace-nowrap border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300">
                          Converted
                          <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-300">
                            3
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Data Table</h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                            >
                              Name
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                            >
                              Email
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                            >
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              John Smith
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              john@example.com
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                NEW
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              Dec 15, 2024
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              Jane Doe
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              jane@example.com
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                                CONVERTED
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              Dec 12, 2024
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Admin Forms */}
            <Section className="bg-gray-50 dark:bg-gray-900" id="admin-forms">
              <Container>
                <Heading as="h2" className="mb-8">
                  Admin Form Patterns
                </Heading>

                <div className="max-w-2xl space-y-8">
                  <div>
                    <h3 className="mb-4 text-heading-sm">Form Fields</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Title
                        </label>
                        <input
                          type="text"
                          placeholder="Enter title"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Enter description"
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Published
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Action Buttons</h3>
                    <div className="flex gap-4">
                      <button className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
                        Save Changes
                      </button>
                      <button className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                        Cancel
                      </button>
                      <button className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 focus:outline-none dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>

            {/* Admin Empty States */}
            <Section id="admin-empty">
              <Container>
                <Heading as="h2" className="mb-8">
                  Admin Empty States
                </Heading>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="mb-4 text-heading-sm">
                      Dashed Border Style
                    </h3>
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                        No galleries yet
                      </h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Get started by creating your first gallery
                      </p>
                      <button className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
                        Create Gallery
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-heading-sm">Solid Border Style</h3>
                    <div className="rounded-lg bg-white p-gutter-lg text-center shadow dark:bg-gray-800">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
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
                      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                        No inquiries
                      </h3>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Inquiries will appear here when clients contact you
                      </p>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-900 py-section-sm text-white">
        <Container>
          <p className="text-center text-body-sm">
            Design System v1.0.0 · Luna Photography
          </p>
        </Container>
      </div>
    </div>
  )
}
