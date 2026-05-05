# Luna Photography

A modern photography portfolio and client management system for Ashley Petersen Photography.

## Tech Stack

- **Framework**: Next.js 16 with App Router, React 19
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Image Processing**: Sharp, Vercel Blob Storage
- **Email**: Resend
- **Analytics**: Vercel Analytics
- **Testing**: Playwright (E2E), Vitest (Unit)
- **Components**: Storybook

## Features

### Public Site

- Portfolio galleries with lightbox viewer
- Blog with categories and tags
- Service pages with pricing
- Online booking system with calendar
- Contact form
- FAQ section
- Dark mode support
- SEO optimized with structured data

### Admin Dashboard

- Gallery and image management
- Blog post editor with rich text
- Client gallery creation (private photo delivery)
- Booking request management
- Availability calendar
- Testimonial management
- FAQ management

### Client Portal

- Private gallery access with PIN protection
- Image favorites and downloads
- Retouch request workflow
- Gallery expiration tracking

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# Start development server
pnpm dev
```

## Key Commands

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Start development server (port 3333) |
| `pnpm build`         | Production build                     |
| `pnpm lint`          | Run ESLint                           |
| `pnpm type-check`    | TypeScript type checking             |
| `pnpm test`          | Run Playwright E2E tests             |
| `pnpm test:unit`     | Run Vitest unit tests                |
| `pnpm storybook`     | Component documentation              |
| `pnpm prisma studio` | Database GUI                         |

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Developer Documentation](./docs/developer/)** - Architecture, setup, API reference, database schema
- **[Site Manager Documentation](./docs/site-manager/)** - Admin dashboard guides, content management

## Environment Variables

Required environment variables:

```
DATABASE_URL=           # PostgreSQL connection string
NEXTAUTH_SECRET=        # NextAuth.js secret
NEXTAUTH_URL=           # Base URL for auth
RESEND_API_KEY=         # Email service API key
BLOB_READ_WRITE_TOKEN=  # Vercel Blob storage token
```

See `.env.example` for the complete list.

## Deployment

The application is deployed on Vercel with:

- Automatic deployments on push to main
- Preview deployments for pull requests
- PostgreSQL database on Supabase
- Image storage on Vercel Blob

## License

Private - All rights reserved.
