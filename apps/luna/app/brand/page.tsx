// ABOUTME: Brand guidelines page for Ashley Petersen Photography
// ABOUTME: Showcases brand assets with download functionality and copy-to-clipboard for colors

import Image from 'next/image'
import { Download, Check, X } from 'lucide-react'
import {
  Section,
  Container,
  SectionHeader,
  ButtonLink,
} from '@/components/commons'
import GlobalFooter from '@/components/commons/GlobalFooter'
import { ColorSwatch } from '@/components/luna/BrandPageClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brand Guidelines | Ashley Petersen Photography',
  description:
    'Download brand assets and review guidelines for Ashley Petersen Photography. Access logos, color palette, typography, and usage guidelines.',
  openGraph: {
    title: 'Brand Guidelines | Ashley Petersen Photography',
    description:
      'Download brand assets and review guidelines for Ashley Petersen Photography.',
  },
}

// Color palette data
const colors = [
  { name: 'Orange Accent', hex: '#fb923c', textColor: 'text-gray-900' },
  { name: 'Neutral Dark', hex: '#171717', textColor: 'text-white' },
  { name: 'Neutral Light', hex: '#fafafa', textColor: 'text-gray-900' },
  { name: 'Warm Orange 50', hex: '#fff7ed', textColor: 'text-gray-900' },
]

// Logo download options
const iconLogos = [
  {
    name: 'Icon (Dark)',
    description: 'For light backgrounds',
    preview: '/brand/luna-icon.svg',
    downloads: [
      { label: 'SVG', href: '/brand/luna-icon.svg' },
      { label: 'PNG 64', href: '/brand/luna-icon-dark-64.png' },
      { label: 'PNG 256', href: '/brand/luna-icon-dark-256.png' },
      { label: 'PNG 512', href: '/brand/luna-icon-dark-512.png' },
      { label: 'PNG 1024', href: '/brand/luna-icon-dark-1024.png' },
    ],
  },
  {
    name: 'Icon (Light)',
    description: 'For dark backgrounds',
    preview: '/brand/luna-icon.svg',
    previewDarkBg: true,
    invertPreview: true,
    downloads: [
      { label: 'PNG 64', href: '/brand/luna-icon-light-64.png' },
      { label: 'PNG 256', href: '/brand/luna-icon-light-256.png' },
      { label: 'PNG 512', href: '/brand/luna-icon-light-512.png' },
      { label: 'PNG 1024', href: '/brand/luna-icon-light-1024.png' },
    ],
  },
]

const fullLogos = [
  {
    name: 'Stacked Logo (Dark)',
    description: 'For light backgrounds',
    preview: '/brand/luna-full-dark.svg',
    downloads: [
      { label: 'SVG', href: '/brand/luna-full-dark.svg' },
      { label: 'PNG 256', href: '/brand/luna-full-dark-256.png' },
      { label: 'PNG 512', href: '/brand/luna-full-dark-512.png' },
      { label: 'PNG 1024', href: '/brand/luna-full-dark-1024.png' },
    ],
  },
  {
    name: 'Stacked Logo (Light)',
    description: 'For dark backgrounds',
    preview: '/brand/luna-full-light.svg',
    previewDarkBg: true,
    downloads: [
      { label: 'SVG', href: '/brand/luna-full-light.svg' },
      { label: 'PNG 256', href: '/brand/luna-full-light-256.png' },
      { label: 'PNG 512', href: '/brand/luna-full-light-512.png' },
      { label: 'PNG 1024', href: '/brand/luna-full-light-1024.png' },
    ],
  },
]

const horizontalLogos = [
  {
    name: 'Horizontal Logo (Dark)',
    description: 'For light backgrounds',
    preview: '/brand/luna-horizontal-dark.svg',
    downloads: [{ label: 'SVG', href: '/brand/luna-horizontal-dark.svg' }],
  },
  {
    name: 'Horizontal Logo (Light)',
    description: 'For dark backgrounds',
    preview: '/brand/luna-horizontal-light.svg',
    previewDarkBg: true,
    downloads: [{ label: 'SVG', href: '/brand/luna-horizontal-light.svg' }],
  },
]

// Usage guidelines
const dosList = [
  'Maintain clear space around the logo (minimum equal to icon height)',
  'Use on clean, uncluttered backgrounds',
  'Scale proportionally when resizing',
  'Use provided color variants for appropriate backgrounds',
]

const dontsList = [
  'Rotate or distort the logo',
  'Place on busy imagery or patterns',
  'Change the aspect ratio or proportions',
  'Use in low contrast situations',
  'Add effects like shadows or glows',
  'Modify the colors outside provided variants',
]

// Photography style points
const photographyStyle = [
  'Natural light with warm tones',
  'Candid moments over posed shots',
  'Soft, romantic aesthetic',
  'Earth tones and golden hour lighting',
  'Authentic emotion and connection',
  'Clean, airy compositions',
]

// Brand voice characteristics
const brandVoice = [
  {
    trait: 'Warm and Approachable',
    description: 'Friendly without being overly casual',
  },
  {
    trait: 'Professional but Not Formal',
    description: 'Expertise delivered with personality',
  },
  {
    trait: 'Personal Connection',
    description: 'Speaking directly to the individual',
  },
  {
    trait: 'Celebrates Authentic Moments',
    description: 'Focusing on real emotions and genuine experiences',
  },
]

function LogoCard({
  name,
  description,
  preview,
  previewDarkBg,
  invertPreview,
  downloads,
}: {
  name: string
  description: string
  preview: string
  previewDarkBg?: boolean
  invertPreview?: boolean
  downloads: { label: string; href: string }[]
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div
        className={`flex h-40 items-center justify-center p-6 ${
          previewDarkBg ? 'bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
        }`}
      >
        <Image
          src={preview}
          alt={name}
          width={200}
          height={80}
          className={`max-h-20 w-auto object-contain ${invertPreview ? 'invert' : ''}`}
        />
      </div>
      <div className="bg-white p-4 dark:bg-gray-900">
        <h3 className="font-medium text-gray-900 dark:text-white">{name}</h3>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {downloads.map((download) => (
            <a
              key={download.href}
              href={download.href}
              download
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus-visible:ring-offset-gray-900"
            >
              <Download className="h-3 w-3" />
              {download.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function BrandPage() {
  return (
    <>
      {/* Download All CTA */}
      <Section className="pb-0 md:pb-0">
        <Container size="sm">
          <div className="text-center">
            <ButtonLink href="/brand/luna-brand-assets.zip" variant="primary">
              <Download className="h-4 w-4" />
              Download All Assets
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* Logo Downloads - Icons */}
      <Section data-section="Logos">
        <Container>
          <SectionHeader
            title="Logo Downloads"
            subtitle="Download logo files in various formats and sizes"
          />

          <div className="mb-12">
            <h3 className="mb-6 font-serif text-xl text-gray-900 dark:text-white">
              Icon Only
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {iconLogos.map((logo) => (
                <LogoCard key={logo.name} {...logo} />
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h3 className="mb-6 font-serif text-xl text-gray-900 dark:text-white">
              Stacked Logo
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {fullLogos.map((logo) => (
                <LogoCard key={logo.name} {...logo} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-6 font-serif text-xl text-gray-900 dark:text-white">
              Horizontal Logo
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {horizontalLogos.map((logo) => (
                <LogoCard key={logo.name} {...logo} />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Color Palette */}
      <Section className="bg-gray-50 dark:bg-gray-900/50" data-section="Colors">
        <Container>
          <SectionHeader
            title="Color Palette"
            subtitle="Our brand colors create a warm, inviting aesthetic"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map((color) => (
              <ColorSwatch key={color.hex} {...color} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Typography */}
      <Section data-section="Typography">
        <Container>
          <SectionHeader
            title="Typography"
            subtitle="Our type system balances elegance with readability"
          />

          <div className="grid gap-8 md:grid-cols-2">
            {/* Headings */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Headings
              </h3>
              <p className="mb-6 font-serif text-4xl text-gray-900 dark:text-white">
                Playfair Display
              </p>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                A sophisticated serif typeface for headlines and display text
              </p>
              <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="font-serif text-3xl text-gray-900 dark:text-white">
                  Aa Bb Cc Dd Ee
                </p>
                <p className="font-serif text-2xl text-gray-900 dark:text-white">
                  The quick brown fox
                </p>
                <p className="font-serif text-xl text-gray-900 dark:text-white">
                  jumps over the lazy dog
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Body Text
              </h3>
              <p className="mb-6 text-4xl font-light text-gray-900 dark:text-white">
                Inter
              </p>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                A clean, modern sans-serif for body copy and UI elements
              </p>
              <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="text-lg text-gray-900 dark:text-white">
                  Aa Bb Cc Dd Ee Ff Gg
                </p>
                <p className="text-base text-gray-900 dark:text-white">
                  The quick brown fox jumps over the lazy dog
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  0123456789 !@#$%^&*()
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Usage Guidelines */}
      <Section
        className="bg-gray-50 dark:bg-gray-900/50"
        data-section="Guidelines"
      >
        <Container>
          <SectionHeader
            title="Usage Guidelines"
            subtitle="Follow these guidelines to maintain brand consistency"
          />

          <div className="grid gap-8 md:grid-cols-2">
            {/* Do's */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/30">
              <h3 className="mb-4 flex items-center gap-2 font-medium text-green-800 dark:text-green-400">
                <Check className="h-5 w-5" />
                Do
              </h3>
              <ul className="space-y-3">
                {dosList.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Don'ts */}
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
              <h3 className="mb-4 flex items-center gap-2 font-medium text-red-800 dark:text-red-400">
                <X className="h-5 w-5" />
                Don&apos;t
              </h3>
              <ul className="space-y-3">
                {dontsList.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Photography Style */}
      <Section data-section="Style">
        <Container>
          <SectionHeader
            title="Photography Style"
            subtitle="Our visual approach creates a cohesive, authentic aesthetic"
          />

          <div className="mx-auto max-w-3xl">
            <div className="grid gap-4 sm:grid-cols-2">
              {photographyStyle.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 font-serif text-sm text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Brand Voice */}
      <Section className="bg-gray-50 dark:bg-gray-900/50" data-section="Voice">
        <Container>
          <SectionHeader
            title="Brand Voice"
            subtitle="How we communicate with warmth and authenticity"
          />

          <div className="mx-auto max-w-3xl">
            <div className="space-y-4">
              {brandVoice.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
                >
                  <h3 className="mb-1 font-serif text-lg text-gray-900 dark:text-white">
                    {item.trait}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <GlobalFooter />
    </>
  )
}
