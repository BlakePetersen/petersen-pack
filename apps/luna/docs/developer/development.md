# Development Guide

## Development Workflow

### Daily Development

```bash
# Start development server
npm run dev

# In separate terminal, open database GUI
npm run db:studio
```

Access points:
- **App**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555

### Project Structure

```
Luna/
├── app/                  # Next.js App Router
│   ├── (auth)/          # Auth-related routes
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes
│   └── */page.tsx       # Public pages
├── components/          # React components
├── lib/                 # Server utilities
├── prisma/              # Database schema
├── public/              # Static assets
└── types/               # TypeScript types
```

## Component Development

### Creating Components

**Server Component** (default):

```tsx
// components/MyComponent.tsx
export default function MyComponent({ title }: { title: string }) {
  return <div>{title}</div>;
}
```

**Client Component** (with interactivity):

```tsx
// components/MyInteractiveComponent.tsx
'use client';

import { useState } from 'react';

export default function MyInteractiveComponent() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Component Guidelines

1. **Default to Server Components**: Only use `'use client'` when needed
2. **Prop Types**: Always define TypeScript interfaces
3. **File Naming**: PascalCase for component files (`GalleryCard.tsx`)
4. **ABOUTME Comments**: Start files with 2-line description

Example:

```tsx
// ABOUTME: Displays a single gallery card with image, title, and description
// ABOUTME: Used in portfolio grid and featured galleries section

interface GalleryCardProps {
  title: string;
  slug: string;
  coverImageUrl?: string;
  description?: string;
}

export default function GalleryCard({
  title,
  slug,
  coverImageUrl,
  description
}: GalleryCardProps) {
  // Component implementation
}
```

## Page Development

### Creating Pages

Pages are created in the `app/` directory using the file-system based router.

**Simple Page**:

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <main>
      <h1>About</h1>
      <p>Content here</p>
    </main>
  );
}
```

**Page with Data Fetching**:

```tsx
// app/portfolio/[slug]/page.tsx
import { prisma } from '@/lib/prisma';

export default async function GalleryPage({
  params,
}: {
  params: { slug: string };
}) {
  const gallery = await prisma.gallery.findUnique({
    where: { slug: params.slug },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!gallery) {
    return <div>Gallery not found</div>;
  }

  return (
    <main>
      <h1>{gallery.title}</h1>
      {/* Render gallery */}
    </main>
  );
}
```

### Metadata

Always define metadata for SEO:

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio | Luna Photography',
  description: 'View our photography portfolio',
};

export default function PortfolioPage() {
  // Page content
}
```

## API Development

### Creating API Routes

API routes are created in `app/api/` with `route.ts` files.

**Basic Route**:

```tsx
// app/api/hello/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}
```

**Protected Route** (requires authentication):

```tsx
// app/api/admin/galleries/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const data = await request.json();

  // Create gallery
  const gallery = await prisma.gallery.create({
    data: {
      title: data.title,
      slug: data.slug,
      // ...
    },
  });

  return NextResponse.json(gallery);
}
```

**With Error Handling**:

```tsx
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Business logic here
    const result = await prisma.gallery.create({ data });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Database Operations

### Querying Data

**Find Single Record**:

```tsx
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
});
```

**Find Multiple Records**:

```tsx
const galleries = await prisma.gallery.findMany({
  where: { featured: true },
  orderBy: { sortOrder: 'asc' },
  include: { images: true },
});
```

**Create Record**:

```tsx
const gallery = await prisma.gallery.create({
  data: {
    title: 'New Gallery',
    slug: 'new-gallery',
    description: 'Description here',
  },
});
```

**Update Record**:

```tsx
const updated = await prisma.gallery.update({
  where: { id: galleryId },
  data: { title: 'Updated Title' },
});
```

**Delete Record**:

```tsx
await prisma.gallery.delete({
  where: { id: galleryId },
});
```

### With Relations

**Create with Related Records**:

```tsx
const gallery = await prisma.gallery.create({
  data: {
    title: 'Wedding Gallery',
    slug: 'wedding-2024',
    images: {
      create: [
        { url: '/uploads/img1.webp', sortOrder: 0 },
        { url: '/uploads/img2.webp', sortOrder: 1 },
      ],
    },
  },
  include: { images: true },
});
```

**Include Relations**:

```tsx
const gallery = await prisma.gallery.findUnique({
  where: { slug: 'wedding-2024' },
  include: {
    images: {
      orderBy: { sortOrder: 'asc' },
    },
  },
});
```

### Transactions

For atomic operations:

```tsx
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'client@example.com', role: 'CLIENT' },
  });

  const gallery = await tx.clientGallery.create({
    data: {
      title: 'Client Delivery',
      slug: 'client-2024',
      clientId: user.id,
    },
  });

  return { user, gallery };
});
```

## Schema Changes

### Modifying Database Schema

1. **Edit Schema**:

```prisma
// prisma/schema.prisma
model Gallery {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  newField    String?  // Add new field
  // ...
}
```

2. **Create Migration**:

```bash
npm run db:migrate -- --name add_new_field
```

3. **Regenerate Prisma Client**:

```bash
npm run db:generate
```

4. **Update Code**: TypeScript will show errors where types changed

### Migration Commands

```bash
# Create and apply migration
npm run db:migrate

# Create migration without applying
npm run db:migrate -- --create-only

# Reset database (development only!)
npm run db:push -- --force-reset

# View migration status
npx prisma migrate status

# Resolve failed migration
npx prisma migrate resolve
```

## Image Processing

### Upload Flow

Images are processed through Sharp before storage:

```tsx
// In API route
import sharp from 'sharp';

const buffer = Buffer.from(await file.arrayBuffer());

// Get metadata
const metadata = await sharp(buffer).metadata();

// Process image
const processedBuffer = await sharp(buffer)
  .resize(2400, 2400, {
    fit: 'inside',
    withoutEnlargement: true,
  })
  .webp({ quality: 85 })
  .toBuffer();

// Save to disk
const filename = `${Date.now()}-${sanitizeFilename(file.name)}.webp`;
const filepath = path.join(process.cwd(), 'public/uploads', filename);
await fs.writeFile(filepath, processedBuffer);
```

### Image Component Usage

```tsx
import Image from 'next/image';

<Image
  src={imageUrl}
  alt={altText}
  width={width}
  height={height}
  className="object-cover"
  loading="lazy"
/>
```

## Email Development

### Sending Emails

```tsx
import { sendEmail } from '@/lib/email';
import { AdminInquiryNotification } from '@/lib/email-templates/admin-inquiry-notification';

// In API route
await sendEmail({
  to: process.env.ADMIN_EMAIL!,
  subject: 'New Inquiry Received',
  react: AdminInquiryNotification({
    name: inquiry.name,
    email: inquiry.email,
    message: inquiry.message,
  }),
});
```

### Creating Email Templates

```tsx
// lib/email-templates/my-email.tsx
interface MyEmailProps {
  name: string;
  message: string;
}

export function MyEmail({ name, message }: MyEmailProps) {
  return (
    <div>
      <h1>Hello {name}</h1>
      <p>{message}</p>
    </div>
  );
}
```

## Styling

### Tailwind CSS

**Utility-First Approach**:

```tsx
<div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-soft">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h2>
</div>
```

**Responsive Design**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

**Custom Classes** (when needed):

```css
/* globals.css */
@layer components {
  .btn-primary {
    @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700;
  }
}
```

### Dark Mode

Components should support dark mode:

```tsx
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">
    Text content
  </p>
</div>
```

## Testing Strategies

### Manual Testing

1. **Test Features Locally**:
   - Use admin dashboard to create/edit records
   - View public pages to see changes
   - Test forms and submissions

2. **Test Different States**:
   - Logged in vs logged out
   - Admin vs client user
   - Empty states
   - Error states

3. **Test Responsiveness**:
   - Desktop (1920px)
   - Tablet (768px)
   - Mobile (375px)

### Database Testing

Use Prisma Studio to:
- View created records
- Manually create test data
- Verify relationships
- Check data integrity

### API Testing

Use tools like:
- **curl**: Command-line requests
- **Postman**: GUI for API testing
- **Thunder Client**: VS Code extension

Example:

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

## Debugging

### Console Logging

```tsx
console.log('Debug info:', data);
console.error('Error occurred:', error);
```

### Next.js Error Overlay

Development mode shows detailed errors:
- Stack traces
- Component tree
- Error source

### Prisma Logging

Enable query logging:

```tsx
// lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### React DevTools

Install browser extension for:
- Component tree inspection
- Props and state viewing
- Performance profiling

## Common Tasks

### Add New Gallery Type

1. Update types (if using enum)
2. Update UI dropdown options
3. Add to seed data (optional)

### Add New Email Template

1. Create template in `lib/email-templates/`
2. Import in email service
3. Call `sendEmail()` with template

### Add New Admin Page

1. Create `app/admin/my-page/page.tsx`
2. Add link in admin sidebar layout
3. Implement page content

### Add New API Endpoint

1. Create `app/api/my-endpoint/route.ts`
2. Implement HTTP methods (GET, POST, etc.)
3. Add authentication check if needed
4. Update API documentation

## Performance Tips

### Server Components

- Fetch data in server components (faster, no client JS)
- Pass data to client components as props

### Database Queries

- Use `include` instead of separate queries
- Select only needed fields with `select`
- Add indexes to frequently queried fields

### Image Optimization

- Use Next.js `<Image>` component
- Provide explicit width/height
- Use appropriate sizes for responsive images

### Code Splitting

- Use dynamic imports for heavy components:

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

## Git Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add my feature"

# Push to remote
git push origin feature/my-feature
```

### Commit Messages

Follow conventional commits:

```
feat: Add booking calendar
fix: Resolve image upload error
docs: Update API documentation
style: Format code with Prettier
refactor: Simplify gallery query
test: Add booking form tests
```

## Next Steps

- Review [API Reference](./api-reference.md) for endpoint details
- Check [Database Schema](./database-schema.md) for model reference
- Read [Deployment Guide](./deployment.md) before deploying
