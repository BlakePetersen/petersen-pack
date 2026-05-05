// ABOUTME: Button component with Primary/Secondary CTA variants and Next.js Link support
// ABOUTME: Both CTAs use glassmorphism with glint, moving shadow, and dynamic text-shadow

'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import Link from 'next/link'

import { cn } from '@/lib/utils'

// Size-specific classes for CTA variants
const ctaSizeClasses = {
  sm: 'px-4 py-1.5 text-xs',
  default: 'px-6 py-2 text-sm',
  lg: 'px-8 py-2.5 text-base',
} as const

// Border radius values for inline styles (matches rounded-xl = 0.75rem)
const borderRadiusValues = {
  sm: '0.75rem',
  default: '0.75rem',
  lg: '0.75rem',
} as const

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100',
        primary:
          'group relative overflow-visible font-semibold text-white transition-all duration-400 hover:scale-[1.08]',
        secondary:
          'group relative overflow-visible font-semibold text-white transition-all duration-400 hover:scale-[1.08]',
        tertiary:
          'bg-transparent border-2 border-white/60 text-white/60 hover:border-white hover:text-white hover:bg-white/10 backdrop-blur-sm dark:border-white/60 dark:text-white/60 dark:hover:border-white dark:hover:text-white dark:hover:bg-white/10',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white dark:border-white dark:bg-gray-900 dark:text-white dark:hover:bg-white dark:hover:text-gray-900',
        ghost:
          'rounded-lg hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white',
        link: 'rounded-none text-gray-900 underline-offset-4 hover:underline dark:text-white',
        icon: 'rounded-lg p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 hover:scale-110',
        iconActive: 'rounded-lg p-2 bg-blue-600 text-white hover:scale-110',
      },
      size: {
        default: 'px-8 py-2 text-base',
        sm: 'px-6 py-1.5 text-sm',
        lg: 'px-12 py-3 text-lg',
        icon: 'h-10 w-10 [&_svg]:size-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

type CTAVariant = 'primary' | 'secondary'
type CTASize = 'sm' | 'default' | 'lg'

// CTA content with glint effect
function CTAContent({
  size,
  isHovered,
  variant,
  children,
}: {
  size: CTASize
  isHovered: boolean
  variant: CTAVariant
  children: React.ReactNode
}) {
  const roundedClass = 'rounded-xl'

  // Border gradient matches button variant - subtle for glass effect
  const borderGradientPrimary =
    'linear-gradient(180deg, rgba(255, 200, 150, 0.5), rgba(251, 146, 60, 0.4), rgba(219, 39, 119, 0.35), rgba(168, 85, 247, 0.3))'
  const borderGradientSecondary =
    'linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.08))'

  return (
    <>
      {/* Soft middle gradient overlay - subtle highlight band */}
      <div
        className={cn('pointer-events-none absolute inset-0', roundedClass)}
        style={{
          background:
            'linear-gradient(-75deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03))',
        }}
      />

      {/* Border highlight - subtle gradient border */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-px transition-opacity duration-300',
          roundedClass
        )}
        style={{
          background:
            variant === 'primary'
              ? borderGradientPrimary
              : borderGradientSecondary,
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
          opacity: isHovered ? 0.7 : 0.5,
        }}
      />

      {/* Glint sweep effect - matches gallery/portfolio cards */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 overflow-hidden',
          roundedClass
        )}
      >
        <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />
      </div>

      {/* Content with text styling */}
      <span
        className="relative z-10 flex items-center gap-1 whitespace-nowrap transition-all duration-300"
        style={{ textShadow: '1px 1px 0 rgba(0, 0, 0, 0.66)' }}
      >
        {children}
      </span>
    </>
  )
}

// Get Primary CTA styles - gradient glassmorphism
function getPrimaryCTAStyles(
  size: CTASize,
  isHovered: boolean,
  glassOpacity: number = 1
) {
  const borderRadius = borderRadiusValues[size]

  // Subtle gradient with transparency for glass effect
  const alpha = isHovered ? 0.55 * glassOpacity : 0.45 * glassOpacity
  const gradient = `linear-gradient(to bottom right, rgba(234, 88, 12, ${alpha}), rgba(219, 39, 119, ${alpha}), rgba(126, 34, 206, ${alpha}))`

  return {
    background: gradient,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius,
    boxShadow: isHovered
      ? `
        inset 0 1px 1px rgba(255, 255, 255, 0.15),
        0 4px 12px -4px rgba(0, 0, 0, 0.2)
      `.trim()
      : `
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        0 2px 6px -2px rgba(0, 0, 0, 0.1)
      `.trim(),
  }
}

// Get Secondary CTA styles for light mode - dark glassmorphism with white accents
function getSecondaryCTAStylesLight(
  size: CTASize,
  isHovered: boolean,
  glassOpacity: number = 1
) {
  const borderRadius = borderRadiusValues[size]

  // Subtle dark glass effect for light mode
  const baseAlpha = 0.35 * glassOpacity
  const hoverAlpha = 0.45 * glassOpacity

  return {
    background: isHovered
      ? `rgba(0, 0, 0, ${hoverAlpha})`
      : `rgba(0, 0, 0, ${baseAlpha})`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius,
    boxShadow: isHovered
      ? `
        inset 0 1px 1px rgba(255, 255, 255, 0.15),
        0 4px 12px -4px rgba(0, 0, 0, 0.15)
      `.trim()
      : `
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        0 2px 6px -2px rgba(0, 0, 0, 0.1)
      `.trim(),
  }
}

// Get Secondary CTA styles for dark mode - white glassmorphism
function getSecondaryCTAStylesDark(
  size: CTASize,
  isHovered: boolean,
  glassOpacity: number = 1
) {
  const borderRadius = borderRadiusValues[size]

  // Subtle white glass effect for dark mode
  const baseAlpha = 0.15 * glassOpacity
  const hoverAlpha = 0.25 * glassOpacity

  return {
    background: isHovered
      ? `rgba(255, 255, 255, ${hoverAlpha})`
      : `rgba(255, 255, 255, ${baseAlpha})`,
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius,
    boxShadow: isHovered
      ? `
        inset 0 1px 1px rgba(255, 255, 255, 0.2),
        0 4px 12px -4px rgba(0, 0, 0, 0.3)
      `.trim()
      : `
        inset 0 1px 1px rgba(255, 255, 255, 0.1),
        0 2px 6px -2px rgba(0, 0, 0, 0.2)
      `.trim(),
  }
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  glassOpacity?: number
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      glassOpacity = 1,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const effectiveSize = size || 'default'
    const [isHovered, setIsHovered] = React.useState(false)

    // Handle Primary CTA
    if (variant === 'primary') {
      const sizeClass =
        ctaSizeClasses[effectiveSize as CTASize] || ctaSizeClasses.default
      const styles = getPrimaryCTAStyles(
        effectiveSize as CTASize,
        isHovered,
        glassOpacity
      )

      return (
        <div className="group relative inline-block">
          {/* Moving shadow element */}
          <div
            className="duration-400 pointer-events-none absolute inset-0 transition-all"
            style={{
              borderRadius: borderRadiusValues[effectiveSize as CTASize],
              background:
                'linear-gradient(180deg, rgba(180, 83, 9, 0.2), rgba(126, 34, 206, 0.15))',
              filter: isHovered ? 'blur(20px)' : 'blur(8px)',
              transform: isHovered
                ? 'translateY(12px) scaleX(0.88)'
                : 'translateY(4px) scaleX(0.94)',
              opacity: isHovered ? 0.5 : 0.3,
            }}
          />
          <Comp
            className={cn(buttonVariants({ variant, className }), sizeClass)}
            ref={ref}
            style={{
              ...styles,
              transition:
                'transform 400ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms cubic-bezier(0.25, 1, 0.5, 1), background 400ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
          >
            <CTAContent
              size={effectiveSize as CTASize}
              isHovered={isHovered}
              variant="primary"
            >
              {children}
            </CTAContent>
          </Comp>
        </div>
      )
    }

    // Handle Secondary CTA - light/dark mode glassmorphism
    if (variant === 'secondary') {
      const sizeClass =
        ctaSizeClasses[effectiveSize as CTASize] || ctaSizeClasses.default
      const stylesLight = getSecondaryCTAStylesLight(
        effectiveSize as CTASize,
        isHovered,
        glassOpacity
      )
      const stylesDark = getSecondaryCTAStylesDark(
        effectiveSize as CTASize,
        isHovered,
        glassOpacity
      )

      return (
        <div className="group relative inline-block">
          {/* Moving shadow element */}
          <div
            className="duration-400 pointer-events-none absolute inset-0 transition-all"
            style={{
              borderRadius: borderRadiusValues[effectiveSize as CTASize],
              background: 'rgba(0, 0, 0, 0.15)',
              filter: isHovered ? 'blur(16px)' : 'blur(8px)',
              transform: isHovered
                ? 'translateY(10px) scaleX(0.9)'
                : 'translateY(4px) scaleX(0.95)',
              opacity: isHovered ? 0.4 : 0.25,
            }}
          />
          {/* Light mode button */}
          <Comp
            className={cn(
              buttonVariants({ variant, className }),
              sizeClass,
              'dark:hidden'
            )}
            ref={ref}
            style={{
              ...stylesLight,
              transition:
                'transform 400ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms cubic-bezier(0.25, 1, 0.5, 1), background 400ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
          >
            <CTAContent
              size={effectiveSize as CTASize}
              isHovered={isHovered}
              variant="secondary"
            >
              {children}
            </CTAContent>
          </Comp>
          {/* Dark mode button */}
          <Comp
            className={cn(
              buttonVariants({ variant, className }),
              sizeClass,
              'hidden dark:flex'
            )}
            style={{
              ...stylesDark,
              transition:
                'transform 400ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms cubic-bezier(0.25, 1, 0.5, 1), background 400ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...(props as React.ComponentPropsWithoutRef<'button'>)}
          >
            <CTAContent
              size={effectiveSize as CTASize}
              isHovered={isHovered}
              variant="secondary"
            >
              {children}
            </CTAContent>
          </Comp>
        </div>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

// Helper component for Next.js Link integration
export interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href: string
  glassOpacity?: number
}

const ButtonLink = React.forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  (
    { className, variant, size, href, glassOpacity = 1, children, ...props },
    ref
  ) => {
    const effectiveSize = size || 'default'
    const [isHovered, setIsHovered] = React.useState(false)

    // Handle Primary CTA
    if (variant === 'primary') {
      const sizeClass =
        ctaSizeClasses[effectiveSize as CTASize] || ctaSizeClasses.default
      const styles = getPrimaryCTAStyles(
        effectiveSize as CTASize,
        isHovered,
        glassOpacity
      )

      return (
        <div className="group relative inline-block">
          {/* Moving shadow element */}
          <div
            className="duration-400 pointer-events-none absolute inset-0 transition-all"
            style={{
              borderRadius: borderRadiusValues[effectiveSize as CTASize],
              background:
                'linear-gradient(180deg, rgba(180, 83, 9, 0.2), rgba(126, 34, 206, 0.15))',
              filter: isHovered ? 'blur(20px)' : 'blur(8px)',
              transform: isHovered
                ? 'translateY(12px) scaleX(0.88)'
                : 'translateY(4px) scaleX(0.94)',
              opacity: isHovered ? 0.5 : 0.3,
            }}
          />
          <Link
            ref={ref}
            href={href}
            className={cn(buttonVariants({ variant, className }), sizeClass)}
            style={{
              ...styles,
              transition:
                'transform 400ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms cubic-bezier(0.25, 1, 0.5, 1), background 400ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
          >
            <CTAContent
              size={effectiveSize as CTASize}
              isHovered={isHovered}
              variant="primary"
            >
              {children}
            </CTAContent>
          </Link>
        </div>
      )
    }

    // Handle Secondary CTA - light/dark mode glassmorphism
    if (variant === 'secondary') {
      const sizeClass =
        ctaSizeClasses[effectiveSize as CTASize] || ctaSizeClasses.default
      const stylesLight = getSecondaryCTAStylesLight(
        effectiveSize as CTASize,
        isHovered,
        glassOpacity
      )
      const stylesDark = getSecondaryCTAStylesDark(
        effectiveSize as CTASize,
        isHovered,
        glassOpacity
      )

      return (
        <div className="group relative inline-block">
          {/* Moving shadow element */}
          <div
            className="duration-400 pointer-events-none absolute inset-0 transition-all"
            style={{
              borderRadius: borderRadiusValues[effectiveSize as CTASize],
              background: 'rgba(0, 0, 0, 0.15)',
              filter: isHovered ? 'blur(16px)' : 'blur(8px)',
              transform: isHovered
                ? 'translateY(10px) scaleX(0.9)'
                : 'translateY(4px) scaleX(0.95)',
              opacity: isHovered ? 0.4 : 0.25,
            }}
          />
          {/* Light mode link */}
          <Link
            ref={ref}
            href={href}
            className={cn(
              buttonVariants({ variant, className }),
              sizeClass,
              'dark:hidden'
            )}
            style={{
              ...stylesLight,
              transition:
                'transform 400ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms cubic-bezier(0.25, 1, 0.5, 1), background 400ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
          >
            <CTAContent
              size={effectiveSize as CTASize}
              isHovered={isHovered}
              variant="secondary"
            >
              {children}
            </CTAContent>
          </Link>
          {/* Dark mode link */}
          <Link
            href={href}
            className={cn(
              buttonVariants({ variant, className }),
              sizeClass,
              'hidden dark:flex'
            )}
            style={{
              ...stylesDark,
              transition:
                'transform 400ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 400ms cubic-bezier(0.25, 1, 0.5, 1), background 400ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...(props as Omit<
              React.ComponentPropsWithoutRef<typeof Link>,
              'href'
            >)}
          >
            <CTAContent
              size={effectiveSize as CTASize}
              isHovered={isHovered}
              variant="secondary"
            >
              {children}
            </CTAContent>
          </Link>
        </div>
      )
    }

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Link>
    )
  }
)
ButtonLink.displayName = 'ButtonLink'

export { Button, ButtonLink }
