// ABOUTME: MDX wrapper around TabsInteractive for tabbed code block variants.
// ABOUTME: Persists selected tab in localStorage for consistent package manager selection.

'use client'

import { type ReactNode, useSyncExternalStore } from 'react'
import {
  TabsInteractive,
  TabsInteractiveList,
  TabsInteractiveTrigger,
  TabsInteractiveContent,
} from 'artax-ui'

function Tab({ children }: { label: string; children: ReactNode }) {
  return <>{children}</>
}

function TabbedCode({
  children,
  group = 'default',
}: {
  children: ReactNode
  group?: string
}) {
  const storageKey = `tabbed-code-${group}`
  const tabs = extractTabs(children)
  const defaultTab = tabs[0]?.label ?? ''

  const selected = useSyncExternalStore(
    (onStoreChange) => {
      const handler = (e: StorageEvent) => {
        if (e.key === storageKey) onStoreChange()
      }
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    },
    () => {
      const stored = localStorage.getItem(storageKey)
      return stored && tabs.some((t) => t.label === stored)
        ? stored
        : defaultTab
    },
    () => defaultTab,
  )

  function handleChange(value: string) {
    localStorage.setItem(storageKey, value)
    // Trigger re-render by dispatching storage event for same-window sync
    window.dispatchEvent(
      new StorageEvent('storage', { key: storageKey, newValue: value }),
    )
  }

  if (tabs.length === 0) return null

  return (
    <TabsInteractive value={selected} onValueChange={handleChange}>
      <TabsInteractiveList>
        {tabs.map((tab) => (
          <TabsInteractiveTrigger key={tab.label} value={tab.label}>
            {tab.label}
          </TabsInteractiveTrigger>
        ))}
      </TabsInteractiveList>
      {tabs.map((tab) => (
        <TabsInteractiveContent key={tab.label} value={tab.label}>
          {tab.content}
        </TabsInteractiveContent>
      ))}
    </TabsInteractive>
  )
}

type TabData = { label: string; content: ReactNode }

function extractTabs(children: ReactNode): TabData[] {
  const result: TabData[] = []
  const items = Array.isArray(children) ? children : [children]

  for (const child of items) {
    if (
      child &&
      typeof child === 'object' &&
      'type' in child &&
      child.type === Tab
    ) {
      result.push({
        label: child.props.label as string,
        content: child.props.children as ReactNode,
      })
    }
  }

  return result
}

export { TabbedCode, Tab }
