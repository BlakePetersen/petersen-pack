// ABOUTME: Client component for CTA section with editing capability
// ABOUTME: Uses database content and allows admin editing

'use client'

import { useState } from 'react'
import { Edit } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { BookSessionButton } from '@/components/commons'
import { EditHomepageSectionModal } from '@/components/sol'

type CtaContent = {
  heading: string
  subtitle: string
  buttonText: string
  buttonUrl: string
}

type CtaSectionClientProps = {
  content: CtaContent
}

export function CtaSectionClient({
  content: initialContent,
}: CtaSectionClientProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(false)

  const isAdmin = session?.user?.role === 'ADMIN'

  const handleSave = () => {
    window.location.reload()
  }

  return (
    <section
      data-section-cta
      className="relative overflow-hidden px-gutter pb-40 pt-section"
    >
      {/* Ambient background glow - warm tones */}
      <div className="pointer-events-none absolute inset-0">
        {/* Light mode: warm cream to soft peach gradient */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255, 237, 213, 0.6) 0%, rgba(254, 215, 170, 0.3) 40%, transparent 70%)',
          }}
        />
        {/* Dark mode: deep warm glow from below */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(180, 83, 9, 0.15) 0%, rgba(126, 34, 106, 0.08) 40%, transparent 70%)',
          }}
        />
      </div>

      {isAdmin && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute right-6 top-6 z-10 rounded-full border border-gray-300 bg-gray-100 p-2 backdrop-blur-sm transition-colors hover:border-gray-400 hover:bg-gray-200 dark:border-white/20 dark:bg-white/30 dark:hover:border-white/40 dark:hover:bg-white/50"
          aria-label="Edit CTA section"
        >
          <Edit className="h-5 w-5 text-gray-700 dark:text-white" />
        </button>
      )}

      {/* Content container */}
      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="mb-5 font-serif text-display-sm tracking-tight text-gray-900 dark:text-white md:text-display-md">
          {content.heading}
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-body-lg leading-relaxed text-gray-600 dark:text-gray-300">
          {content.subtitle}
        </p>
        <BookSessionButton size="lg" />
      </div>

      {isEditing && (
        <EditHomepageSectionModal
          section="cta"
          content={content}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </section>
  )
}
