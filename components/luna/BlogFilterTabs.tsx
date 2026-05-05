// ABOUTME: Blog filter tabs using shared FilterTabs component
// ABOUTME: Dynamically shows only filters that have matching posts

'use client'

import {
  FilterTabs,
  useFilterValue,
  type FilterTab,
} from '@/components/commons'

// Blog filter definitions with matching slugs
export const BLOG_FILTERS = [
  { value: 'all', label: 'All', slugs: [] as string[] },
  {
    value: 'sessions',
    label: 'Sessions',
    slugs: [
      'session',
      'portrait',
      'family',
      'engagement',
      'event',
      'wedding',
      'senior',
      'headshot',
      'branding',
      'couples',
      'birthday',
      'maternity',
      'newborn',
    ],
  },
  {
    value: 'animals',
    label: 'Animals',
    slugs: [
      'animal',
      'animals',
      'pet',
      'pets',
      'wildlife',
      'rescue',
      'rescue-tales',
      'animal-welfare',
      'dogs',
      'cats',
      'horses',
    ],
  },
  {
    value: 'behind-the-scenes',
    label: 'Behind the Scenes',
    slugs: [
      'behind-the-scenes',
      'bts',
      'studio',
      'process',
      'personal',
      'portfolio',
      'artistic',
      'creative',
    ],
  },
  {
    value: 'adventures',
    label: 'Adventures',
    slugs: [
      'adventure',
      'travel',
      'outdoor',
      'nature',
      'landscape',
      'beach',
      'underwater',
      'location',
    ],
  },
] as const

export type BlogFilter = (typeof BLOG_FILTERS)[number]

interface BlogFilterTabsProps {
  availableFilters: BlogFilter[]
}

export function BlogFilterTabs({ availableFilters }: BlogFilterTabsProps) {
  const tabs: FilterTab[] = availableFilters.map((f) => ({
    value: f.value,
    label: f.label,
  }))

  if (tabs.length <= 1) return null

  return (
    <FilterTabs
      tabs={tabs}
      paramName="filter"
      defaultValue="all"
      mobileLabel="Filter Posts"
    />
  )
}

// Hook to get the active blog filter
export function useBlogFilter(): BlogFilter {
  const tabs = BLOG_FILTERS.map((f) => ({ value: f.value, label: f.label }))
  const activeValue = useFilterValue(tabs, 'filter', 'all')
  return BLOG_FILTERS.find((f) => f.value === activeValue) || BLOG_FILTERS[0]
}
