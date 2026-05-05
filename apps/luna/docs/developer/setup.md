# Development Setup Guide

## Prerequisites

### Required Software

- **Node.js**: v18.17.0 or higher (v20+ recommended)
- **npm**: v9+ (comes with Node.js)
- **PostgreSQL**: v14+ (local or cloud instance)
- **Git**: For version control

### Optional Tools

- **Docker**: For containerized PostgreSQL
- **Prisma Studio**: Database GUI (included)
- **VS Code**: Recommended IDE with extensions:
  - Prisma
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript

## Initial Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Luna
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js
- React
- TypeScript
- Prisma
- NextAuth.js
- Tailwind CSS
- Sharp (image processing)
- Resend (email)

### 3. Database Setup

#### Option A: Local PostgreSQL

**Install PostgreSQL**:

macOS:
```bash
brew install postgresql@14
brew services start postgresql@14
```

Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

Windows: Download installer from [postgresql.org](https://www.postgresql.org/download/)

**Create Database**:

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE luna_dev;

# Create user (optional)
CREATE USER luna_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE luna_dev TO luna_user;

# Exit
\q
```

#### Option B: Docker PostgreSQL

```bash
docker run --name luna-postgres \
  -e POSTGRES_DB=luna_dev \
  -e POSTGRES_USER=luna_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:14
```

#### Option C: Cloud Database

Use a managed PostgreSQL service:
- **Supabase**: Free tier with PostgreSQL
- **Railway**: PostgreSQL with easy setup
- **Neon**: Serverless PostgreSQL
- **PlanetScale**: MySQL (requires schema adjustments)

### 4. Environment Configuration

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Database Connection
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://luna_user:your_password@localhost:5432/luna_dev"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-key-here"

# Email Configuration (Optional for development)
RESEND_API_KEY="re_123456789"
ADMIN_EMAIL="admin@example.com"
FROM_EMAIL="noreply@example.com"

# Image Storage (Optional - for Vercel Blob)
BLOB_READ_WRITE_TOKEN=""
```

**Generate NEXTAUTH_SECRET**:

```bash
openssl rand -base64 32
```

### 5. Database Migration

Initialize and migrate the database schema:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# OR create migration (production-like)
npm run db:migrate
```

### 6. Seed Database

Populate with initial data (admin user, sample galleries):

```bash
npm run db:seed
```

**Default Admin Credentials**:
- Email: `admin@example.com`
- Password: `admin123`

**⚠️ Change these credentials immediately in production!**

### 7. Create Upload Directory

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### 8. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Verification

### Check Installation

1. **Homepage**: Visit `http://localhost:3000` - should see homepage
2. **Login**: Visit `http://localhost:3000/login` - should see login form
3. **Admin**: Login with seeded credentials - should access admin dashboard

### Test Database Connection

```bash
# Open Prisma Studio
npm run db:studio
```

Opens GUI at `http://localhost:5555` to view database records.

### Test Image Upload

1. Login to admin dashboard
2. Navigate to Upload page
3. Drag and drop an image
4. Check `/public/uploads/` directory for processed image

## Email Setup (Optional)

### Development

For development, email sending can be disabled:
- Don't set `RESEND_API_KEY` in `.env`
- Emails will fail silently (logged to console)
- Inquiries and bookings still save to database

### Resend Configuration

1. Create account at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add to `.env`:
   ```bash
   RESEND_API_KEY="re_your_api_key"
   ADMIN_EMAIL="your-email@example.com"
   FROM_EMAIL="noreply@yourdomain.com"
   ```
4. Verify sender domain in Resend dashboard

**Test Email**:

```bash
# In Prisma Studio or code, trigger email send
# Check Resend dashboard for delivery status
```

## Troubleshooting

### Database Connection Fails

**Error**: `Can't reach database server`

**Solutions**:
1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list | grep postgresql

   # Linux
   systemctl status postgresql

   # Docker
   docker ps | grep postgres
   ```

2. Check connection string in `.env`
3. Test connection:
   ```bash
   psql "postgresql://luna_user:your_password@localhost:5432/luna_dev"
   ```

### Prisma Client Errors

**Error**: `@prisma/client did not initialize yet`

**Solution**:
```bash
npm run db:generate
```

### Image Upload Fails

**Error**: `EACCES: permission denied`

**Solution**:
```bash
chmod 755 public/uploads
```

**Error**: `Sharp installation failed`

**Solution**:
```bash
npm install --platform=<your-platform> --arch=<your-arch> sharp
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:
1. Change port:
   ```bash
   PORT=3001 npm run dev
   ```

2. Kill process using port:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### TypeScript Errors

**Error**: Type errors on build

**Solution**:
```bash
# Delete generated types and rebuild
rm -rf node_modules/.prisma
npm run db:generate
npm run build
```

## Next Steps

- Read [Development Guide](./development.md) for workflow
- Review [API Reference](./api-reference.md) for endpoints
- Check [Database Schema](./database-schema.md) for models
- Explore codebase structure in [Architecture](./architecture.md)

## Common Development Tasks

### Reset Database

```bash
# Warning: Deletes all data
npm run db:push -- --force-reset
npm run db:seed
```

### Update Database Schema

1. Edit `prisma/schema.prisma`
2. Create migration:
   ```bash
   npm run db:migrate -- --name description_of_change
   ```
3. Regenerate Prisma Client:
   ```bash
   npm run db:generate
   ```

### Add New Dependencies

```bash
npm install <package-name>

# For type definitions
npm install -D @types/<package-name>
```

### Check Code Quality

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Format (if Prettier configured)
npx prettier --write .
```
