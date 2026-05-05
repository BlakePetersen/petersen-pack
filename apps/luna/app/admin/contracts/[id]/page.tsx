// ABOUTME: Admin page for viewing and managing individual contracts
// ABOUTME: Shows contract details, status, and allows linking to galleries

import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { id } = await params

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      client: true,
      usageRights: {
        include: {
          usageRight: true,
        },
      },
      payments: true,
      clientGalleries: true,
    },
  })

  if (!contract) {
    notFound()
  }

  const availableGalleries = await prisma.clientGallery.findMany({
    where: {
      clientId: contract.clientId,
      contractId: null,
    },
    include: {
      _count: {
        select: {
          images: true,
        },
      },
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Contract Details
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {contract.client.name || contract.client.email}
        </p>
      </div>

      {/* Contract Info */}
      <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold">Contract Information</h2>

        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {contract.status}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Shoot Date
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {format(new Date(contract.shootDate), 'MMM d, yyyy')}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Amount
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              ${(contract.totalAmount / 100).toLocaleString()}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Download Quota
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {contract.downloadQuota} images
            </dd>
          </div>
        </dl>

        {contract.status === 'DRAFT' && (
          <div className="mt-6">
            <form action={`/api/admin/contracts/${id}/send`} method="POST">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Send Contract to Client
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Link Gallery Section */}
      {contract.status === 'SIGNED' && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold">Link Gallery</h2>

          {contract.clientGalleries.length > 0 ? (
            <div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Linked galleries:
              </p>
              {contract.clientGalleries.map((gallery) => (
                <div
                  key={gallery.id}
                  className="mb-2 rounded-lg border border-gray-200 p-4"
                >
                  <p className="font-medium">{gallery.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Select a gallery to link to this contract:
              </p>

              {availableGalleries.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No available galleries for this client.
                </p>
              ) : (
                <div className="space-y-3">
                  {availableGalleries.map((gallery) => (
                    <form
                      key={gallery.id}
                      action={`/api/admin/contracts/${id}/link-gallery`}
                      method="POST"
                    >
                      <input
                        type="hidden"
                        name="galleryId"
                        value={gallery.id}
                      />
                      <button
                        type="submit"
                        className="w-full rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        <p className="font-medium">{gallery.title}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {gallery._count.images} images
                        </p>
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
