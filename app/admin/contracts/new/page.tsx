// ABOUTME: Admin page for creating new contracts
// ABOUTME: Loads clients and usage rights, renders contract form

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ContractForm from '@/components/sol/admin/ContractForm'

export default async function NewContractPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const [clients, usageRights] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    prisma.usageRight.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create Contract
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new photography contract for a client
        </p>
      </div>

      <ContractForm clients={clients} usageRights={usageRights} />
    </div>
  )
}
