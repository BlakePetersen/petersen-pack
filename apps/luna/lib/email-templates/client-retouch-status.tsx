// ABOUTME: Email template for client notification when retouch request status changes
// ABOUTME: Handles completed (approved) and declined retouch notifications

type RetouchStatusData = {
  clientName: string
  galleryTitle: string
  galleryUrl: string
  imageCount: number
  status: 'COMPLETED' | 'DECLINED'
}

export function ClientRetouchStatus({
  retouch,
}: {
  retouch: RetouchStatusData
}) {
  const isApproved = retouch.status === 'COMPLETED'

  return {
    subject: isApproved
      ? 'Your Retouched Photos Are Ready! - Ashley Petersen Photography'
      : 'Retouch Request Update - Ashley Petersen Photography',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Retouch Request ${isApproved ? 'Completed' : 'Update'}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, ${isApproved ? '#059669' : '#dc2626'} 0%, ${isApproved ? '#047857' : '#b91c1c'} 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${isApproved ? 'Your Photos Are Ready!' : 'Retouch Request Update'}</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">

    <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">Hi ${retouch.clientName},</p>
      ${
        isApproved
          ? `
      <p style="margin: 0 0 15px 0; color: #4b5563;">
        Great news! Your retouched photos for <strong>${retouch.galleryTitle}</strong> are now ready to view.
      </p>
      <p style="margin: 0; color: #4b5563;">
        ${retouch.imageCount} ${retouch.imageCount === 1 ? 'image has' : 'images have'} been professionally retouched and added to your gallery.
      </p>
      `
          : `
      <p style="margin: 0 0 15px 0; color: #4b5563;">
        I wanted to let you know about an update regarding your retouch request for <strong>${retouch.galleryTitle}</strong>.
      </p>
      <p style="margin: 0; color: #4b5563;">
        Unfortunately, I wasn't able to complete the retouching as requested. Please feel free to reply to this email if you'd like to discuss alternatives.
      </p>
      `
      }
    </div>

    ${
      isApproved
        ? `
    <div style="text-align: center; margin: 25px 0;">
      <a href="${retouch.galleryUrl}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Your Gallery
      </a>
    </div>
    `
        : ''
    }

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid ${isApproved ? '#059669' : '#dc2626'};">
      <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Gallery Details</p>

      <div style="margin-bottom: 15px;">
        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">Gallery</p>
        <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 500;">${retouch.galleryTitle}</p>
      </div>

      <div>
        <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px;">Status</p>
        <p style="margin: 0; font-size: 16px; color: ${isApproved ? '#059669' : '#dc2626'}; font-weight: 500;">
          ${isApproved ? 'Retouching Complete' : 'Request Declined'}
        </p>
      </div>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #4b5563; font-size: 14px;">
        ${isApproved ? 'Questions about your photos?' : 'Have questions?'}
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 13px;">
        Reply to this email and I'll get back to you as soon as possible.
      </p>
      <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">
        ${isApproved ? 'Enjoy your photos!' : 'Thank you for your understanding.'}<br>
        Ashley Petersen Photography
      </p>
    </div>

  </div>

</body>
</html>
    `,
  }
}
