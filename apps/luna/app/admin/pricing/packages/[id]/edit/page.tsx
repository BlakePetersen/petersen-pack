// ABOUTME: Edit pricing package page
// ABOUTME: Form interface for editing an existing package

import PricingPackageForm from '@/components/sol/admin/PricingPackageForm'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [pkg, categories] = await Promise.all([
    prisma.pricingPackage.findUnique({
      where: { id },
    }),
    prisma.pricingCategory.findMany({
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!pkg) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/pricing"
          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Back to Pricing
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          Edit Package
        </h1>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <PricingPackageForm pkg={pkg} categories={categories} />
      </div>
    </div>
  )
}
