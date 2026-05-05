// ABOUTME: Floating admin toolbar that doesn't affect page markup
// ABOUTME: Shows contextual admin actions for authenticated admin users

'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Edit, Settings, Image, FileText, type LucideIcon } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useSyncExternalStore } from 'react'

// Map of icon names to components for serializable props
const iconMap: Record<string, LucideIcon> = {
  edit: Edit,
  settings: Settings,
  image: Image,
  file: FileText,
}

export interface AdminAction {
  label: string
  href: string
  /** Icon name: 'edit' | 'settings' | 'image' | 'file' */
  icon?: string
}

interface AdminToolbarProps {
  actions: AdminAction[]
}

function AdminToolbarContent({ actions }: AdminToolbarProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  if (!isAdmin || actions.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {actions.map((action) => {
        const Icon = action.icon ? iconMap[action.icon] : null
        return (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/80 px-4 py-2.5 text-sm font-medium text-gray-900 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-xl dark:border-white/10 dark:bg-gray-900/80 dark:text-white dark:hover:bg-gray-900"
          >
            {Icon && (
              <Icon className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
            )}
            {action.label}
          </Link>
        )
      })}
    </div>
  )
}

// Hydration-safe mounting detection using useSyncExternalStore
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function AdminToolbar({ actions }: AdminToolbarProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  )

  if (!mounted) return null

  return createPortal(<AdminToolbarContent actions={actions} />, document.body)
}
