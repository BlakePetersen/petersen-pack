# Architecture Overview

## System Design

Luna is a modern, full-stack photography portfolio and booking management system built with a server-rendered architecture using Next.js 15's App Router pattern.

### Technology Stack

**Frontend**
- Next.js 15.5 (App Router)
- TypeScript 5.5+ (strict mode)
- React 18 (server components by default)
- Tailwind CSS 3.4

**Backend**
- Next.js API Routes
- NextAuth.js v5 (authentication)
- Prisma ORM
- PostgreSQL

**Infrastructure**
- Email: Resend
- Image Processing: Sharp
- Image Storage: Local filesystem (Vercel Blob optional)

## Architecture Patterns

### Server-First Architecture

Luna prioritizes server-side rendering and data fetching:

- **Server Components**: Default for all pages, reducing client-side JavaScript
- **Client Components**: Only when interactivity is required (`'use client'` directive)
- **API Routes**: RESTful endpoints for mutations and external integrations
- **Middleware**: Route protection and authentication checks

### Data Flow

```
Client Request
    ↓
Middleware (auth check)
    ↓
Server Component (fetch data)
    ↓
Database (Prisma)
    ↓
Server Component (render)
    ↓
HTML Response (with minimal client JS)
```

### Authentication Flow

```
Login Form
    ↓
POST /api/auth/signin
    ↓
Credentials Provider (bcrypt verify)
    ↓
JWT Token Creation (with role)
    ↓
Session Cookie (HTTP-only)
    ↓
Database Session Record
    ↓
Protected Routes (middleware check)
```

## Directory Structure

```
app/                    # Next.js App Router
├── admin/             # Protected admin dashboard
│   ├── layout.tsx     # Admin-specific layout with sidebar
│   └── */page.tsx     # Admin pages (galleries, bookings, etc.)
├── api/               # API routes
│   ├── auth/          # NextAuth handlers
│   ├── galleries/     # Gallery CRUD
│   ├── upload/        # Image upload processing
│   └── */route.ts     # Other API endpoints
├── portfolio/         # Public portfolio pages
├── client/[slug]/     # Dynamic client gallery routes
├── layout.tsx         # Root layout (providers, fonts)
└── page.tsx           # Homepage

components/            # React components
├── ui/               # Reusable UI primitives
├── admin/            # Admin-specific components
└── *.tsx             # Feature components

lib/                  # Server utilities
├── prisma.ts         # Prisma client singleton
├── email.ts          # Email service
└── email-templates/  # React email templates

prisma/
├── schema.prisma     # Database schema
├── migrations/       # Database migrations
└── seed.ts           # Seed data script
```

## Key Design Decisions

### 1. App Router over Pages Router

**Rationale**: App Router provides better performance through React Server Components, streaming, and improved data fetching patterns.

**Implementation**:
- Server components fetch data directly (no `getServerSideProps`)
- Layouts for shared UI across route segments
- Loading states with `loading.tsx`
- Error boundaries with `error.tsx`

### 2. Server Components by Default

**Rationale**: Reduces client-side JavaScript bundle size and improves performance.

**Guidelines**:
- Use server components unless interactivity is required
- Mark with `'use client'` only for:
  - Event handlers
  - Browser APIs
  - State hooks (useState, useReducer)
  - Effect hooks (useEffect)

### 3. Prisma ORM

**Rationale**: Type-safe database access with excellent TypeScript integration.

**Benefits**:
- Auto-generated types from schema
- Migration management
- Query optimization
- Connection pooling

### 4. Local Image Storage

**Rationale**: Simplifies initial setup and reduces dependencies.

**Trade-offs**:
- Pros: No external service setup, faster local development
- Cons: Not suitable for horizontal scaling
- Migration path: Vercel Blob integration ready

### 5. JWT Sessions

**Rationale**: Stateless authentication scales better than session stores.

**Implementation**:
- Sessions stored in database via Prisma adapter
- JWT contains minimal data (id, role)
- Tokens refreshed on page loads
- HTTP-only cookies prevent XSS

## Security Architecture

### Authentication

- **Password Hashing**: bcryptjs with 10 salt rounds
- **Session Management**: NextAuth.js with JWT
- **CSRF Protection**: Built into NextAuth
- **Route Protection**: Middleware enforces authentication

### Authorization

- **Role-Based Access Control**: ADMIN and CLIENT roles
- **Ownership Checks**: Clients can only access their own galleries
- **API Protection**: Session checks on sensitive endpoints

### Data Protection

- **SQL Injection**: Prevented by Prisma parameterized queries
- **XSS**: React auto-escapes values
- **File Upload**: Sharp validates image formats
- **Filename Sanitization**: Removes special characters

## Database Design

### Entity Relationships

```
User (1) ────────── (N) Session
  │
  └─────────────── (N) ClientGallery
                        │
                        └─── (N) ClientImage

Gallery (1) ─────── (N) Image

AvailabilitySlot (1) ── (N) Booking

Inquiry (standalone)
```

### Key Constraints

- **Unique Slugs**: Galleries and ClientGalleries have unique slugs
- **Cascading Deletes**: Images deleted when gallery is deleted
- **Required Fields**: Enforced at database level
- **Indexes**: On frequently queried fields (slug, email, date)

## Image Processing Pipeline

```
Upload Request
    ↓
FormData Parsing
    ↓
Sharp: Read Metadata (width/height)
    ↓
Sharp: Resize (max 2400x2400, maintain aspect)
    ↓
Sharp: Convert to WebP
    ↓
Sharp: Compress (quality: 85)
    ↓
Write to /public/uploads/
    ↓
Create Database Record
    ↓
Return Image Metadata
```

## Email Architecture

### Non-Blocking Design

Email sends are fire-and-forget to prevent API delays:

```typescript
// Email sent asynchronously
sendEmail(data).catch(console.error);

// Response sent immediately
return NextResponse.json({ success: true });
```

### Template System

- **React Components**: Email templates as TSX files
- **Resend Service**: Handles delivery
- **Error Handling**: Logs failures, doesn't block user flow

## Performance Optimizations

### Image Optimization

- **Format**: WebP (smaller than JPEG/PNG)
- **Quality**: 85% (visual quality vs file size)
- **Sizing**: Max 2400px (4K-ready, reasonable file size)
- **Lazy Loading**: Browser-native lazy loading on images

### Code Splitting

- **Route-Based**: Automatic via Next.js App Router
- **Component-Based**: Dynamic imports for heavy components
- **CSS**: Tailwind purges unused styles

### Database Queries

- **Selective Fields**: Only fetch needed columns
- **Eager Loading**: Include related data in single query
- **Connection Pooling**: Prisma manages connections

## Deployment Architecture

### Recommended: Vercel

```
Vercel Edge Network
    ↓
Next.js Server (serverless functions)
    ↓
PostgreSQL Database (external)
    ↓
Resend (email)
```

### Environment Separation

- **Development**: Local PostgreSQL, local file storage
- **Staging**: Cloud database, Resend email (test mode)
- **Production**: Cloud database, Resend email, Vercel Blob (optional)

## Scalability Considerations

### Current Limitations

- **File Storage**: Local filesystem (single server)
- **Database**: Single PostgreSQL instance
- **Sessions**: Database-backed (could use Redis)

### Scale Path

1. **Phase 1**: Vercel Blob for image storage (CDN distribution)
2. **Phase 2**: Database read replicas for query scaling
3. **Phase 3**: Redis for session storage
4. **Phase 4**: CDN for static assets

## Monitoring & Debugging

### Development Tools

- **Prisma Studio**: Database GUI (`npm run db:studio`)
- **Next.js Dev**: Hot reload with error overlay
- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality checks

### Production Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Console logs (integrate Sentry for production)
- **Email Logs**: Resend dashboard
- **Database Logs**: Provider-specific (Supabase, Railway)

## Testing Strategy

### Current State

- **Type Safety**: TypeScript strict mode
- **Linting**: ESLint with Next.js config
- **Manual Testing**: Development testing

### Recommended Additions

- **Unit Tests**: Vitest for utility functions
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright for critical user flows
- **Visual Regression**: Chromatic or Percy

## Further Reading

- [Setup Guide](./setup.md) - Getting started with development
- [Development Guide](./development.md) - Day-to-day development workflow
- [API Reference](./api-reference.md) - API endpoints documentation
- [Database Schema](./database-schema.md) - Database models and relationships
- [Deployment Guide](./deployment.md) - Production deployment
