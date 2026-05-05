// ABOUTME: Email template for client gallery access notification
// ABOUTME: Sent when admin creates or updates a client gallery

type ClientGalleryData = {
  clientName: string
  galleryTitle: string
  galleryUrl: string
  password: string | null
  expiresAt: Date | null
  imageCount: number
}

export function ClientGalleryAccess({
  gallery,
}: {
  gallery: ClientGalleryData
}) {
  const hasPassword = !!gallery.password
  const hasExpiration = !!gallery.expiresAt

  return {
    subject: `Your photos are ready! - ${gallery.galleryTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Gallery is Ready</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 10px 10px 0 0; text-align: center;">
    <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">📸</span>
      </div>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px;">Your Photos Are Ready!</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

    <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0 0 15px 0; font-size: 18px; color: #111827; line-height: 1.6;">
        Hi ${gallery.clientName.split(' ')[0]},
      </p>
      <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Your gallery <strong>${gallery.galleryTitle}</strong> is now available with <strong>${gallery.imageCount} photo${gallery.imageCount === 1 ? '' : 's'}</strong>!
      </p>
      <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        Click the button below to view and download your images.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${gallery.galleryUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        View Your Gallery
      </a>
    </div>

    ${
      hasPassword
        ? `
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600; font-size: 14px;">🔒 Password Protected</p>
      <p style="margin: 0 0 10px 0; color: #78350f; font-size: 14px;">
        Your gallery is password protected. Use this password to access your photos:
      </p>
      <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px; text-align: center;">
        <code style="font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #92400e; letter-spacing: 2px;">${gallery.password}</code>
      </div>
    </div>
    `
        : ''
    }

    ${
      hasExpiration
        ? `
    <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: 600; font-size: 14px;">⏰ Time Limited Access</p>
      <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
        This gallery will expire on <strong>${new Date(gallery.expiresAt!).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>. Please download your favorite photos before then!
      </p>
    </div>
    `
        : ''
    }

    <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600; font-size: 14px;">Gallery Features</p>
      <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
        <li style="margin-bottom: 8px;">View all your photos in full resolution</li>
        <li style="margin-bottom: 8px;">Download individual images or favorites</li>
        <li style="margin-bottom: 8px;">Mark your favorite photos</li>
        <li>Share the gallery link with family and friends</li>
      </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
        Questions about your photos or need help?
      </p>
      <p style="margin: 0; color: #4b5563; font-size: 14px;">
        Feel free to reach out anytime!
      </p>
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
        This is an automated notification. Please do not reply to this email.
      </p>
    </div>

  </div>

</body>
</html>
    `,
  }
}
