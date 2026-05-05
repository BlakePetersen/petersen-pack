// ABOUTME: Admin layout server component wrapper
// ABOUTME: Forces dynamic rendering for all admin pages to avoid database access at build time

import { AdminLayoutClient } from './AdminLayoutClient'

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
