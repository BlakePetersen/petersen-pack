// ABOUTME: Edit pricing add-on page
// ABOUTME: Form interface for editing an existing add-on

import PricingAddOnForm from '@/components/sol/admin/PricingAddOnForm'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditAddOnPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const addOn = await prisma.pricingAddOn.findUnique({
    where: { id },
  })

  if (!addOn) {
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
          Edit Add-on
        </h1>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <PricingAddOnForm addOn={addOn} />
      </div>
    </div>
  )
}
