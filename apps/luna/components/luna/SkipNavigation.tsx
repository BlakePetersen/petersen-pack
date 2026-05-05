// ABOUTME: Skip navigation link for screen readers
// ABOUTME: Allows keyboard users to skip directly to main content

export default function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-gray-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:bg-gray-900 dark:focus:text-white"
    >
      Skip to main content
    </a>
  )
}
