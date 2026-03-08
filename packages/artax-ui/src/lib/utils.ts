// ABOUTME: Utility functions for the design system.
// ABOUTME: Provides cn() for merging Tailwind CSS classes with conflict resolution.
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
