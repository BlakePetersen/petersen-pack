// ABOUTME: FAQ category filter tabs using shared FilterTabs component
// ABOUTME: Wrapper that provides FAQ-specific categories and callback

'use client'

import { FilterTabs, type FilterTab } from '@/components/commons'

interface FaqCategoryTabsProps {
  onCategoryChange?: (category: string) => void
}

const FAQ_TABS: FilterTab[] = [
  { value: 'ALL', label: 'All' },
  { value: 'GENERAL', label: 'General' },
  { value: 'BOOKING', label: 'Booking' },
  { value: 'PRICING', label: 'Pricing' },
  { value: 'PROCESS', label: 'Process' },
  { value: 'POLICIES', label: 'Policies' },
]

export const FAQ_CATEGORIES = FAQ_TABS

export function FaqCategoryTabs({ onCategoryChange }: FaqCategoryTabsProps) {
  return (
    <FilterTabs
      tabs={FAQ_TABS}
      paramName="category"
      defaultValue="ALL"
      mobileLabel="Filter by Category"
      onTabChange={onCategoryChange}
    />
  )
}
