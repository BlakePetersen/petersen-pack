// ABOUTME: JSON-LD structured data components for SEO
// ABOUTME: Provides schema.org markup for blog posts, galleries, and organization

type BlogPostStructuredDataProps = {
  title: string
  description: string
  publishedAt: Date | null
  updatedAt: Date
  coverImage?: string | null
  url: string
  categories: string[]
}

export function BlogPostStructuredData({
  title,
  description,
  publishedAt,
  updatedAt,
  coverImage,
  url,
  categories,
}: BlogPostStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: coverImage || undefined,
    datePublished: publishedAt?.toISOString(),
    dateModified: updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: 'Ashley Petersen',
      url: 'https://ashleypetersen.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ashley Petersen Photography',
      url: 'https://ashleypetersen.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ashleypetersen.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: categories.join(', '),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

type GalleryStructuredDataProps = {
  title: string
  description?: string | null
  images: Array<{
    url: string
    altText: string | null
  }>
  url: string
}

export function GalleryStructuredData({
  title,
  description,
  images,
  url,
}: GalleryStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: title,
    description: description || undefined,
    url,
    image: images.map((img) => ({
      '@type': 'ImageObject',
      url: img.url,
      description: img.altText || title,
    })),
    author: {
      '@type': 'Person',
      name: 'Ashley Petersen',
      url: 'https://ashleypetersen.com',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Ashley Petersen Photography',
    description:
      'Professional photography services in the East Bay, San Francisco, and Contra Costa County',
    url: 'https://ashleypetersen.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'East Bay',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.8044,
      longitude: -122.2712,
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'San Francisco',
      },
      {
        '@type': 'City',
        name: 'Oakland',
      },
      {
        '@type': 'City',
        name: 'Berkeley',
      },
      {
        '@type': 'City',
        name: 'Walnut Creek',
      },
      {
        '@type': 'City',
        name: 'Lafayette',
      },
      {
        '@type': 'City',
        name: 'Danville',
      },
    ],
    priceRange: '$$',
    image: 'https://ashleypetersen.com/og-image.jpg',
    sameAs: [
      'https://www.instagram.com/ashleypetersenphoto',
      'https://www.facebook.com/ashleypetersenphoto',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function LocalBusinessStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://ashleypetersen.com/#business',
    name: 'Ashley Petersen Photography',
    description:
      'Professional lifestyle and portrait photographer specializing in family, maternity, engagement, wedding, underwater, and pet photography in the East Bay and San Francisco Bay Area.',
    url: 'https://ashleypetersen.com',
    email: 'contact@ashleypetersen.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'East Bay',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.8044,
      longitude: -122.2712,
    },
    areaServed: [
      {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 37.8044,
          longitude: -122.2712,
        },
        geoRadius: '50000', // 50km radius
      },
    ],
    priceRange: '$$',
    image: ['https://ashleypetersen.com/og-image.jpg'],
    sameAs: [
      'https://www.instagram.com/ashleypetersenphoto',
      'https://www.facebook.com/ashleypetersenphoto',
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      opens: '09:00',
      closes: '18:00',
    },
    serviceArea: {
      '@type': 'Place',
      name: 'San Francisco Bay Area',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

type BreadcrumbItem = {
  name: string
  url: string
}

type BreadcrumbStructuredDataProps = {
  items: BreadcrumbItem[]
}

export function BreadcrumbStructuredData({
  items,
}: BreadcrumbStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

type ServiceStructuredDataProps = {
  name: string
  description: string
  url: string
  minPrice?: number
  maxPrice?: number
  serviceType: string
}

export function ServiceStructuredData({
  name,
  description,
  url,
  minPrice,
  maxPrice,
  serviceType,
}: ServiceStructuredDataProps) {
  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType,
    name,
    description,
    url,
    provider: {
      '@type': 'Organization',
      name: 'Ashley Petersen Photography',
      url: 'https://ashleypetersen.com',
    },
    areaServed: {
      '@type': 'State',
      name: 'California',
    },
  }

  if (minPrice && maxPrice) {
    structuredData.offers = {
      '@type': 'AggregateOffer',
      lowPrice: minPrice,
      highPrice: maxPrice,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    }
  } else if (minPrice) {
    structuredData.offers = {
      '@type': 'Offer',
      price: minPrice,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

type FAQStructuredDataProps = {
  faqs: Array<{
    question: string
    answer: string
  }>
}

export function FAQStructuredData({ faqs }: FAQStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebSiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://ashleypetersen.com/#website',
    url: 'https://ashleypetersen.com',
    name: 'Ashley Petersen Photography',
    description:
      'Professional photography services in the East Bay, San Francisco, and Contra Costa County',
    publisher: {
      '@type': 'Organization',
      name: 'Ashley Petersen Photography',
      url: 'https://ashleypetersen.com',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          'https://ashleypetersen.com/portfolio?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
