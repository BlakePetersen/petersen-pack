// ABOUTME: Navigation data types and builder functions for sidebar and prev/next links.
// ABOUTME: Transforms content collections into hierarchical navigation sections.

import {
  getSkills,
  getHooks,
  getConfigs,
  getGuides,
  getPosts,
} from './content'

export type NavItem = {
  title: string
  slug: string
  href: string
}

export type NavSection = {
  label: string
  href: string
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
  return [
    {
      label: 'Skills',
      href: '/skills',
      items: collectionToItems('skills', getSkills()),
    },
    {
      label: 'Hooks',
      href: '/hooks',
      items: collectionToItems('hooks', getHooks()),
    },
    {
      label: 'Configs',
      href: '/configs',
      items: collectionToItems('configs', getConfigs()),
    },
    {
      label: 'Guides',
      href: '/guides',
      items: collectionToItems('guides', getGuides()),
    },
    {
      label: 'Posts',
      href: '/posts',
      items: collectionToItems('posts', getPosts()),
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
