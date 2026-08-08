// ABOUTME: Email template for customer notification when booking status changes
// ABOUTME: Handles confirmed and cancelled booking notifications

type BookingData = {
  name: string
  serviceType: string
  sessionDuration: number
  date: Date
  startTime: string
  endTime: string
  status: 'CONFIRMED' | 'CANCELLED'
}

export function CustomerBookingStatusUpdate({
  booking,
}: {
  booking: BookingData
}) {
  const isConfirmed = booking.status === 'CONFIRMED'

  return {
    subject: isConfirmed
      ? 'Your Session is Confirmed! - Ashley Petersen Photography'
      : 'Booking Update - Ashley Petersen Photography',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking ${isConfirmed ? 'Confirmed' : 'Update'}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, ${isConfirmed ? '#059669' : '#dc2626'} 0%, ${isConfirmed ? '#047857' : '#b91c1c'} 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${isConfirmed ? 'Session Confirmed!' : 'Booking Update'}</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

    <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">Hi ${booking.name},</p>
      ${
        isConfirmed
          ? `
      <p style="margin: 0 0 15px 0; color: #4b5563;">
        Great news! Your photography session has been confirmed. I'm looking forward to working with you!
      </p>
      <p style="margin: 0; color: #4b5563;">
        Please mark your calendar and let me know if you have any questions before your session.
      </p>
      `
          : `
      <p style="margin: 0 0 15px 0; color: #4b5563;">
        Unfortunately, I'm unable to accommodate your requested session time. I apologize for any inconvenience.
      </p>
      <p style="margin: 0; color: #4b5563;">
        Please feel free to check my availability calendar for alternative times, or reply to this email to discuss other options.
      </p>
      `
      }
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${isConfirmed ? '#059669' : '#dc2626'};">
      <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Session Details</p>

      <div style="margin-bottom: 15px;">
        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">Service Type</p>
        <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 500;">${booking.serviceType}</p>
      </div>

      <div style="margin-bottom: 15px;">
        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">Duration</p>
        <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 500;">${booking.sessionDuration} hour${booking.sessionDuration !== 1 ? 's' : ''}</p>
      </div>

      <div style="margin-bottom: 15px;">
        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">Date & Time</p>
        <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 500;">
          ${new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <p style="margin: 5px 0 0 0; font-size: 15px; color: #4b5563;">
          ${booking.startTime} - ${booking.endTime}
        </p>
      </div>
    </div>

    ${
      isConfirmed
        ? `
    <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600; font-size: 14px;">Before Your Session:</p>
      <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px;">
        <li style="margin-bottom: 5px;">Arrive 10 minutes early if possible</li>
        <li style="margin-bottom: 5px;">Bring any props or outfits you'd like to use</li>
        <li style="margin-bottom: 5px;">Contact me if you need to reschedule</li>
      </ul>
    </div>
    `
        : ''
    }

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #4b5563; font-size: 14px;">
        ${isConfirmed ? 'Questions about your session?' : 'Need to discuss alternative times?'}
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Reply to this email and I'll get back to you as soon as possible.
      </p>
      <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">
        ${isConfirmed ? "Can't wait to work with you!" : 'Thank you for your understanding.'}<br>
        Ashley Petersen Photography
      </p>
    </div>

  </div>

</body>
</html>
    `,
  }
}
