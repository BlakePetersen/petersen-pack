// ABOUTME: Admin page for managing homepage About section image
// ABOUTME: Upload and link image to About section with crop/focal point editing

import { prisma } from '@/lib/prisma'
import { HomepageImageUploadClient } from '@/components/sol/admin/HomepageImageUploadClient'

export default async function HomepageImagePage() {
  // Get current About section data
  const aboutContent = await prisma.homepageContent.findUnique({
    where: { section: 'about' },
    include: {
      image: true,
    },
  })

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">About Section Image</h1>
        <p className="text-gray-600">
          Upload and manage the photo displayed in the About Ashley section on
          the homepage
        </p>
      </div>

      <HomepageImageUploadClient currentImage={aboutContent?.image || null} />
    </div>
  )
}
