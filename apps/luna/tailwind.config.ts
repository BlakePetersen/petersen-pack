// ABOUTME: Tailwind CSS configuration file
// ABOUTME: Defines design system tokens and content paths for Tailwind

import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Section component dark mode backgrounds
    'dark:from-gray-900',
    'dark:via-gray-800',
    'dark:to-gray-900',
    'dark:bg-gray-900',
    'dark:bg-gray-800',
  ],
  theme: {
    extend: {
      spacing: {
        gutter: 'var(--gutter, 1.5rem)', // 24px, consistent gutter spacing
        'gutter-lg': 'var(--gutter-lg, 3rem)', // 48px, large gutter spacing
        section: 'var(--section-spacing, 6rem)', // 96px, vertical section spacing
        'section-sm': 'var(--section-spacing-sm, 4rem)', // 64px, smaller section spacing
        header: 'var(--header-height, 7rem)', // 112px, header height
        'page-top':
          'calc(var(--header-height, 7rem) + var(--section-spacing, 6rem))', // 208px, header + section spacing
        'pricing-scroll-offset':
          'calc(var(--header-height, 7rem) + var(--pricing-subnav-height, 4.0625rem) + var(--section-spacing, 6rem))', // 273px, header + pricing subnav + section padding
      },
      fontSize: {
        'display-xl': ['5rem', { lineHeight: '1', letterSpacing: '-0.02em' }], // 80px
        'display-lg': ['4rem', { lineHeight: '1', letterSpacing: '-0.02em' }], // 64px
        'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }], // 48px
        'display-sm': [
          '2.5rem',
          { lineHeight: '1.1', letterSpacing: '-0.01em' },
        ], // 40px
        'heading-xl': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 32px
        'heading-lg': [
          '1.75rem',
          { lineHeight: '1.2', letterSpacing: '-0.01em' },
        ], // 28px
        'heading-md': ['1.5rem', { lineHeight: '1.3', letterSpacing: '0' }], // 24px
        'heading-sm': ['1.25rem', { lineHeight: '1.4', letterSpacing: '0' }], // 20px
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }], // 18px
        'body-md': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }], // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0' }], // 14px
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.02em' }], // 12px
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        cyan: {
          DEFAULT: '#06b6d4',
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        orange: {
          DEFAULT: '#fb923c',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shine':
          'linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'shimmer-sweep': 'shimmerSweep 2s ease-in-out infinite',
        gradient: 'gradient 3s ease infinite',
        glint: 'glint 1.2s ease-out forwards',
        'pan-vertical': 'panVertical 20s ease-in-out infinite',
        'pan-horizontal': 'panHorizontal 20s ease-in-out infinite',
        'slow-zoom': 'slowZoom 20s ease-in-out infinite',
        'caustics-slow': 'causticsDrift 25s ease-in-out infinite',
        'caustics-medium': 'causticsDrift 18s ease-in-out infinite reverse',
        'caustics-fast': 'causticsDrift 12s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        shimmerSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glint: {
          '0%': { backgroundPosition: '200% 200%', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { backgroundPosition: '-100% -100%', opacity: '0' },
        },
        panVertical: {
          '0%, 100%': { transform: 'scale(1.15) translateY(0)' },
          '50%': { transform: 'scale(1.15) translateY(-3%)' },
        },
        panHorizontal: {
          '0%, 100%': { transform: 'scale(1.15) translateX(0)' },
          '50%': { transform: 'scale(1.15) translateX(-3%)' },
        },
        slowZoom: {
          '0%, 100%': { transform: 'scale(1.10)' },
          '50%': { transform: 'scale(1.18)' },
        },
        causticsDrift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(2%, 1%) scale(1.02)' },
          '50%': { transform: 'translate(-1%, 2%) scale(1)' },
          '75%': { transform: 'translate(1%, -1%) scale(1.01)' },
        },
      },
      boxShadow: {
        soft: '0 4px 20px -4px rgba(0, 0, 0, 0.15), 0 12px 25px -5px rgba(0, 0, 0, 0.1)',
        glow: '0 8px 40px rgba(0, 0, 0, 0.25)',
        'glow-accent': '0 8px 40px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [typography],
}
export default config
