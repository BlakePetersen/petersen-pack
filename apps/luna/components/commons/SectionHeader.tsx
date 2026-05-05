// ABOUTME: Section header with centered title and optional subtitle
// ABOUTME: Used for content sections on public pages

type SectionHeaderProps = {
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left'
  const subtitleAlign = align === 'center' ? 'mx-auto' : ''

  return (
    <div className={`mb-12 md:mb-16 ${alignClass} ${className}`}>
      <h2 className="mb-4 font-serif text-heading-xl text-gray-900 dark:text-white">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-2xl text-body-lg text-gray-600 dark:text-gray-400 ${subtitleAlign}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
