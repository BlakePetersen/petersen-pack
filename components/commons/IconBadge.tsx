// ABOUTME: Reusable icon badge component with gradient background
// ABOUTME: Used for contact info and feature highlights

import { ReactNode } from 'react'

type IconBadgeProps = {
  icon: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const iconSizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function IconBadge({ icon, size = 'md' }: IconBadgeProps) {
  return (
    <div
      className={`${sizeStyles[size]} flex items-center justify-center rounded-full bg-black text-white`}
    >
      <div className={iconSizeStyles[size]}>{icon}</div>
    </div>
  )
}
