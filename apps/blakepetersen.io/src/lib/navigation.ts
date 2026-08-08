// ABOUTME: Navigation data builder that transforms content collections into renderable nav data.
// ABOUTME: Single buildNavData() call provides sections, per-collection items, and slug lookup.

import { getVisibleCollections } from './collection-registry'

export type NavItem = {
  title: string
  slug: string
  href: string
}

export type NavSection = {
  label: string
  href: string
  color: string
  items: NavItem[]
}

export type NavData = {
  sections: NavSection[]
  itemsByCollection: Record<string, NavItem[]>
  findBySlug: (slug: string) => { collection: string; item: NavItem } | null
}

function collectionToItems(
  collection: string,
  items: { slug: string; title: string }[]
): NavItem[] {
  return items.map(item => {
    const slugWithoutPrefix = item.slug.split('/').slice(1).join('/')
    return {
      title: item.title,
      slug: item.slug,
      href: `/${collection}/${slugWithoutPrefix}`
    }
  })
}

export function buildNavData(): NavData {
  const itemsByCollection: Record<string, NavItem[]> = {}

  const collectionSections: NavSection[] = getVisibleCollections().map(c => {
    const items = collectionToItems(c.slug, c.getter())
    itemsByCollection[c.slug] = items
    return { label: c.label, href: c.href, color: c.color, items }
  })

  const projectItems: NavItem[] = [
    { title: 'Changelog', slug: 'changelog', href: '/changelog' },
    { title: 'Contributors', slug: 'contributors', href: '/contributors' },
    { title: 'Roadmap', slug: 'roadmap', href: '/roadmap' }
  ]
  itemsByCollection['project'] = projectItems

  const sections: NavSection[] = [
    ...collectionSections,
    // theme-static: same brand-accent pattern as collection-registry — fixed across themes
    {
      label: 'Project',
      href: '/changelog',
      color: '#6B7280',
      items: projectItems
    }
  ]

  function findBySlug(
    slug: string
  ): { collection: string; item: NavItem } | null {
    for (const [collection, items] of Object.entries(itemsByCollection)) {
      const item = items.find(i => i.slug === slug)
      if (item) return { collection, item }
    }
    return null
  }

  return { sections, itemsByCollection, findBySlug }
}

export function buildNavSections(): NavSection[] {
  return buildNavData().sections
}

export function getPrevNext(
  items: NavItem[],
  currentHref: string
): { prev: NavItem | null; next: NavItem | null } {
  const index = items.findIndex(item => item.href === currentHref)
  if (index === -1) {
    return { prev: null, next: null }
  }
  return {
    prev: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null
  }
}
