// ABOUTME: Mobile slide-out drawer containing sidebar navigation.
// ABOUTME: Uses artax-ui Dialog (Radix) for accessible overlay; auto-closes on route change.

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Dialog, DialogTrigger, DialogTitle } from 'artax-ui'
import { Dialog as RadixDialog } from 'radix-ui'
import { SidebarNav, type SidebarSection } from './sidebar-nav'

function DrawerInner({
  sections,
  children,
}: {
  sections: SidebarSection[]
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <RadixDialog.Content className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-border bg-background">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <SidebarNav sections={sections} />
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </Dialog>
  )
}

export function SidebarDrawer({
  sections,
  children,
}: {
  sections: SidebarSection[]
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Key on pathname forces remount, resetting open state to false on navigation
  return (
    <DrawerInner key={pathname} sections={sections}>
      {children}
    </DrawerInner>
  )
}
