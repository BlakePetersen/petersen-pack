// ABOUTME: Dynamic sitemap generation for search engines
// ABOUTME: Includes all static and dynamic pages with proper priorities and change frequencies

import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering - database not available at build time
// fallow-ignore-next-line unused-export
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ashleypetersen.com'

  // Fetch all galleries
  const galleries = await prisma.gallery.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Fetch all published blog posts
  const blogPosts = await prisma.blogPost.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
  })

  // Fetch all blog categories
  const categories = await prisma.blogCategory.findMany({
    select: {
      slug: true,
    },
  })

  // Static pages with high priority
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Gallery pages
  const galleryPages: MetadataRoute.Sitemap = galleries.map((gallery) => ({
    url: `${baseUrl}/portfolio/${gallery.slug}`,
    lastModified: gallery.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Blog post pages
  const blogPostPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Blog category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/blog/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...galleryPages, ...blogPostPages, ...categoryPages]
}
