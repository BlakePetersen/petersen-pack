// ABOUTME: Create new pricing add-on page
// ABOUTME: Form interface for creating a new add-on

import PricingAddOnForm from '@/components/sol/admin/PricingAddOnForm'
import Link from 'next/link'

export default function NewAddOnPage() {
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
          Create New Add-on
        </h1>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <PricingAddOnForm />
      </div>
    </div>
  )
}
