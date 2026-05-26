// ABOUTME: Reusable Book a Session CTA button
// ABOUTME: Uses primary Button variant for consistent styling

'use client'

import { ButtonLink } from './Button'

interface BookSessionButtonProps {
  className?: string
  size?: 'sm' | 'default' | 'lg'
}

export function BookSessionButton({
  className = '',
  size = 'default',
}: BookSessionButtonProps) {
  return (
    <ButtonLink
      href="/book"
      variant="primary"
      size={size}
      className={className}
    >
      Book a Session
    </ButtonLink>
  )
}
