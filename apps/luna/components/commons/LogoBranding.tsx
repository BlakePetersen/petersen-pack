// ABOUTME: Unified logo branding component
// ABOUTME: Combines Luna logo icon with brand text in consistent design

import LunaLogo from '@/components/commons/LunaLogo'
import Link from 'next/link'
import { CSSProperties } from 'react'

export interface LogoBrandingProps {
  /** Size of the logo icon */
  size?: number
  /** Whether to show as a link to homepage */
  linkable?: boolean
  /** Additional CSS classes for container */
  className?: string
  /** Logo icon className */
  logoClassName?: string
  /** Variant for different contexts */
  variant?: 'default' | 'compact'
  /** Accessible label for the link */
  ariaLabel?: string
  /** Custom className for primary text */
  primaryTextClassName?: string
  /** Custom className for secondary text */
  secondaryTextClassName?: string
  /** Custom inline styles for primary text */
  primaryTextStyle?: CSSProperties
  /** Custom inline styles for secondary text */
  secondaryTextStyle?: CSSProperties
}

export function LogoBranding({
  size = 40,
  linkable = true,
  className = '',
  logoClassName = '',
  variant = 'default',
  ariaLabel = 'Luna Photography Home',
  primaryTextClassName = 'text-gray-700 dark:text-gray-300',
  secondaryTextClassName = 'text-gray-900 dark:text-white',
  primaryTextStyle,
  secondaryTextStyle,
}: LogoBrandingProps) {
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <LunaLogo size={size} className={logoClassName} />
      <div className="text-left">
        {variant === 'default' ? (
          <>
            <span
              className={`block text-xs font-medium uppercase ${primaryTextClassName}`}
              style={{ letterSpacing: '3px', ...primaryTextStyle }}
            >
              Ashley Petersen
            </span>
            <span
              className={`-mt-0.5 block font-serif text-xl ${secondaryTextClassName}`}
              style={{ letterSpacing: '4px', ...secondaryTextStyle }}
            >
              Photography
            </span>
          </>
        ) : (
          <span className={`text-xl font-bold ${secondaryTextClassName}`}>
            Ashley Petersen Photography
          </span>
        )}
      </div>
    </div>
  )

  if (linkable) {
    return (
      <Link
        href="/"
        className="group leading-none transition-all duration-300 ease-in-out"
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    )
  }

  return content
}
