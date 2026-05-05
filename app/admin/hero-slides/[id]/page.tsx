// ABOUTME: Admin page for editing a hero slide
// ABOUTME: Form to update hero slide details

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import HeroSlideFormEnhanced from '@/components/sol/admin/HeroSlideFormEnhanced'

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const { id } = await params

  const slide = await prisma.heroSlide.findUnique({
    where: { id },
  })

  if (!slide) {
    redirect('/admin/hero-slides')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Hero Slide</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update the hero slide details
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <HeroSlideFormEnhanced slide={slide} />
      </div>
    </div>
  )
}
