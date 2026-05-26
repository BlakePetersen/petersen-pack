// ABOUTME: Email template for admin notification when new inquiry is received
// ABOUTME: Contains all inquiry details and link to view in admin panel

type InquiryData = {
  name: string
  email: string
  phone: string | null
  serviceType: string
  message: string
  createdAt: Date
  inquiryId: string
}

export function AdminInquiryNotification({ inquiry }: { inquiry: InquiryData }) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return {
    subject: `New Inquiry from ${inquiry.name} - ${inquiry.serviceType}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Inquiry Received</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
      <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contact Information</p>
      <h2 style="margin: 0 0 15px 0; font-size: 20px; color: #111827;">${inquiry.name}</h2>
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Email:</strong> <a href="mailto:${inquiry.email}" style="color: #667eea; text-decoration: none;">${inquiry.email}</a>
      </p>
      ${inquiry.phone ? `
      <p style="margin: 5px 0; color: #4b5563;">
        <strong>Phone:</strong> <a href="tel:${inquiry.phone}" style="color: #667eea; text-decoration: none;">${inquiry.phone}</a>
      </p>
      ` : ''}
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Service Requested</p>
      <p style="margin: 5px 0; font-size: 16px; color: #111827; font-weight: 500;">${inquiry.serviceType}</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
      <p style="margin: 0; color: #4b5563; white-space: pre-wrap; line-height: 1.6;">${inquiry.message}</p>
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${baseUrl}/admin/inquiries" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        View in Admin Panel
      </a>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; text-align: center;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        Received on ${new Date(inquiry.createdAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
      </p>
      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
        Respond promptly to provide excellent customer service.
      </p>
    </div>

  </div>

</body>
</html>
    `,
  }
}
