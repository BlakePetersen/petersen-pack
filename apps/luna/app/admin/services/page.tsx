// ABOUTME: Admin page for managing photography services
// ABOUTME: Lists services with drag-to-reorder, create, edit, and delete

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ServiceListClient } from './ServiceListClient'

export default async function ServicesAdminPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const services = await prisma.service.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      pricingCategories: {
        select: { id: true, name: true },
      },
      _count: {
        select: {
          pricingCategories: true,
          processSteps: true,
          infoCards: true,
          faqs: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Services
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage photography service offerings and their details
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/services"
            target="_blank"
            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Preview Services
          </Link>
          <Link
            href="/admin/services/new"
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            New Service
          </Link>
        </div>
      </div>

      <ServiceListClient initialServices={services} />
    </div>
  )
}
