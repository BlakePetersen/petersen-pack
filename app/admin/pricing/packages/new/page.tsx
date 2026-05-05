// ABOUTME: Create new pricing package page
// ABOUTME: Form interface for creating a new package

import PricingPackageForm from '@/components/sol/admin/PricingPackageForm'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function NewPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>
}) {
  const params = await searchParams
  const categories = await prisma.pricingCategory.findMany({
    select: { id: true, name: true },
    orderBy: { sortOrder: 'asc' },
  })

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
          Create New Package
        </h1>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <PricingPackageForm
          categories={categories}
          categoryId={params.categoryId}
        />
      </div>
    </div>
  )
}
