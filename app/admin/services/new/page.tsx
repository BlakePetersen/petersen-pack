// ABOUTME: Admin page for creating a new service
// ABOUTME: Form with name, description, hero image, and content block selection

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ServiceForm } from '../ServiceForm'

export default async function NewServicePage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const [processSteps, infoCards] = await Promise.all([
    prisma.processStep.findMany({
      where: { isGlobal: true },
      orderBy: { stepNumber: 'asc' },
    }),
    prisma.infoCard.findMany({
      where: { isGlobal: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          New Service
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create a new photography service offering
        </p>
      </div>

      <ServiceForm processSteps={processSteps} infoCards={infoCards} />
    </div>
  )
}
