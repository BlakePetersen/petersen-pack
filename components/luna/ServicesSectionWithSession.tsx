// ABOUTME: Wrapper for ServicesSection component
// ABOUTME: Session is provided by root ThemeProvider

'use client'

import { ServicesSectionClient } from './ServicesSectionClient'

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

type ServicesSectionWithSessionProps = {
  content: ServicesContent
  services: ServiceWithImages[]
}

export function ServicesSectionWithSession({
  content,
  services,
}: ServicesSectionWithSessionProps) {
  return <ServicesSectionClient content={content} services={services} />
}
