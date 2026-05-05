// ABOUTME: Hyperlink-style CTA with arrow icon
// ABOUTME: Minimal text link with hover effects, used for subtle navigation prompts

import Link from 'next/link'

type ArrowLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export function ArrowLink({ href, children, className = '' }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 text-lg text-gray-900 transition-colors hover:text-gray-700 dark:text-white dark:hover:text-gray-300 ${className}`}
    >
      <span className="font-semibold underline decoration-gray-400 underline-offset-4 transition-colors group-hover:decoration-gray-900 dark:decoration-gray-600 dark:group-hover:decoration-white">
        {children}
      </span>
      <svg
        className="h-4 w-4 transition-transform group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    </Link>
  )
}
