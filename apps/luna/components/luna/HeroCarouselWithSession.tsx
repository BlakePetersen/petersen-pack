// ABOUTME: Wrapper component for HeroCarousel with admin detection
// ABOUTME: Session is provided by root ThemeProvider

'use client'

import { useSession } from 'next-auth/react'
import HeroCarousel from './HeroCarousel'

type HeroSlide = {
  id: string
  title: string
  imageUrl: string
  mobileImageUrl: string | null
  focalX: number
  focalY: number
  mobileFocalX: number
  mobileFocalY: number
  linkUrl: string | null
  linkText: string | null
  portfolioUrl: string | null
  serviceUrl: string | null
  sortOrder: number
  isActive: boolean
}

type HeroCarouselWithSessionProps = {
  slides: HeroSlide[]
}

export default function HeroCarouselWithSession({
  slides,
}: HeroCarouselWithSessionProps) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  return <HeroCarousel slides={slides} isAdmin={isAdmin} />
}
