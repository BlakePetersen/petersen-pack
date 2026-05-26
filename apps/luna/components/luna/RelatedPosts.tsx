// ABOUTME: Related posts component for blog post pages
// ABOUTME: Displays similar posts using the shared HorizontalCardStrip

import {
  HorizontalCardStrip,
  type HorizontalCardItem,
} from '@/components/commons'
import { cleanBlogTitle } from '@/lib/utils'

type RelatedPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: Date | null
  categories: Array<{
    category: {
      name: string
      slug: string
    }
  }>
}

type RelatedPostsProps = {
  posts: RelatedPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  const items: HorizontalCardItem[] = posts.map((post) => ({
    id: post.id,
    title: cleanBlogTitle(post.title),
    href: `/blog/${post.slug}`,
    image: post.coverImage,
    category:
      post.categories.length > 0 ? post.categories[0].category.name : undefined,
  }))

  return (
    <HorizontalCardStrip
      title="More Stories"
      items={items}
      viewAllHref="/blog"
      viewAllText="View All Posts"
    />
  )
}
