# API Reference

## Authentication

All admin API endpoints require authentication via NextAuth.js session cookies.

### Authentication Endpoints

#### POST /api/auth/signin

Login with credentials.

**Request Body**:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**:

```json
{
  "user": {
    "id": "user_id",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

**Status Codes**:

- `200`: Success
- `401`: Invalid credentials
- `400`: Missing required fields

#### POST /api/auth/signout

Logout current session.

**Response**:

```json
{
  "success": true
}
```

## Gallery Management

### POST /api/galleries

Create a new gallery.

**Authentication**: Required (ADMIN)

**Request Body**:

```json
{
  "title": "Wedding 2024",
  "slug": "wedding-2024",
  "description": "Beautiful summer wedding",
  "shootType": "WEDDING",
  "featured": true,
  "sortOrder": 0
}
```

**Response**:

```json
{
  "id": "gallery_id",
  "title": "Wedding 2024",
  "slug": "wedding-2024",
  "description": "Beautiful summer wedding",
  "shootType": "WEDDING",
  "featured": true,
  "sortOrder": 0,
  "coverImageId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:

- `201`: Gallery created
- `400`: Invalid data
- `401`: Unauthorized
- `409`: Slug already exists

### GET /api/galleries

Get all galleries (handled via page component, not API route).

### GET /api/galleries/[slug]

Get single gallery by slug (handled via page component).

## Image Upload

### POST /api/upload

Upload and process images.

**Authentication**: Required (ADMIN)

**Content-Type**: `multipart/form-data`

**Request Body** (FormData):

```
file: <image file>
galleryId: "gallery_id"
```

**Response**:

```json
{
  "id": "image_id",
  "url": "/uploads/1234567890-image.webp",
  "publicId": "unique_id",
  "width": 2400,
  "height": 1600,
  "altText": "",
  "sortOrder": 0,
  "galleryId": "gallery_id",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Processing**:

- Validates image format (via Sharp)
- Resizes to max 2400x2400px (maintains aspect ratio)
- Converts to WebP format
- Compresses at 85% quality
- Saves to `/public/uploads/`

**Status Codes**:

- `200`: Image uploaded
- `400`: Invalid file or missing gallery ID
- `401`: Unauthorized
- `500`: Processing error

**Error Response**:

```json
{
  "error": "No file provided"
}
```

## Booking System

### POST /api/bookings

Create a booking request.

**Authentication**: Not required (public endpoint)

**Request Body**:

```json
{
  "availabilitySlotId": "slot_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "serviceType": "WEDDING",
  "sessionDuration": 4,
  "message": "Looking forward to working together"
}
```

**Response**:

```json
{
  "id": "booking_id",
  "availabilitySlotId": "slot_id",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "serviceType": "WEDDING",
  "sessionDuration": 4,
  "message": "Looking forward to working together",
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "availabilitySlot": {
    "date": "2024-02-14",
    "startTime": "10:00:00",
    "endTime": "18:00:00"
  }
}
```

**Validations**:

- All fields required except `message`
- Availability slot must exist
- Slot must be marked as available

**Side Effects**:

- Sends email to admin (non-blocking)
- Sends confirmation email to customer (non-blocking)

**Status Codes**:

- `201`: Booking created
- `400`: Invalid data or slot unavailable
- `404`: Availability slot not found
- `500`: Server error

### GET /api/bookings

Get all bookings (admin only, handled via page component).

### PATCH /api/bookings/[id]

Update booking status.

**Authentication**: Required (ADMIN)

**Request Body**:

```json
{
  "status": "CONFIRMED"
}
```

**Valid Statuses**:

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `COMPLETED`

**Response**:

```json
{
  "id": "booking_id",
  "status": "CONFIRMED",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Side Effects**:

- Sends status update email to customer

**Status Codes**:

- `200`: Status updated
- `400`: Invalid status
- `401`: Unauthorized
- `404`: Booking not found

## Contact/Inquiry

### POST /api/contact

Submit contact form / inquiry.

**Authentication**: Not required (public endpoint)

**Request Body**:

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "message": "I'd like to inquire about portrait sessions",
  "preferredContact": "email"
}
```

**Response**:

```json
{
  "id": "inquiry_id",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "message": "I'd like to inquire about portrait sessions",
  "preferredContact": "email",
  "status": "NEW",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Side Effects**:

- Sends notification to admin (non-blocking)
- Sends confirmation to customer (non-blocking)

**Status Codes**:

- `201`: Inquiry created
- `400`: Missing required fields
- `500`: Server error

**Notes**:

- Inquiry is saved even if emails fail
- Email failures are logged but don't affect response

### GET /api/inquiries

Get all inquiries (admin only, handled via page component).

### PATCH /api/inquiries/[id]

Update inquiry status.

**Authentication**: Required (ADMIN)

**Request Body**:

```json
{
  "status": "CONTACTED"
}
```

**Valid Statuses**:

- `NEW`
- `CONTACTED`
- `CONVERTED`
- `CLOSED`

**Response**:

```json
{
  "id": "inquiry_id",
  "status": "CONTACTED",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:

- `200`: Status updated
- `400`: Invalid status
- `401`: Unauthorized
- `404`: Inquiry not found

## Client Galleries

### POST /api/admin/client-galleries

Create a private client gallery.

**Authentication**: Required (ADMIN)

**Request Body**:

```json
{
  "title": "Smith Wedding Delivery",
  "clientEmail": "client@example.com",
  "clientName": "Jane Smith",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "password": "optional-password"
}
```

**Response**:

```json
{
  "id": "gallery_id",
  "title": "Smith Wedding Delivery",
  "slug": "smith-wedding-delivery-abc123",
  "clientId": "user_id",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "hasPassword": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "client": {
    "id": "user_id",
    "email": "client@example.com",
    "name": "Jane Smith",
    "role": "CLIENT"
  }
}
```

**Process**:

1. Generates unique slug from title
2. Checks if user exists with provided email
3. Creates new CLIENT user if needed (with random password)
4. Hashes optional gallery password (bcrypt)
5. Creates ClientGallery record

**Status Codes**:

- `201`: Gallery created
- `400`: Missing required fields
- `401`: Unauthorized (non-admin)
- `500`: Server error

### POST /api/admin/client-galleries/[id]/upload

Upload images to client gallery.

**Authentication**: Required (ADMIN)

**Content-Type**: `multipart/form-data`

**Request Body** (FormData):

```
file: <image file>
```

**Response**:

```json
{
  "id": "image_id",
  "url": "/uploads/1234567890-image.webp",
  "width": 2400,
  "height": 1600,
  "clientGalleryId": "gallery_id",
  "isFavorite": false,
  "downloaded": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:

- `200`: Image uploaded
- `400`: Invalid file
- `401`: Unauthorized
- `404`: Gallery not found

### POST /api/client-galleries/[slug]/verify

Verify password for password-protected gallery.

**Authentication**: Required (CLIENT - must be gallery owner)

**Request Body**:

```json
{
  "password": "gallery-password"
}
```

**Response**:

```json
{
  "success": true
}
```

**Status Codes**:

- `200`: Password correct
- `401`: Unauthorized or incorrect password
- `404`: Gallery not found

### PATCH /api/client-galleries/images/[id]/favorite

Toggle favorite status on client image.

**Authentication**: Required (CLIENT - must be gallery owner)

**Request Body**:

```json
{
  "isFavorite": true
}
```

**Response**:

```json
{
  "id": "image_id",
  "isFavorite": true,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:

- `200`: Favorite toggled
- `401`: Unauthorized
- `404`: Image not found

### POST /api/client-galleries/images/[id]/download

Track image download.

**Authentication**: Required (CLIENT - must be gallery owner)

**Response**:

```json
{
  "id": "image_id",
  "downloaded": true,
  "downloadedAt": "2024-01-01T00:00:00.000Z"
}
```

**Side Effects**:

- Updates `downloaded` field to `true`
- Sets `downloadedAt` timestamp

**Status Codes**:

- `200`: Download tracked
- `401`: Unauthorized
- `404`: Image not found

## Availability Slots

### POST /api/admin/availability

Create availability slot(s).

**Authentication**: Required (ADMIN)

**Request Body** (single slot):

```json
{
  "date": "2024-02-14",
  "startTime": "10:00",
  "endTime": "18:00",
  "notes": "Valentine's Day availability"
}
```

**Request Body** (bulk creation):

```json
{
  "dates": ["2024-02-14", "2024-02-15", "2024-02-16"],
  "startTime": "10:00",
  "endTime": "18:00"
}
```

**Response**:

```json
{
  "id": "slot_id",
  "date": "2024-02-14T00:00:00.000Z",
  "startTime": "10:00:00",
  "endTime": "18:00:00",
  "notes": "Valentine's Day availability",
  "isAvailable": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:

- `201`: Slot(s) created
- `400`: Invalid data
- `401`: Unauthorized
- `409`: Slot already exists for date/time

### GET /api/availability

Get all availability slots (handled via page component).

**Query Parameters**:

- `available`: Filter by availability (`true`/`false`)
- `from`: Start date (ISO 8601)
- `to`: End date (ISO 8601)

### PATCH /api/admin/availability/[id]

Update availability slot.

**Authentication**: Required (ADMIN)

**Request Body**:

```json
{
  "isAvailable": false,
  "notes": "Fully booked"
}
```

**Response**:

```json
{
  "id": "slot_id",
  "isAvailable": false,
  "notes": "Fully booked",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:

- `200`: Slot updated
- `400`: Invalid data
- `401`: Unauthorized
- `404`: Slot not found

### DELETE /api/admin/availability/[id]

Delete availability slot.

**Authentication**: Required (ADMIN)

**Response**:

```json
{
  "success": true
}
```

**Status Codes**:

- `200`: Slot deleted
- `401`: Unauthorized
- `404`: Slot not found
- `409`: Cannot delete (has bookings)

## Error Handling

### Standard Error Response

All API endpoints return errors in this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- **200**: Success (GET, PATCH, DELETE)
- **201**: Created (POST)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error (unexpected error)

### Common Errors

**Authentication Errors**:

```json
{
  "error": "Unauthorized"
}
```

**Validation Errors**:

```json
{
  "error": "Missing required fields: title, slug"
}
```

**Not Found**:

```json
{
  "error": "Gallery not found"
}
```

**Conflict**:

```json
{
  "error": "A gallery with this slug already exists"
}
```

## Rate Limiting

Currently not implemented. Consider adding for production:

- Contact form: 5 submissions per hour per IP
- Booking requests: 10 per hour per IP
- API endpoints: 100 requests per minute per session

## CORS

CORS is not configured. All requests must originate from same domain.

For cross-origin requests, configure in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE' },
      ],
    },
  ];
}
```

## Webhooks

Currently not implemented. Future consideration for:

- Email delivery status (Resend webhooks)
- Payment processing (Stripe webhooks)
- External calendar sync

## API Versioning

Currently v1 (implicit). No version prefix in URLs.

For future versions, consider:

- `/api/v2/galleries`
- Or header-based versioning: `Accept: application/vnd.api+json;version=2`
