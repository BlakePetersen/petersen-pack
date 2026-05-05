// ABOUTME: Email template for customer confirmation after inquiry submission
// ABOUTME: Thanks customer and sets expectations for response time

type InquiryData = {
  name: string
  serviceType: string
  createdAt: Date
}

export function CustomerConfirmation({ inquiry }: { inquiry: InquiryData }) {
  return {
    subject: 'Thank you for your inquiry - Ashley Petersen Photography',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px 10px 0 0; text-align: center;">
    <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px; font-weight: bold;">L</span>
      </div>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px;">Thank You, ${inquiry.name.split(' ')[0]}!</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

    <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0 0 15px 0; font-size: 18px; color: #111827; line-height: 1.6;">
        I've received your inquiry about <strong>${inquiry.serviceType}</strong> and I'm excited to work with you!
      </p>
      <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        I'll review your message and get back to you within <strong>24-48 hours</strong>.
      </p>
    </div>

    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600; font-size: 14px;">What's Next?</p>
      <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
        <li style="margin-bottom: 8px;">I'll review your inquiry and any special requirements</li>
        <li style="margin-bottom: 8px;">We'll discuss your vision and photography needs</li>
        <li style="margin-bottom: 8px;">I'll provide package options and availability</li>
        <li>We'll schedule your perfect session!</li>
      </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">In the meantime</p>
      <p style="margin: 10px 0; color: #4b5563; font-size: 14px;">
        Feel free to explore my portfolio and recent work
      </p>
      <div style="margin-top: 15px;">
        <a href="https://www.ashleypetersenphoto.com/portfolio" style="display: inline-block; background: transparent; color: #667eea; padding: 10px 20px; text-decoration: none; border: 2px solid #667eea; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 0 5px;">
          View Portfolio
        </a>
        <a href="https://www.instagram.com/ashleypetersenphoto" style="display: inline-block; background: transparent; color: #667eea; padding: 10px 20px; text-decoration: none; border: 2px solid #667eea; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 0 5px;">
          Follow on Instagram
        </a>
      </div>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; text-align: center;">
      <p style="margin: 0; color: #111827; font-size: 16px; font-weight: 500;">
        Ashley Petersen Photography
      </p>
      <p style="margin: 8px 0; color: #6b7280; font-size: 14px;">
        Serving the Greater Bay Area
      </p>
      <p style="margin: 8px 0; color: #6b7280; font-size: 14px;">
        <a href="tel:925-289-9573" style="color: #667eea; text-decoration: none;">925-289-9573</a>
      </p>
      <div style="margin-top: 15px;">
        <a href="https://www.instagram.com/ashleypetersenphoto" style="display: inline-block; margin: 0 8px; color: #9ca3af; text-decoration: none;">Instagram</a>
        <a href="https://www.facebook.com/ashleypetersenphoto" style="display: inline-block; margin: 0 8px; color: #9ca3af; text-decoration: none;">Facebook</a>
      </div>
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
        This is an automated confirmation. Please do not reply to this email.
      </p>
    </div>

  </div>

</body>
</html>
    `,
  }
}
