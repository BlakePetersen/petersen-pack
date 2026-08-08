// ABOUTME: Email template for admin notification when new booking request is received
// ABOUTME: Contains all booking details and link to view in admin panel

type BookingData = {
  name: string
  email: string
  phone: string | null
  serviceType: string
  sessionDuration: number
  employeeCount?: number | null
  message: string | null
  date: Date
  startTime: string
  endTime: string
  createdAt: Date
  bookingId: string
}

export function AdminBookingNotification({
  booking,
}: {
  booking: BookingData
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return {
    subject: `New Booking Request from ${booking.name} - ${booking.serviceType}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Request</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Booking Request</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1f2937;">
      <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contact Information</p>
      <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827;">${booking.name}</h2>
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Email:</strong> <a href="mailto:${booking.email}" style="color: #1f2937; text-decoration: none;">${booking.email}</a>
      </p>
      ${
        booking.phone
          ? `
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Phone:</strong> <a href="tel:${booking.phone}" style="color: #1f2937; text-decoration: none;">${booking.phone}</a>
      </p>
      `
          : ''
      }
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Session Details</p>
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Service Type:</strong> ${booking.serviceType}
      </p>
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Duration:</strong> ${booking.sessionDuration} hour${booking.sessionDuration !== 1 ? 's' : ''}
      </p>
      ${
        booking.employeeCount
          ? `
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Number of Employees:</strong> ${booking.employeeCount}
      </p>
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Estimated Price:</strong> $${(() => {
          const basePrice = 2500
          const extraEmployees = Math.max(0, booking.employeeCount - 10)
          const additionalCost = extraEmployees * 250
          return (basePrice + additionalCost).toLocaleString()
        })()}
        ${booking.employeeCount > 10 ? ` ($2,500 base + ${booking.employeeCount - 10} × $250)` : ' (base price for up to 10 employees)'}
      </p>
      `
          : ''
      }
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}
      </p>
    </div>

    ${
      booking.message
        ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Additional Details</p>
      <p style="margin: 0; color: #4b5563; white-space: pre-wrap; line-height: 1.6;">${booking.message}</p>
    </div>
    `
        : ''
    }

    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${baseUrl}/admin/bookings" style="display: inline-block; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        View in Admin Panel
      </a>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        Received on ${new Date(booking.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
      </p>
      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
        Review this request and confirm or decline the booking.
      </p>
    </div>

  </div>

</body>
</html>
    `,
  }
}
