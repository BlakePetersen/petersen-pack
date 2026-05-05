// ABOUTME: Admin page for editing existing FAQs
// ABOUTME: Loads FAQ data and renders edit form

import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FaqForm } from '@/components/luna/admin/FaqForm'

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { id } = await params

  const [faq, services] = await Promise.all([
    prisma.faq.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.service.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!faq) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit FAQ</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update FAQ details
        </p>
      </div>

      <FaqForm faq={faq} services={services} />
    </div>
  )
}
