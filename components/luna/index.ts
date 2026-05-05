// ABOUTME: Luna public-facing components export index
// ABOUTME: Central export for all portfolio and client-facing components

// Section components

// Navigation components
export { default as Header } from './Header'
export { default as Navigation } from './Navigation'
export { default as Footer } from './Footer'
export { default as SkipNavigation } from './SkipNavigation'

// Hero components
export { default as HeroCarousel } from './HeroCarousel'
export { default as HeroCarouselWithSession } from './HeroCarouselWithSession'

// Gallery components
export { default as PortfolioGrid } from './PortfolioGrid'
export { default as ClientGalleryView } from './ClientGalleryView'
export { default as ImageThumbnailGrid } from './ImageThumbnailGrid'

// Blog components
export { default as BlogGrid } from './BlogGrid'
export { default as RelatedPosts } from './RelatedPosts'
export { default as RelatedGalleries } from './RelatedGalleries'

// Form components
export { default as ContactForm } from './ContactForm'
export { default as BookingCalendar } from './BookingCalendar'
export { default as LoginForm } from './LoginForm'
export { default as LogoutButton } from './LogoutButton'
export { default as ChangeRequestForm } from './ChangeRequestForm'

// Modal components
export { default as SearchModal } from './SearchModal'

// Utility components
export {
  BlogPostStructuredData,
  GalleryStructuredData,
  OrganizationStructuredData,
  LocalBusinessStructuredData,
  BreadcrumbStructuredData,
  ServiceStructuredData,
  FAQStructuredData,
  WebSiteStructuredData,
} from './StructuredData'
export { default as GoogleAnalytics } from './GoogleAnalytics'
export { WebVitals } from './WebVitals'
export { default as BlogPostViewTracker } from './BlogPostViewTracker'
export { default as GalleryViewTracker } from './GalleryViewTracker'
export { default as SocialShare } from './SocialShare'

// Booking/Order components
export { default as CostBreakdown } from './CostBreakdown'
export { default as OrderSummaryCards } from './OrderSummaryCards'
