// ABOUTME: Navigation data types and builder functions for sidebar and prev/next links.
// ABOUTME: Transforms content collections into hierarchical navigation sections.

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

function collectionToItems(
  collection: string,
  items: { slug: string; title: string }[],
): NavItem[] {
  return items.map((item) => {
    const slugWithoutPrefix = item.slug.split('/').slice(1).join('/')
    return {
      title: item.title,
      slug: item.slug,
      href: `/${collection}/${slugWithoutPrefix}`,
    }
  })
}

export function buildNavSections(): NavSection[] {
  const collectionSections: NavSection[] = getVisibleCollections().map((c) => ({
    label: c.label,
    href: c.href,
    color: c.color,
    items: collectionToItems(c.slug, c.getter()),
  }))

  return [
    ...collectionSections,
    {
      label: 'Project',
      href: '/changelog',
      color: '#6B7280',
      items: [
        { title: 'Changelog', slug: 'changelog', href: '/changelog' },
        { title: 'Contributors', slug: 'contributors', href: '/contributors' },
        { title: 'Roadmap', slug: 'roadmap', href: '/roadmap' },
      ],
    },
  ]
}

export function getPrevNext(
  items: NavItem[],
  currentHref: string,
): { prev: NavItem | null; next: NavItem | null } {
  const index = items.findIndex((item) => item.href === currentHref)
  if (index === -1) {
    return { prev: null, next: null }
  }
  return {
    prev: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
  }
}
