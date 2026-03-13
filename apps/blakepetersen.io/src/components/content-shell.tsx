// ABOUTME: Three-column layout wrapper for content pages (sidebar | content | TOC slot).
// ABOUTME: Sidebar hidden below lg breakpoint; TOC slot hidden below xl.

import type { ReactNode } from 'react'

export function ContentShell({
  sidebar,
  toc,
  children,
}: {
  sidebar: ReactNode
  toc?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-[1600px]">
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-terminal-border lg:block">
        {sidebar}
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
      {toc && (
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto xl:block">
          {toc}
        </aside>
      )}
    </div>
  )
}
