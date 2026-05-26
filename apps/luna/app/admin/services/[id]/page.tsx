// ABOUTME: Admin page for editing an existing service
// ABOUTME: Loads service data and displays edit form

import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ServiceForm } from '../ServiceForm'

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { id } = await params

  const [service, processSteps, infoCards] = await Promise.all([
    prisma.service.findUnique({
      where: { id },
      include: {
        processSteps: {
          select: { processStepId: true },
        },
        infoCards: {
          select: { infoCardId: true },
        },
      },
    }),
    prisma.processStep.findMany({
      where: { isGlobal: true },
      orderBy: { stepNumber: 'asc' },
    }),
    prisma.infoCard.findMany({
      where: { isGlobal: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  if (!service) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Service
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update service details for {service.name}
        </p>
      </div>

      <ServiceForm
        service={service}
        processSteps={processSteps}
        infoCards={infoCards}
      />
    </div>
  )
}
