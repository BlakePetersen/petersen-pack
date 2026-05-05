// ABOUTME: Admin page for creating a new testimonial
// ABOUTME: Form to add client testimonial

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import TestimonialForm from '@/components/sol/admin/TestimonialForm'

export default async function NewTestimonialPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Testimonial</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add a new client testimonial
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <TestimonialForm />
      </div>
    </div>
  )
}
