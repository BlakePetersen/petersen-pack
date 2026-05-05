// ABOUTME: Admin page for managing FAQs
// ABOUTME: Lists all FAQs with filters and management actions

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { FaqListClient } from '@/components/luna/admin/FaqListClient'

export default async function FaqsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const [faqs, services] = await Promise.all([
    prisma.faq.findMany({
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.service.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FAQs</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage frequently asked questions
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/faq"
            target="_blank"
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Preview FAQs
          </Link>
          <Link
            href="/admin/faqs/new"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            New FAQ
          </Link>
        </div>
      </div>

      <FaqListClient initialFaqs={faqs} services={services} />
    </div>
  )
}
