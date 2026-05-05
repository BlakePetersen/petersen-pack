// ABOUTME: Admin page for creating a new hero slide
// ABOUTME: Form to create a new homepage hero carousel slide

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import HeroSlideFormEnhanced from '@/components/sol/admin/HeroSlideFormEnhanced'

export default async function NewHeroSlidePage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Hero Slide</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Add a new slide to the homepage hero carousel
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <HeroSlideFormEnhanced />
      </div>
    </div>
  )
}
