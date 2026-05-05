// ABOUTME: Reusable container component for consistent page layouts
// ABOUTME: Handles max-width and padding consistently

import { ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const sizeStyles = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  full: 'max-w-full',
}

export function Container({
  children,
  size = 'lg',
  className = '',
}: ContainerProps) {
  return (
    <div
      className={`container mx-auto p-gutter ${sizeStyles[size]} ${className}`}
    >
      {children}
    </div>
  )
}
