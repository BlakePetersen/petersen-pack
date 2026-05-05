// ABOUTME: Admin page for managing customer inquiries
// ABOUTME: Lists all inquiries with filtering, status updates, and detail view

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import InquiriesTable from '@/components/sol/InquiriesTable'

export default async function InquiriesPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const inquiries = await prisma.inquiry.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Inquiries
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage customer inquiries and booking requests
        </p>
      </div>

      <InquiriesTable inquiries={inquiries} />
    </div>
  )
}
