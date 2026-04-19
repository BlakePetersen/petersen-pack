// ABOUTME: Mobile slide-out drawer containing sidebar navigation.
// ABOUTME: Opens from hamburger trigger in header, closes on navigation or overlay tap.

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Dialog } from 'radix-ui'
import type { NavSection } from '../lib/navigation'
import { SidebarNav } from './sidebar-nav'

export function SidebarDrawer({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = useState(false)
  const [prevPath, setPrevPath] = useState(usePathname())
  const pathname = usePathname()

  // Close drawer when pathname changes (navigation occurred)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    if (open) {
      setOpen(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="font-mono text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          aria-label="Open navigation"
        >
          ☰
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* theme-static: modal scrim is conventionally a dark semi-transparent layer in both modes; artax-ui has no overlay token */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-border bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <SidebarNav sections={sections} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
