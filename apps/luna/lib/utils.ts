// ABOUTME: Utility functions for shadcn/ui components
// ABOUTME: Handles className merging with tailwind-merge and clsx

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

export function cleanBlogTitle(title: string): string {
  // Remove "Category // " or "[Category] // " prefix from blog titles
  return title.replace(/^(\[.*?\]|[^/]+)\s*\/\/\s*/, '')
}
