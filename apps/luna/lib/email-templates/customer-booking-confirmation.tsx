// ABOUTME: Email template for customer confirmation when booking request is submitted
// ABOUTME: Confirms receipt and provides session details

type BookingData = {
  name: string
  serviceType: string
  sessionDuration: number
  date: Date
  startTime: string
  endTime: string
  createdAt: Date
}

export function CustomerBookingConfirmation({
  booking,
}: {
  booking: BookingData
}) {
  return {
    subject: 'Booking Request Received - Ashley Petersen Photography',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Booking Request Received</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

    <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">Hi ${booking.name},</p>
      <p style="margin: 0 0 15px 0; color: #4b5563;">
        Thank you for requesting a photography session with Ashley Petersen Photography! I've received your booking request and will review it shortly.
      </p>
      <p style="margin: 0; color: #4b5563;">
        I'll get back to you within 24-48 hours to confirm your session or discuss alternative options if needed.
      </p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #1f2937;">
      <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Requested Session</p>

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

    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        <strong>Note:</strong> This is a booking request and not a confirmation. I'll contact you soon to finalize the details.
      </p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">What's Next?</p>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        <li style="margin-bottom: 8px;">I'll review your request and check my calendar</li>
        <li style="margin-bottom: 8px;">You'll receive a confirmation email once approved</li>
        <li style="margin-bottom: 8px;">We'll discuss any final details before your session</li>
      </ul>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #4b5563; font-size: 14px;">
        Have questions in the meantime?
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Feel free to reply to this email and I'll get back to you as soon as possible.
      </p>
      <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">
        Looking forward to working with you!<br>
        Ashley Petersen Photography
      </p>
    </div>

  </div>

</body>
</html>
    `,
  }
}
