// ABOUTME: Reusable heading component with consistent typography
// ABOUTME: Supports gradient text and different sizes

import { ReactNode } from 'react'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'
type HeadingVariant = 'default' | 'gradient'

type HeadingProps = {
  children: ReactNode
  as?: HeadingLevel
  variant?: HeadingVariant
  className?: string
}

const sizeStyles: Record<HeadingLevel, string> = {
  h1: 'text-heading-xl font-bold',
  h2: 'text-heading-lg font-bold',
  h3: 'text-heading-md font-bold',
  h4: 'text-heading-sm font-semibold',
}

const variantStyles: Record<HeadingVariant, string> = {
  default: 'text-gray-900 dark:text-white',
  gradient: 'text-black dark:text-white',
}

export function Heading({
  children,
  as = 'h2',
  variant = 'default',
  className = '',
}: HeadingProps) {
  const Component = as
  const combinedStyles = `${sizeStyles[as]} ${variantStyles[variant]} ${className}`

  return <Component className={combinedStyles}>{children}</Component>
}
