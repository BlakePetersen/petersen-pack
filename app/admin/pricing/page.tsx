// ABOUTME: Admin pricing management page
// ABOUTME: Manage pricing categories, packages, and add-ons

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PackageListManager from '@/components/sol/admin/PackageListManager'

export default async function PricingAdminPage() {
  const [categories, addOns] = await Promise.all([
    prisma.pricingCategory.findMany({
      include: {
        packages: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.pricingAddOn.findMany({
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pricing Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage service packages, categories, and add-ons
          </p>
        </div>
      </div>

      {/* Categories & Packages */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Service Packages
          </h2>
          <Link
            href="/admin/pricing/categories/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Add Category
          </Link>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {categories.length === 0 && (
          <div className="rounded-lg bg-white p-gutter-lg text-center shadow dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No pricing categories yet. Create your first category to get
              started.
            </p>
          </div>
        )}
      </div>

      {/* Add-ons */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add-ons
          </h2>
          <Link
            href="/admin/pricing/addons/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Add Add-on
          </Link>
        </div>

        {addOns.length === 0 ? (
          <div className="rounded-lg bg-white p-gutter-lg text-center shadow dark:bg-gray-800">
            <p className="text-gray-500 dark:text-gray-400">
              No add-ons yet. Create your first add-on to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {addOns.map((addOn) => (
              <AddOnCard key={addOn.id} addOn={addOn} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryCard({
  category,
}: {
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    isActive: boolean
    packages: Array<{
      id: string
      name: string
      price: number
      duration: string
      isPopular: boolean
      isActive: boolean
      features: string[]
      sortOrder: number
    }>
  }
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 p-6 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.name}
              </h3>
              {!category.isActive && (
                <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  Inactive
                </span>
              )}
            </div>
            {category.description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            )}
          </div>
          <Link
            href={`/admin/pricing/categories/${category.id}/edit`}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Packages ({category.packages.length})
          </h4>
          <Link
            href={`/admin/pricing/packages/new?categoryId=${category.id}`}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            + Add Package
          </Link>
        </div>

        <PackageListManager
          categoryId={category.id}
          initialPackages={category.packages}
        />
      </div>
    </div>
  )
}

function AddOnCard({
  addOn,
}: {
  addOn: {
    id: string
    name: string
    price: string
    unit: string
    isActive: boolean
  }
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-gutter shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {addOn.name}
            </h3>
            {!addOn.isActive && (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                Inactive
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {addOn.unit}
          </p>
        </div>
      </div>
      <div className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
        {!isNaN(Number(addOn.price)) ? `$${Number(addOn.price)}` : addOn.price}
      </div>
      <Link
        href={`/admin/pricing/addons/${addOn.id}/edit`}
        className="block rounded bg-blue-600 px-4 py-2 text-center text-sm text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Edit
      </Link>
    </div>
  )
}
