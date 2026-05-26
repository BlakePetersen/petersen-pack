// ABOUTME: Client component for Services section with editing capability
// ABOUTME: Uses database content and allows admin editing

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { EditHomepageSectionModal } from '@/components/sol'
import { ArrowLink, GradientDivider, ServiceCard } from '@/components/commons'

type ServiceImage = {
  id: string
  url: string
  altText: string | null
}

type ServiceWithImages = {
  id: string
  name: string
  slug: string
  description: string
  sampleImages: ServiceImage[]
}

type ServicesContent = {
  heading: string
  subtitle: string
}

type ServicesSectionClientProps = {
  content: ServicesContent
  services: ServiceWithImages[]
}

export function ServicesSectionClient({
  content: initialContent,
  services = [],
}: ServicesSectionClientProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN'

  const handleSave = () => {
    window.location.reload()
  }

  return (
    <section data-section="Services" className="relative px-gutter py-section">
      {isAdmin && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute right-6 top-6 z-10 rounded-full border border-white/20 bg-black/30 p-2 backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/50"
          aria-label="Edit services section"
        >
          <Edit className="h-5 w-5 text-white" />
        </button>
      )}

      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center md:mb-16">
          <Link
            href="/services"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <h2 className="mb-4 font-serif text-display-md text-gray-900 dark:text-white md:text-display-lg">
              {content.heading}
            </h2>
          </Link>
          <p className="mx-auto max-w-2xl text-body-lg text-gray-600 dark:text-gray-300">
            {content.subtitle}
          </p>
          <div className="mt-6">
            <ArrowLink href="/services">View All Services</ArrowLink>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              name={service.name}
              slug={service.slug}
              description={service.description}
              sampleImages={service.sampleImages}
              index={index}
            />
          ))}
        </div>

        <GradientDivider variant="subtle" className="my-12" />

        <div className="text-center">
          <h3 className="mb-3 font-serif text-3xl text-gray-900 dark:text-white md:text-4xl">
            Unsure what to expect?
          </h3>
          <ArrowLink href="/services#what-to-expect">See My Process</ArrowLink>
        </div>
      </div>

      {isEditing && (
        <EditHomepageSectionModal
          section="services"
          content={content}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </section>
  )
}
