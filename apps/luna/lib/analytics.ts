// ABOUTME: Google Analytics utilities and event tracking
// ABOUTME: Provides type-safe analytics event tracking functions

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Track pageviews
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID as string, {
      page_path: url,
    })
  }
}

// Track custom events
type GTagEvent = {
  action: string
  category: string
  label?: string
  value?: number
}

const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Specific event tracking functions
export const trackBookingStart = () => {
  event({
    action: 'booking_start',
    category: 'engagement',
    label: 'Booking Calendar Opened',
  })
}

export const trackContactFormSubmit = () => {
  event({
    action: 'contact_form_submit',
    category: 'engagement',
    label: 'Contact Form Submitted',
  })
}

export const trackGalleryView = (galleryTitle: string) => {
  event({
    action: 'gallery_view',
    category: 'engagement',
    label: galleryTitle,
  })
}

export const trackBlogPostView = (postTitle: string) => {
  event({
    action: 'blog_post_view',
    category: 'engagement',
    label: postTitle,
  })
}

export const trackSearch = (query: string) => {
  event({
    action: 'search',
    category: 'engagement',
    label: query,
  })
}

const trackPhoneClick = () => {
  event({
    action: 'phone_click',
    category: 'engagement',
    label: 'Phone Number Clicked',
  })
}

const trackEmailClick = () => {
  event({
    action: 'email_click',
    category: 'engagement',
    label: 'Email Address Clicked',
  })
}

const trackSocialClick = (platform: string) => {
  event({
    action: 'social_click',
    category: 'engagement',
    label: platform,
  })
}

const trackImageDownload = (imageId: string, galleryContext?: string) => {
  event({
    action: 'image_download',
    category: 'engagement',
    label: galleryContext ? `${galleryContext} - ${imageId}` : imageId,
  })
}

const trackImageShare = (imageId: string, galleryContext?: string) => {
  event({
    action: 'image_share',
    category: 'engagement',
    label: galleryContext ? `${galleryContext} - ${imageId}` : imageId,
  })
}

const trackLightboxOpen = (imageId: string, galleryContext?: string) => {
  event({
    action: 'lightbox_open',
    category: 'engagement',
    label: galleryContext ? `${galleryContext} - ${imageId}` : imageId,
  })
}
