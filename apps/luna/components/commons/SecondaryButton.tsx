// ABOUTME: Secondary CTA button wrapper with optional arrow icon
// ABOUTME: Uses secondary Button variant for consistent styling

'use client'

import { ButtonLink } from './Button'

type SecondaryButtonProps = {
  href: string
  children: React.ReactNode
  showArrow?: boolean
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

function SecondaryButton({
  href,
  children,
  showArrow = true,
  className = '',
  size = 'default',
}: SecondaryButtonProps) {
  return (
    <ButtonLink
      href={href}
      variant="secondary"
      size={size}
      className={className}
    >
      {children}
      {showArrow && (
        <svg
          className="relative z-10 ml-1 h-4 w-4 text-white drop-shadow-md"
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
      )}
    </ButtonLink>
  )
}
