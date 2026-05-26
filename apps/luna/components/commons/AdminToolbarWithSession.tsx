// ABOUTME: Wrapper for AdminToolbar component
// ABOUTME: Session is provided by root ThemeProvider

'use client'

import { AdminToolbar, type AdminAction } from './AdminToolbar'

interface AdminToolbarWithSessionProps {
  actions: AdminAction[]
}

export function AdminToolbarWithSession({
  actions,
}: AdminToolbarWithSessionProps) {
  return <AdminToolbar actions={actions} />
}
