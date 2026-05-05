// ABOUTME: Sol (Admin) design system showcase page
// ABOUTME: Kitchen sink of all admin-specific component primitives with dark mode support

'use client'

import { DesignSystemNav } from '@/components/sol/DesignSystemNav'

const sections = [
  { id: 'architecture', label: 'Architecture' },
  { id: 'status-badges', label: 'Status Badges' },
  { id: 'dashboard-cards', label: 'Dashboard Stat Cards' },
  { id: 'content-cards', label: 'Content Cards' },
  { id: 'filter-tabs', label: 'Filter Tabs' },
  { id: 'data-tables', label: 'Data Tables' },
  { id: 'form-patterns', label: 'Form Patterns' },
  { id: 'empty-states', label: 'Empty States' },
  { id: 'design-tokens', label: 'Design Tokens' },
]

export default function SolDesignSystemPage() {
  return (
    <div className="container-gutter py-section">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <svg
            className="h-8 w-8 text-amber-500 dark:text-amber-400"
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
          <div>
            <h1 className="text-heading-xl font-bold">Sol Design System</h1>
            <p className="text-body-sm text-muted-foreground">
              Admin interface component primitives and design tokens
            </p>
          </div>
        </div>
        <a
          href="/admin/design-system"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
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
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <span>View Luna (Public)</span>
        </a>
      </div>

      {/* Two Column Layout: Sidebar + Content */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[250px_1fr]">
        {/* Sticky Sidebar Navigation */}
        <aside className="hidden lg:block">
          <DesignSystemNav sections={sections} />
        </aside>

        {/* Main Content */}
        <div className="min-w-0">
          {/* Architecture Overview */}
          <section
            id="architecture"
            className="mb-8 border-b border-gray-200 py-8 dark:border-gray-700"
          >
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Architecture
            </h2>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
              The Sol Design System is part of Luna&apos;s comprehensive design
              system architecture, organized into three main directories:
            </p>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Commons Card */}
              <div className="rounded-lg border-2 border-gray-200 p-6 dark:border-gray-800">
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

              {/* Luna Card */}
              <div className="rounded-lg border-2 border-blue-200 p-6 dark:border-blue-800">
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

              {/* Sol Card - Highlighted */}
              <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-950">
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
                    Sol{' '}
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      (You are here)
                    </span>
                  </h3>
                </div>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Admin interface and CMS management components
                </p>
                <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                  /components/sol/
                </code>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
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
                For detailed information on contributing, patterns, testing, and
                code standards, see our documentation:
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
          </section>

          {/* Status Badges */}
          <section
            id="status-badges"
            className="border-b border-gray-200 py-8 dark:border-gray-700"
          >
            <h2 className="mb-4 text-heading-lg font-semibold">
              Status Badges
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-heading-sm font-medium">
                  Inquiry Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    NEW
                  </span>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    CONTACTED
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    QUOTED
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    CONVERTED
                  </span>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    ARCHIVED
                  </span>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-heading-sm font-medium">
                  Booking Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    PENDING
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    CONFIRMED
                  </span>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    COMPLETED
                  </span>
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                    CANCELLED
                  </span>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-heading-sm font-medium">
                  Retouch Request Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    PENDING
                  </span>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    IN_PROGRESS
                  </span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    COMPLETED
                  </span>
                  <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                    DECLINED
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Dashboard Stat Cards */}
          <section
            id="dashboard-cards"
            className="border-b border-gray-200 py-8 dark:border-gray-700"
          >
            <h2 className="mb-4 text-heading-lg font-semibold">
              Dashboard Stat Cards
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Inquiries
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  42
                </p>
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                  +12% from last month
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Bookings
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  8
                </p>
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  3 this week
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Client Galleries
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  15
                </p>
                <p className="mt-2 text-sm text-purple-600 dark:text-purple-400">
                  2 pending delivery
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Retouch Requests
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  5
                </p>
                <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                  2 in progress
                </p>
              </div>
            </div>
          </section>

          {/* Content Cards */}
          <section
            id="content-cards"
            className="border-b border-gray-200 py-8 dark:border-gray-700"
          >
            <h2 className="mb-4 text-heading-lg font-semibold">
              Content Cards
            </h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Gallery Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Smith Family Session
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Created on March 15, 2024
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>24 images</span>
                  <span>•</span>
                  <span>Expires in 15 days</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    View Gallery
                  </button>
                  <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    Edit
                  </button>
                </div>
              </div>

              {/* Booking Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Johnson Wedding
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      June 20, 2024 at 2:00 PM
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Pending
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Location:</span>
                    <span>Golden Gate Park</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Package:</span>
                    <span>Premium Wedding</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    View Details
                  </button>
                  <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    Contact Client
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Filter Tabs */}
          <section
            id="filter-tabs"
            className="border-b border-gray-200 py-8 dark:border-gray-700"
          >
            <h2 className="mb-4 text-heading-lg font-semibold">Filter Tabs</h2>

            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                <button className="border-b-2 border-blue-600 px-1 py-4 text-sm font-medium text-blue-600 dark:border-blue-400 dark:text-blue-400">
                  All Items (24)
                </button>
                <button className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200">
                  Active (18)
                </button>
                <button className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200">
                  Pending (4)
                </button>
                <button className="border-b-2 border-transparent px-1 py-4 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200">
                  Archived (2)
                </button>
              </nav>
            </div>
          </section>

          {/* Data Tables */}
          <section
            id="data-tables"
            className="border-b border-gray-200 py-8 dark:border-gray-700"
          >
            <h2 className="mb-4 text-heading-lg font-semibold">Data Tables</h2>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      Sarah Smith
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      Family Session
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        Confirmed
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      Mar 15, 2024
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <button className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        View
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      Michael Johnson
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      Wedding
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        Pending
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      Jun 20, 2024
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <button className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        View
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      Emily Davis
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      Maternity
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Completed
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      Feb 28, 2024
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <button className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Form Patterns */}
          <section
            id="form-patterns"
            className="border-b border-gray-200 py-8 dark:border-gray-700"
          >
            <h2 className="mb-4 text-heading-lg font-semibold">
              Form Patterns
            </h2>

            <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="client-name"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Client Name
                  </label>
                  <input
                    type="text"
                    id="client-name"
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="Enter client name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="session-type"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Session Type
                  </label>
                  <select
                    id="session-type"
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option>Family Session</option>
                    <option>Wedding</option>
                    <option>Maternity</option>
                    <option>Engagement</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                    placeholder="Add any relevant notes..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="send-confirmation"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label
                    htmlFor="send-confirmation"
                    className="text-sm text-gray-900 dark:text-white"
                  >
                    Send confirmation email
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Empty States */}
          <section
            id="empty-states"
            className="border-b border-gray-200 py-8 dark:border-gray-700"
          >
            <h2 className="mb-4 text-heading-lg font-semibold">Empty States</h2>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* No Results Empty State */}
              <div className="rounded-xl border border-gray-200 bg-white p-gutter-lg text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  No inquiries found
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Get started by creating your first inquiry or adjust your
                  filters.
                </p>
                <button className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  Create Inquiry
                </button>
              </div>

              {/* No Data Empty State */}
              <div className="rounded-xl border border-gray-200 bg-white p-gutter-lg text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  No galleries yet
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Upload your first gallery to share with clients.
                </p>
                <button className="mt-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                  Upload Gallery
                </button>
              </div>
            </div>
          </section>

          {/* Design Tokens */}
          <section id="design-tokens" className="py-8">
            <h2 className="mb-4 text-heading-lg font-semibold">
              Design Tokens
            </h2>

            <div className="space-y-8">
              {/* Color Palette */}
              <div>
                <h3 className="mb-3 text-heading-sm font-medium">
                  Admin Color Palette
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <div className="h-20 rounded-lg bg-blue-600 dark:bg-blue-500"></div>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Primary
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      #2563eb / #3b82f6
                    </p>
                  </div>
                  <div>
                    <div className="h-20 rounded-lg bg-green-600 dark:bg-green-500"></div>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Success
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      #16a34a / #22c55e
                    </p>
                  </div>
                  <div>
                    <div className="h-20 rounded-lg bg-yellow-600 dark:bg-yellow-500"></div>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Warning
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      #ca8a04 / #eab308
                    </p>
                  </div>
                  <div>
                    <div className="h-20 rounded-lg bg-red-600 dark:bg-red-500"></div>
                    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Danger
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      #dc2626 / #ef4444
                    </p>
                  </div>
                </div>
              </div>

              {/* Spacing */}
              <div>
                <h3 className="mb-3 text-heading-sm font-medium">
                  Spacing Scale
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                      Gutter
                    </div>
                    <div
                      className="h-4 bg-blue-200 dark:bg-blue-800"
                      style={{ width: 'var(--container-gutter)' }}
                    ></div>
                    <code className="text-sm text-gray-900 dark:text-white">
                      1.5rem / 2rem
                    </code>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                      Section
                    </div>
                    <div
                      className="h-4 bg-blue-200 dark:bg-blue-800"
                      style={{ width: 'var(--section-spacing)' }}
                    ></div>
                    <code className="text-sm text-gray-900 dark:text-white">
                      4rem / 6rem
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
