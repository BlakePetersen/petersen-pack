// ABOUTME: Edit pricing category page
// ABOUTME: Form interface for editing an existing category

import PricingCategoryForm from '@/components/sol/admin/PricingCategoryForm'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const category = await prisma.pricingCategory.findUnique({
    where: { id },
  })

  if (!category) {
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
          Edit Category
        </h1>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <PricingCategoryForm category={category} />
      </div>
    </div>
  )
}
