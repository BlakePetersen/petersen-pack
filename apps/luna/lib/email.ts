// ABOUTME: Email service utility for sending notifications
// ABOUTME: Uses Resend to send admin and customer emails

import { Resend } from 'resend'
import { AdminInquiryNotification } from './email-templates/admin-inquiry-notification'
import { CustomerConfirmation } from './email-templates/customer-confirmation'
import { AdminBookingNotification } from './email-templates/admin-booking-notification'
import { CustomerBookingConfirmation } from './email-templates/customer-booking-confirmation'
import { CustomerBookingStatusUpdate } from './email-templates/customer-booking-status-update'
import { ClientGalleryAccess } from './email-templates/client-gallery-access'
import { ClientRetouchStatus } from './email-templates/client-retouch-status'
import { env } from './env'

const resend = new Resend(env.RESEND_API_KEY)

type InquiryEmailData = {
  id: string
  name: string
  email: string
  phone: string | null
  serviceType: string
  message: string
  createdAt: Date
}

export async function sendInquiryNotifications(inquiry: InquiryEmailData) {
  const results = {
    adminEmail: { success: false, error: null as string | null },
    customerEmail: { success: false, error: null as string | null },
  }

  // Check if email is configured
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email notifications')
    return results
  }

  const fromEmail = env.FROM_EMAIL
  const adminEmail = env.ADMIN_EMAIL

  // Send admin notification
  if (adminEmail) {
    try {
      const adminTemplate = AdminInquiryNotification({
        inquiry: {
          ...inquiry,
          inquiryId: inquiry.id,
        },
      })

      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      })

      results.adminEmail.success = true
      console.log(`✓ Admin notification sent to ${adminEmail}`)
    } catch (error) {
      results.adminEmail.error =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to send admin notification:', error)
    }
  } else {
    console.warn('ADMIN_EMAIL not configured - skipping admin notification')
  }

  // Send customer confirmation
  try {
    const customerTemplate = CustomerConfirmation({
      inquiry: {
        name: inquiry.name,
        serviceType: inquiry.serviceType,
        createdAt: inquiry.createdAt,
      },
    })

    await resend.emails.send({
      from: fromEmail,
      to: inquiry.email,
      subject: customerTemplate.subject,
      html: customerTemplate.html,
    })

    results.customerEmail.success = true
    console.log(`✓ Customer confirmation sent to ${inquiry.email}`)
  } catch (error) {
    results.customerEmail.error =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to send customer confirmation:', error)
  }

  return results
}

type BookingEmailData = {
  id: string
  name: string
  email: string
  phone: string | null
  serviceType: string
  sessionDuration: number
  employeeCount: number | null
  message: string | null
  availabilitySlot: {
    date: Date
    startTime: string
    endTime: string
  }
  createdAt: Date
}

export async function sendBookingRequestNotifications(
  booking: BookingEmailData
) {
  const results = {
    adminEmail: { success: false, error: null as string | null },
    customerEmail: { success: false, error: null as string | null },
  }

  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email notifications')
    return results
  }

  const fromEmail = env.FROM_EMAIL
  const adminEmail = env.ADMIN_EMAIL

  // Send admin notification
  if (adminEmail) {
    try {
      const adminTemplate = AdminBookingNotification({
        booking: {
          ...booking,
          date: booking.availabilitySlot.date,
          startTime: booking.availabilitySlot.startTime,
          endTime: booking.availabilitySlot.endTime,
          bookingId: booking.id,
        },
      })

      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      })

      results.adminEmail.success = true
      console.log(`✓ Booking admin notification sent to ${adminEmail}`)
    } catch (error) {
      results.adminEmail.error =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to send booking admin notification:', error)
    }
  } else {
    console.warn('ADMIN_EMAIL not configured - skipping admin notification')
  }

  // Send customer confirmation
  try {
    const customerTemplate = CustomerBookingConfirmation({
      booking: {
        name: booking.name,
        serviceType: booking.serviceType,
        sessionDuration: booking.sessionDuration,
        date: booking.availabilitySlot.date,
        startTime: booking.availabilitySlot.startTime,
        endTime: booking.availabilitySlot.endTime,
        createdAt: booking.createdAt,
      },
    })

    await resend.emails.send({
      from: fromEmail,
      to: booking.email,
      subject: customerTemplate.subject,
      html: customerTemplate.html,
    })

    results.customerEmail.success = true
    console.log(`✓ Booking customer confirmation sent to ${booking.email}`)
  } catch (error) {
    results.customerEmail.error =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to send booking customer confirmation:', error)
  }

  return results
}

type BookingStatusUpdateData = {
  name: string
  email: string
  serviceType: string
  sessionDuration: number
  availabilitySlot: {
    date: Date
    startTime: string
    endTime: string
  }
  status: 'CONFIRMED' | 'CANCELLED'
}

export async function sendBookingStatusUpdate(
  booking: BookingStatusUpdateData
) {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email notification')
    return { success: false, error: 'Email not configured' }
  }

  const fromEmail = env.FROM_EMAIL

  try {
    const template = CustomerBookingStatusUpdate({
      booking: {
        name: booking.name,
        serviceType: booking.serviceType,
        sessionDuration: booking.sessionDuration,
        date: booking.availabilitySlot.date,
        startTime: booking.availabilitySlot.startTime,
        endTime: booking.availabilitySlot.endTime,
        status: booking.status,
      },
    })

    await resend.emails.send({
      from: fromEmail,
      to: booking.email,
      subject: template.subject,
      html: template.html,
    })

    console.log(`✓ Booking status update sent to ${booking.email}`)
    return { success: true, error: null }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to send booking status update:', error)
    return { success: false, error: errorMessage }
  }
}

type ClientGalleryAccessData = {
  clientName: string
  clientEmail: string
  galleryTitle: string
  galleryUrl: string
  password: string | null
  expiresAt: Date | null
  imageCount: number
}

export async function sendClientGalleryAccessEmail(
  galleryData: ClientGalleryAccessData
) {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email notification')
    return { success: false, error: 'Email not configured' }
  }

  const fromEmail = env.FROM_EMAIL

  try {
    const template = ClientGalleryAccess({
      gallery: {
        clientName: galleryData.clientName,
        galleryTitle: galleryData.galleryTitle,
        galleryUrl: galleryData.galleryUrl,
        password: galleryData.password,
        expiresAt: galleryData.expiresAt,
        imageCount: galleryData.imageCount,
      },
    })

    await resend.emails.send({
      from: fromEmail,
      to: galleryData.clientEmail,
      subject: template.subject,
      html: template.html,
    })

    console.log(
      `✓ Client gallery access email sent to ${galleryData.clientEmail}`
    )
    return { success: true, error: null }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to send client gallery access email:', error)
    return { success: false, error: errorMessage }
  }
}

type RetouchStatusEmailData = {
  clientName: string
  clientEmail: string
  galleryTitle: string
  galleryUrl: string
  imageCount: number
  status: 'COMPLETED' | 'DECLINED'
}

export async function sendRetouchStatusEmail(data: RetouchStatusEmailData) {
  if (!env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - skipping email notification')
    return { success: false, error: 'Email not configured' }
  }

  const fromEmail = env.FROM_EMAIL

  try {
    const template = ClientRetouchStatus({
      retouch: {
        clientName: data.clientName,
        galleryTitle: data.galleryTitle,
        galleryUrl: data.galleryUrl,
        imageCount: data.imageCount,
        status: data.status,
      },
    })

    await resend.emails.send({
      from: fromEmail,
      to: data.clientEmail,
      subject: template.subject,
      html: template.html,
    })

    console.log(
      `✓ Retouch status email sent to ${data.clientEmail} (${data.status})`
    )
    return { success: true, error: null }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to send retouch status email:', error)
    return { success: false, error: errorMessage }
  }
}

async function testEmailConfiguration() {
  if (!env.RESEND_API_KEY) {
    return {
      configured: false,
      message: 'RESEND_API_KEY not set',
    }
  }

  if (!env.ADMIN_EMAIL) {
    return {
      configured: false,
      message: 'ADMIN_EMAIL not set',
    }
  }

  return {
    configured: true,
    message: 'Email configuration looks good',
    fromEmail: env.FROM_EMAIL,
    adminEmail: env.ADMIN_EMAIL,
  }
}
