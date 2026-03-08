// ABOUTME: Server component that builds sidebar navigation data from content collections.
// ABOUTME: Passes section data to the client-side SidebarNav for interactivity.

import { buildNavSections } from '../lib/navigation'
import { SidebarNav } from './sidebar-nav'

export function Sidebar() {
  const sections = buildNavSections()
  return <SidebarNav sections={sections} />
}
