# Managing Bookings & Availability

The booking system allows potential clients to view your availability and request sessions directly from your website.

## How the Booking System Works

### The Flow

1. **You set available dates/times** in admin dashboard
2. **Clients visit `/book` page** on your website
3. **Clients see calendar** with your available slots
4. **Clients select a slot** and fill out booking form
5. **You receive notification** via email and dashboard
6. **You review and confirm or decline** the booking
7. **Client receives confirmation/update** via email

## Managing Your Availability

Availability slots are the dates and times you're open for sessions.

### Creating Availability Slots

#### Step-by-Step

1. **Click "Availability"** in the sidebar

2. **Click "Create New Slot"** or "Add Availability"

3. **Enter Slot Details**:

   **Date** (Required)
   - Select date you're available
   - Example: February 14, 2025

   **Start Time** (Required)
   - When you're available from
   - Example: 10:00 AM

   **End Time** (Required)
   - When you're available until
   - Example: 6:00 PM

   **Notes** (Optional)
   - Additional information
   - Example: "Outdoor locations only"
   - Example: "Studio available"

4. **Click "Create" or "Save"**
   - Slot appears on public booking page immediately

### Bulk Creating Slots

Some systems allow creating multiple slots at once:

**Multiple Dates, Same Times**:
- Select multiple dates (e.g., all Saturdays in a month)
- Set same start/end time for all
- Create in one action

**Recurring Availability**:
- Set pattern (e.g., every Saturday)
- Choose date range
- System creates individual slots

### Editing Availability Slots

To modify existing slots:

1. **Go to Availability** page
2. **Find the slot** you want to edit
3. **Click "Edit"**
4. **Update**:
   - Change times
   - Update notes
   - Mark as unavailable (without deleting)
5. **Save changes**

### Deleting Availability Slots

To remove a slot:

1. **Find the slot** in your availability list
2. **Click "Delete"**
3. **Confirm deletion**

**Note**: You typically can't delete slots that have pending bookings. Cancel bookings first, then delete slot.

### Marking Slots as Unavailable

Instead of deleting, you can mark a slot as unavailable:

- Keeps slot in system
- Hides from public booking page
- Preserves any associated bookings
- Can re-enable later

**When to Use**:
- Slot is tentatively booked (waiting for confirmation)
- Personal event on calendar
- Weather concerns
- Temporary hold

## Viewing Bookings

### Booking List

**Access**: Click "Bookings" in sidebar

**What You See**:
- All booking requests
- Status (Pending, Confirmed, Cancelled, Completed)
- Client information
- Requested date/time
- Service type and duration

### Booking Statuses

**PENDING** (Yellow/Orange)
- Newly submitted booking request
- Awaiting your response
- Action needed

**CONFIRMED** (Green)
- You've accepted the booking
- Client has been notified
- Session scheduled

**CANCELLED** (Red)
- Booking was cancelled
- By you or by request
- Client notified

**COMPLETED** (Blue/Gray)
- Session has occurred
- Archival status
- Historical record

## Responding to Booking Requests

### Reviewing a Booking

When a new booking comes in:

1. **Check your email** (you receive notification)
2. **Go to Bookings** in dashboard
3. **Click on the booking** to view full details

**Review**:
- Client name, email, phone
- Requested date and time
- Service type (Wedding, Portrait, etc.)
- Session duration (hours)
- Client's message/notes
- Availability slot details

### Confirming a Booking

If you want to accept:

1. **Open the booking**
2. **Click "Confirm" button**
3. **Optional**: Add internal notes
4. **Save**

**What Happens**:
- Status changes to CONFIRMED
- Client receives confirmation email
- You receive copy/notification
- Recommended: Mark availability slot as unavailable

**Next Steps**:
- Add to your personal calendar
- Send follow-up with session details
- Send contract/invoice (outside system)

### Declining a Booking

If you need to decline:

1. **Open the booking**
2. **Click "Cancel" or "Decline"**
3. **Optional**: Add reason (for your records)
4. **Save**

**What Happens**:
- Status changes to CANCELLED
- Client receives notification
- Slot remains available for other bookings

**Professional Communication**:
- Consider personal follow-up email
- Explain reason if appropriate
- Suggest alternative dates if available
- Refer other photographers if fully booked

### Completing a Booking

After the session occurs:

1. **Find the booking**
2. **Change status to COMPLETED**
3. **Save**

**Purpose**:
- Keeps records organized
- Archives past bookings
- Separates from active bookings

## Email Notifications

### Automatic Emails Sent

**When Booking Created**:
- **To You**: Notification of new booking request
- **To Client**: Confirmation that request was received

**When You Confirm**:
- **To Client**: Booking confirmed notification with details

**When You Cancel**:
- **To Client**: Booking cancelled notification

### Email Content

Emails automatically include:
- Client/your name
- Date and time
- Service type and duration
- Session details
- Next steps

**Note**: Check that your email configuration is working (see [Troubleshooting](./troubleshooting.md) if emails aren't sending).

## Client Booking Experience

### What Clients See

**Booking Page** (`/book`):
1. **Calendar View**:
   - Available dates highlighted
   - Unavailable dates grayed out
   - Click date to see time slots

2. **Time Slot Selection**:
   - Available time ranges
   - Click to select

3. **Booking Form**:
   - Name (required)
   - Email (required)
   - Phone (optional)
   - Service Type dropdown (required)
   - Session Duration (required)
   - Message/notes (optional)

4. **Submit**:
   - Request sent to you
   - Confirmation email sent to them

### Client Email Flow

1. **Request Submitted**: "We received your booking request"
2. **You Confirm**: "Your booking is confirmed!"
3. **You Cancel**: "Your booking has been cancelled"

## Best Practices

### Setting Availability

**Be Realistic**:
- Only add slots you can truly honor
- Account for travel time between locations
- Leave buffer time for setup/breakdown
- Consider seasonal light (for outdoor shoots)

**Plan Ahead**:
- Add availability 2-3 months out
- Update weekly or monthly
- Remove past dates periodically

**Strategic Scheduling**:
- Popular dates (weekends, holidays): Add early
- Less popular times: Add closer to date
- Block out personal time

### Responding Quickly

**Response Time**:
- Aim for within 24 hours
- Faster = better client experience
- Check dashboard daily during busy season

**Communication**:
- Be professional and warm
- Answer any questions in their message
- Provide next steps
- Set expectations

### Managing Your Calendar

**Personal Calendar Sync**:
- Add confirmed bookings to your personal calendar
- Set reminders
- Block out time

**Availability Updates**:
- Mark slots unavailable once booked
- Add new slots as previous ones fill
- Adjust for weather/season

**Regular Review**:
- Weekly: Check upcoming bookings
- Monthly: Add new availability
- Seasonally: Plan for peak times

## Common Scenarios

### Double Booking Prevention

**Problem**: Two clients want same slot

**Solution**:
1. First booking stays PENDING
2. Manually mark slot as unavailable
3. Confirm first booking
4. Second client can't select that slot

**OR**:
1. Confirm first booking immediately
2. Decline second booking
3. Offer alternative dates

### Last-Minute Bookings

**Client books very soon** (e.g., tomorrow):

- Review extra carefully (can you honor it?)
- Respond quickly
- Confirm or decline promptly
- Consider requiring advance notice

### Changing Booking Details

**Client wants to change date/time**:

- No direct "reschedule" feature
- Options:
  1. Cancel existing booking
  2. Ask client to submit new request
  3. OR manually update in system (if possible)
  4. Communicate clearly

### No-Shows or Cancellations

**Client cancels or doesn't show**:

- Update status to CANCELLED
- Update availability to open slot
- Follow cancellation policy (your business rules)
- Consider deposit system (outside this system)

## Tracking & Organization

### Filtering Bookings

View bookings by status:
- **Pending**: Action needed
- **Confirmed**: Upcoming sessions
- **Completed**: Past sessions
- **Cancelled**: Declined or cancelled

### Search & Sort

- Search by client name or email
- Sort by date (upcoming first)
- Filter by service type
- View by date range

### Notes & Records

- Add internal notes to bookings
- Track client communications
- Reference for future bookings
- Build client history

## Availability Calendar Tips

### Seasonal Planning

**Peak Season** (e.g., Spring/Fall weddings):
- Add availability well in advance
- More weekend slots
- Higher volume of bookings

**Off Season**:
- Fewer slots or shorter timeframes
- Promotional pricing periods
- Focus on indoor sessions

### Holiday & Special Dates

**Valentine's Day, Mother's Day, etc.**:
- Add slots early (popular dates)
- Consider special packages
- Expect higher demand

**Block Out**:
- Your personal holidays
- Editing/delivery time
- Workshops/education days

### Time Management

**Buffer Time**:
- Travel between locations
- Setup/breakdown
- Editing time after session
- Administrative tasks

**Session Length**:
- Match duration to service type
- Wedding: 6-8 hours
- Portrait: 1-2 hours
- Newborn: 2-3 hours
- Family: 1 hour

## Common Questions

**Q: Can clients book directly without approval?**
A: No, all bookings require your confirmation. They submit requests, you approve.

**Q: Can I limit how far in advance clients can book?**
A: Only by what availability you add. Don't add slots 12 months out if you don't want bookings that far ahead.

**Q: What if a client needs a time not shown?**
A: They can contact you via inquiry form. You can manually add special availability.

**Q: Can I block off recurring time (e.g., every Tuesday)?**
A: Not automatically. Add individual slots or use bulk creation if available.

**Q: How do I handle deposits?**
A: This system doesn't process payments. Use external invoicing/payment tools and confirm booking after deposit.

**Q: Can clients see other booked times?**
A: No, they only see available times. Booked/unavailable slots are hidden.

**Q: What if I need to cancel a confirmed booking?**
A: Change status to CANCELLED. Client receives notification. Follow up personally with explanation and alternatives.

**Q: Can I export my bookings?**
A: Not currently built-in. View in dashboard or contact developer for export feature.

## Next Steps

- Set up [Inquiries](./inquiries.md) management
- Learn about [Client Galleries](./client-galleries.md)
- Review [Troubleshooting](./troubleshooting.md) for issues
