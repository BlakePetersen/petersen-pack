# Email Notifications Setup

Luna uses [Resend](https://resend.com) to send email notifications when customers submit inquiries through the contact form.

## Features

- **Admin Notifications**: Get notified immediately when someone submits an inquiry
- **Customer Confirmations**: Customers receive automatic confirmation emails
- **Professional Templates**: Beautiful, branded HTML email templates
- **Non-blocking**: Email failures won't prevent inquiry submission

## Quick Setup

### 1. Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for free (100 emails/day trial, then affordable pricing)
3. Verify your email address

### 2. Get API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it "Luna Production" (or similar)
4. Copy the API key (starts with `re_`)

### 3. Configure Environment Variables

Add these to your `.env` file:

```env
# Resend API Key
RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"

# Where to send admin notifications
ADMIN_EMAIL="your-email@ashleypetersenphoto.com"

# Sender email (see domain verification below)
FROM_EMAIL="noreply@ashleypetersenphoto.com"
```

### 4. Domain Verification (Important!)

For production use, you need to verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `ashleypetersenphoto.com`)
4. Add the provided DNS records to your domain:
   - SPF record
   - DKIM records
   - DMARC record (optional but recommended)
5. Wait for verification (usually takes a few minutes)
6. Update `FROM_EMAIL` to use your verified domain

**For Testing**: You can use `onboarding@resend.dev` as the FROM_EMAIL without domain verification.

## Email Templates

Two email templates are sent for each inquiry:

### Admin Notification
- **To**: `ADMIN_EMAIL`
- **Subject**: "New Inquiry from [Name] - [Service Type]"
- **Content**:
  - Contact information
  - Service requested
  - Full message
  - Link to view in admin panel

### Customer Confirmation
- **To**: Customer's email from form
- **Subject**: "Thank you for your inquiry - Ashley Petersen Photography"
- **Content**:
  - Thank you message
  - Response time expectation (24-48 hours)
  - What to expect next
  - Links to portfolio and social media

## Testing

### Test Email Configuration

Create a test inquiry through the contact form:

1. Go to http://localhost:3000/contact
2. Fill out the form
3. Submit
4. Check server logs for email status
5. Check both admin email and customer email inboxes

### Expected Logs

Successful emails:
```
✓ Admin notification sent to admin@example.com
✓ Customer confirmation sent to customer@example.com
```

Configuration warnings:
```
RESEND_API_KEY not configured - skipping email notifications
```

### Test Without Real API Key

If you don't have an API key yet, the system will:
- Still save inquiries to the database
- Log a warning about missing configuration
- Not send emails
- Continue working normally

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Make sure `RESEND_API_KEY` is set in `.env`
2. **Check Domain**: Verify your domain in Resend dashboard
3. **Check Logs**: Look for error messages in server console
4. **Check Spam**: Customer confirmations may land in spam initially

### Domain Not Verified

If you see "Domain not verified" errors:
- Use `onboarding@resend.dev` temporarily
- Or wait for DNS records to propagate (can take up to 24 hours)
- Use Resend's DNS checker to verify records

### Rate Limits

Free tier limits:
- 100 emails/day during trial
- 3,000 emails/month on paid plan ($20/month)

For a photography business, this is typically more than enough.

## Cost

- **Free Trial**: 100 emails/day, no credit card required
- **Paid Plan**: $20/month for 50,000 emails
- **Pay-as-you-go**: $1 per 1,000 emails over limit

## Production Deployment

When deploying to production (Vercel, etc.):

1. Add environment variables to your hosting platform:
   ```
   RESEND_API_KEY=re_xxxxx
   ADMIN_EMAIL=admin@ashleypetersenphoto.com
   FROM_EMAIL=noreply@ashleypetersenphoto.com
   ```

2. Verify your production domain in Resend

3. Test with a real inquiry

4. Monitor email delivery in Resend dashboard

## Customization

### Modify Email Templates

Templates are in `lib/email-templates/`:
- `admin-inquiry-notification.tsx` - Admin notification
- `customer-confirmation.tsx` - Customer confirmation

Edit the HTML to customize branding, colors, or content.

### Change Response Time

In `customer-confirmation.tsx`, update this line:
```tsx
I'll review your message and get back to you within <strong>24-48 hours</strong>.
```

### Add More Email Types

1. Create new template in `lib/email-templates/`
2. Add function to `lib/email.ts`
3. Call from appropriate API route

## Support

- **Resend Documentation**: https://resend.com/docs
- **Resend Status**: https://status.resend.com
- **Email Templates**: https://react.email (compatible with Resend)
