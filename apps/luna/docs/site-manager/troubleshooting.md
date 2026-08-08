# Troubleshooting Guide

Common issues and solutions for managing your Luna photography website.

## Login Issues

### Can't Login - "Invalid Credentials"

**Problem**: Email/password not working

**Solutions**:

1. **Check Email Address**
   - Use exact email from account creation
   - Check for typos
   - No extra spaces

2. **Check Password**
   - Passwords are case-sensitive
   - Check Caps Lock key
   - Ensure no extra spaces

3. **Password Reset**
   - Contact your web developer for password reset
   - Or reset via database if you have access

4. **Clear Browser Cache**
   - Try incognito/private browsing mode
   - Clear cookies for your site
   - Try different browser

### Logged Out Unexpectedly

**Problem**: Session expires, keeps logging you out

**Solutions**:

1. **Check Session Settings**
   - Contact developer if sessions expire too quickly
   - May be server configuration

2. **Browser Issues**
   - Enable cookies in browser
   - Check cookie settings allow your site
   - Try different browser

3. **Multiple Tabs**
   - Logging out in one tab logs out all
   - Close duplicate tabs

---

## Image Upload Issues

### "Upload Failed" Error

**Problem**: Images won't upload

**Solutions**:

1. **Check File Size**
   - Very large files (>50MB) may timeout
   - Resize images before uploading if needed
   - Or upload in smaller batches

2. **Check File Type**
   - Use JPEG, PNG, or WebP
   - Not: PDF, GIF, TIFF, RAW files
   - Convert RAW to JPEG first

3. **Internet Connection**
   - Check WiFi/internet connection
   - Try again with stable connection
   - Upload from faster connection

4. **Browser Issues**
   - Try different browser
   - Clear browser cache
   - Disable browser extensions temporarily

5. **Server Issues**
   - Contact developer
   - May be storage space issue
   - Or server configuration problem

### Images Upload but Don't Appear

**Problem**: Upload succeeds but images missing

**Solutions**:

1. **Refresh Page**
   - Hard refresh: Ctrl+F5 (PC) or Cmd+Shift+R (Mac)
   - Clear cache and reload

2. **Check Gallery**
   - Verify correct gallery selected
   - Look in gallery detail page
   - Check upload logs

3. **Wait a Moment**
   - Processing may take time
   - Large images process slower
   - Refresh after 30 seconds

4. **Server Issues**
   - Contact developer
   - Check server logs
   - Verify file permissions

### Images Look Different After Upload

**Problem**: Colors, quality, or size changed

**This is Normal**:

- Images are automatically optimized
- Converted to WebP format (better compression)
- Resized to max 2400px (still high quality)
- Compressed at 85% quality (imperceptible loss)

**If Quality is Poor**:

- Upload higher quality originals
- Avoid uploading already-compressed images
- Contact developer about quality settings

---

## Email Issues

### Not Receiving Email Notifications

**Problem**: No emails for bookings, inquiries, etc.

**Solutions**:

1. **Check Spam/Junk Folder**
   - Emails may be filtered
   - Add sender to contacts
   - Mark as "Not Spam"

2. **Check Email Configuration**
   - Contact developer to verify:
     - RESEND_API_KEY is set
     - ADMIN_EMAIL is correct
     - FROM_EMAIL is configured

3. **Verify Email Address**
   - Ensure admin email is correct
   - Check for typos
   - Update if needed (requires developer)

4. **Email Service Status**
   - Resend may be down (rare)
   - Developer can check service status
   - Check Resend dashboard

### Clients Not Receiving Emails

**Problem**: Clients say they didn't get confirmation emails

**Solutions**:

1. **Ask Client to Check**
   - Spam/junk folder
   - Promotions tab (Gmail)
   - Blocked senders list

2. **Verify Email Address**
   - Check for typos in their email
   - Resend manually if needed

3. **Domain Verification**
   - Developer needs to verify sending domain
   - Check Resend dashboard
   - DNS records must be correct

4. **Send Manual Email**
   - As backup, send info via your regular email
   - Include all relevant details

---

## Gallery Issues

### Can't Create Gallery - "Slug Already Exists"

**Problem**: Error when creating gallery

**Solution**:

- **Change the Slug**: Each gallery needs unique slug
- Try: "wedding-2024-smith" instead of "wedding-2024"
- Or: "family-portraits-2" if "family-portraits" exists

### Gallery Not Showing on Website

**Problem**: Created gallery doesn't appear on portfolio page

**Solutions**:

1. **Check Featured Status**
   - If looking on homepage: Must be marked "Featured"
   - Portfolio page shows all galleries

2. **Refresh Page**
   - Hard refresh browser
   - Clear cache

3. **Check Public vs Admin View**
   - Ensure viewing public site, not admin panel
   - Click site logo to go to public homepage

4. **Add Images**
   - Some designs hide empty galleries
   - Upload at least one image

### Can't Set Cover Image

**Problem**: No cover image option or not showing

**Solution**:

1. **Upload Images First**
   - Need images in gallery before setting cover
   - Upload at least one image

2. **Refresh After Upload**
   - Upload images
   - Refresh page
   - Then select cover image

---

## Booking Issues

### Availability Not Showing on Booking Page

**Problem**: Clients can't see available slots

**Solutions**:

1. **Check Slot Creation**
   - Verify slots were saved
   - Check Availability page in admin

2. **Check Availability Status**
   - Slots must be marked "Available"
   - Not marked as unavailable

3. **Check Dates**
   - Past dates don't show
   - Only future dates appear
   - Verify dates are correct

4. **Refresh Page**
   - Clear browser cache
   - Hard refresh

### Can't Confirm/Decline Booking

**Problem**: Buttons not working or changes not saving

**Solutions**:

1. **Check Session**
   - May be logged out
   - Refresh and login again

2. **Refresh Page**
   - Try closing and reopening booking detail
   - Clear cache if needed

3. **Browser Issues**
   - Try different browser
   - Disable extensions
   - Check JavaScript is enabled

---

## Client Gallery Issues

### Client Can't Access Gallery

**Problem**: Client reports can't view their gallery

**Solutions**:

1. **Check Expiration**
   - Gallery may have expired
   - Extend expiration date
   - Notify client

2. **Verify Login Email**
   - Client using correct email address?
   - Case-sensitive

3. **Check Password**
   - Account password correct?
   - Gallery password correct? (if set)
   - Case-sensitive

4. **Send New Link**
   - Copy gallery URL from admin
   - Send fresh link to client
   - Verify link works

5. **Browser Issues**
   - Ask client to try:
     - Different browser
     - Incognito mode
     - Clear cache

### Client Can't Download Images

**Problem**: Download button not working

**Solutions**:

1. **Try Alternative Method**
   - Right-click image
   - "Save Image As"
   - Download from browser

2. **Browser Issues**
   - Try different browser
   - Disable pop-up blocker
   - Check download permissions

3. **Mobile Issues**
   - Long-press image
   - Save to photos
   - Or use desktop computer

4. **Provide Alternative**
   - If technical issues persist
   - Send via file sharing service
   - Dropbox, Google Drive, WeTransfer

---

## Performance Issues

### Site Loading Slowly

**Problem**: Pages take long to load

**Solutions**:

1. **Check Internet Connection**
   - Your connection speed
   - Try different network

2. **Browser Cache**
   - May help after clearing once
   - Then reload

3. **Too Many Images**
   - Large galleries load slower
   - Consider breaking into smaller galleries
   - Limit to 30-50 images per gallery

4. **Contact Developer**
   - May need optimization
   - Server performance issues
   - CDN configuration

### Images Loading Slowly

**Problem**: Images take time to appear

**This May Be Normal**:

- High-quality images take time
- Especially on slower connections
- Lazy loading (images load as you scroll)

**If Excessive**:

- Check internet connection
- Contact developer about image optimization
- May need CDN or different storage

---

## Browser Compatibility

### Feature Not Working in Browser

**Problem**: Something works in one browser but not another

**Solutions**:

1. **Try Recommended Browsers**
   - **Chrome**: Best compatibility
   - **Firefox**: Good alternative
   - **Safari**: Works well on Mac/iOS
   - **Edge**: Good on Windows

2. **Update Browser**
   - Use latest version
   - Old browsers may not work
   - Enable automatic updates

3. **Clear Cache**
   - Different per browser
   - Google "clear cache [browser name]"

4. **Disable Extensions**
   - Ad blockers may interfere
   - Privacy extensions may block features
   - Try incognito/private mode

---

## Mobile Issues

### Admin Dashboard Doesn't Work Well on Mobile

**Recommendation**: Use desktop for admin tasks

**Why**:

- Admin dashboard designed for desktop
- Image uploads easier on desktop
- Managing galleries requires larger screen

**If You Must Use Mobile**:

- Rotate to landscape
- Use tablet if available
- Some features may be limited

### Public Site Issues on Mobile

**Problem**: Portfolio/galleries don't look right on phone

**Solutions**:

1. **Refresh Page**
   - May be caching old version

2. **Report Issue**
   - Contact developer with:
     - Screenshot
     - Phone model
     - Browser used
     - Specific page URL

---

## When to Contact Developer

### Technical Issues

Contact your web developer for:

- **Password resets**
- **Email configuration issues**
- **Server errors** (500, 502, 503 errors)
- **Database problems**
- **Performance optimization**
- **Custom feature requests**
- **Security concerns**
- **Deployment issues**
- **Domain/hosting problems**

### What to Include

When reporting an issue:

1. **Describe the Problem**
   - What were you trying to do?
   - What happened instead?
   - Error message (exact text)

2. **Steps to Reproduce**
   - List exact steps
   - What you clicked
   - What you entered

3. **Environment Details**
   - Browser name and version
   - Computer or mobile
   - Operating system
   - When issue started

4. **Screenshots**
   - Capture error messages
   - Show what you're seeing
   - Include full page if helpful

5. **Impact**
   - Is it blocking critical work?
   - Or minor inconvenience?
   - Helps prioritize fix

---

## Preventive Measures

### Regular Maintenance

**Weekly**:

- Check new inquiries and bookings
- Respond to client messages
- Update availability

**Monthly**:

- Review upcoming client galleries (expirations)
- Clean up old bookings (mark as completed)
- Check for any error notifications

**Quarterly**:

- Review portfolio galleries (update featured)
- Remove outdated galleries
- Update pricing/services if changed

### Best Practices

**Keep Records**:

- Note any recurring issues
- Track when problems occur
- Share patterns with developer

**Stay Updated**:

- Keep browser updated
- Use secure passwords
- Don't share login credentials

**Backup**:

- Download important images
- Keep client information elsewhere
- Don't rely solely on web system

---

## Quick Reference

### Common Error Messages

**"Session expired"**
→ Login again

**"Unauthorized"**
→ Check if logged in as admin

**"Slug already exists"**
→ Change gallery slug to unique value

**"Upload failed"**
→ Check file size, type, connection

**"Gallery not found"**
→ Check URL, may be deleted or slug changed

**"Cannot read property"**
→ Refresh page, may be JavaScript error

### Quick Fixes

**Most Issues**:

1. Refresh page
2. Clear browser cache
3. Try different browser
4. Logout and login again

**Still Not Working**:
→ Contact developer with details

---

## Getting Help

### Resources

1. **This Documentation**
   - [Getting Started](./getting-started.md)
   - [Managing Portfolio](./managing-portfolio.md)
   - [Client Galleries](./client-galleries.md)
   - [Bookings](./bookings.md)
   - [Inquiries](./inquiries.md)

2. **Developer Contact**
   - Your web developer's email/contact
   - Include detailed information
   - Screenshots when possible

3. **Community**
   - Photography business forums
   - Social media groups
   - Peer photographers

### Before Contacting Support

Try:

- ✅ Refresh the page
- ✅ Clear browser cache
- ✅ Try different browser
- ✅ Check this troubleshooting guide
- ✅ Gather error details (screenshots, messages)

Then contact developer with full information.
