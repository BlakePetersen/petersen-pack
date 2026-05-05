// ABOUTME: Admin page for creating new FAQs
// ABOUTME: Renders form with rich text editor and category/service selection

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FaqForm } from '@/components/luna/admin/FaqForm'

export default async function NewFaqPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const services = await prisma.service.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create FAQ</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add a new frequently asked question
        </p>
      </div>

      <FaqForm services={services} />
    </div>
  )
}
