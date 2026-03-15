// ABOUTME: MDX wrapper around AccordionInteractive for expandable content sections.
// ABOUTME: Provides a simple Collapsible component with title and optional defaultOpen.

'use client'

import type { ReactNode } from 'react'
import {
  AccordionInteractive,
  AccordionInteractiveItem,
  AccordionInteractiveTrigger,
  AccordionInteractiveContent,
} from 'artax-ui'

function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  return (
    <AccordionInteractive
      type="single"
      collapsible
      defaultValue={defaultOpen ? 'item' : undefined}
    >
      <AccordionInteractiveItem value="item">
        <AccordionInteractiveTrigger>{title}</AccordionInteractiveTrigger>
        <AccordionInteractiveContent>{children}</AccordionInteractiveContent>
      </AccordionInteractiveItem>
    </AccordionInteractive>
  )
}

export { Collapsible }
