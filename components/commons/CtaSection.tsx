// ABOUTME: Call-to-action section for public pages
// ABOUTME: Editorial-style invitation with warm gradients and elegant typography

import { ButtonLink } from './Button'

type CtaSectionProps = {
  title: string
  description?: string
  buttonText: string
  buttonHref: string
}

export function CtaSection({
  title,
  description,
  buttonText,
  buttonHref,
}: CtaSectionProps) {
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

      {/* Content container */}
      <div className="relative mx-auto max-w-2xl text-center">
        {/* Title with refined typography */}
        <h2 className="mb-5 font-serif text-display-sm tracking-tight text-gray-900 dark:text-white md:text-display-md">
          {title}
        </h2>

        {/* Description with elegant spacing */}
        {description && (
          <p className="mx-auto mb-10 max-w-lg text-body-lg leading-relaxed text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}

        {/* CTA Button */}
        <ButtonLink href={buttonHref} variant="primary" size="lg">
          {buttonText}
        </ButtonLink>
      </div>
    </section>
  )
}
