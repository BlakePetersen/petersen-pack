// ABOUTME: Reusable section component for page layouts
// ABOUTME: Provides consistent spacing

import { ComponentPropsWithoutRef, ReactNode } from 'react'

type SectionProps = ComponentPropsWithoutRef<'section'> & {
  children: ReactNode
  className?: string
}

export function Section({ children, className = '', ...props }: SectionProps) {
  return (
    <section className={`px-gutter py-12 md:py-16 ${className}`} {...props}>
      {children}
    </section>
  )
}
