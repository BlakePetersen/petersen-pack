// ABOUTME: Admin page for editing a testimonial
// ABOUTME: Form to update testimonial details

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TestimonialForm from '@/components/sol/admin/TestimonialForm'

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { id } = await params

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  })

  if (!testimonial) {
    redirect('/admin/testimonials')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Testimonial</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update the testimonial details
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </div>
  )
}
