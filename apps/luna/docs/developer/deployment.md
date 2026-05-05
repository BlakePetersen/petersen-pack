# Deployment Guide

## Overview

This guide covers deploying Luna to production. The recommended platform is Vercel due to native Next.js support, but other platforms are also covered.

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Production database (PostgreSQL)
- Email service configured (Resend)
- Domain name (optional but recommended)

## Deployment Platforms

### Vercel (Recommended)

#### Why Vercel?

- Native Next.js support (same team)
- Automatic deployments from Git
- Built-in CI/CD
- Edge network (global CDN)
- Serverless functions (automatic scaling)
- Free tier available

#### Setup Steps

1. **Create Vercel Account**

   Visit [vercel.com](https://vercel.com) and sign up.

2. **Import Project**

   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel

   # Or use Vercel dashboard
   ```

   - Click "Add New Project"
   - Import from Git repository
   - Select Luna repository

3. **Configure Build Settings**

   Vercel auto-detects Next.js projects:

   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables**

   Add in Vercel Dashboard → Project Settings → Environment Variables:

   ```bash
   # Database
   DATABASE_URL=postgresql://user:pass@host:5432/dbname

   # NextAuth
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=your-production-secret

   # Email
   RESEND_API_KEY=re_your_key
   ADMIN_EMAIL=admin@yourdomain.com
   FROM_EMAIL=noreply@yourdomain.com

   # Optional: Image Storage
   BLOB_READ_WRITE_TOKEN=your-blob-token
   ```

   **Generate Production Secret**:
   ```bash
   openssl rand -base64 32
   ```

5. **Deploy**

   Click "Deploy" or push to main branch:

   ```bash
   git push origin main
   ```

   Vercel automatically builds and deploys.

6. **Database Migration**

   After first deployment, run migrations:

   ```bash
   # Using Vercel CLI
   vercel env pull .env.production
   npx prisma migrate deploy

   # Or add to package.json scripts
   "postinstall": "prisma generate",
   "vercel-build": "prisma migrate deploy && next build"
   ```

7. **Custom Domain** (optional)

   - Vercel Dashboard → Domains
   - Add your domain
   - Update DNS records as instructed
   - SSL certificate auto-provisioned

---

### Railway

#### Setup

1. **Create Account**: [railway.app](https://railway.app)

2. **New Project from GitHub**
   - Connect repository
   - Railway auto-detects Next.js

3. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Connection string auto-added as `DATABASE_URL`

4. **Environment Variables**

   Add in Settings → Variables:
   ```bash
   NEXTAUTH_URL=${{ RAILWAY_PUBLIC_DOMAIN }}
   NEXTAUTH_SECRET=your-secret
   RESEND_API_KEY=your-key
   ADMIN_EMAIL=admin@yourdomain.com
   FROM_EMAIL=noreply@yourdomain.com
   ```

5. **Deploy**

   Push to main branch triggers deployment.

---

### Netlify

Next.js 15 App Router requires Netlify's Next.js Runtime.

1. **Create Account**: [netlify.com](https://netlify.com)

2. **Import Project**
   - Add site from Git
   - Select repository

3. **Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

4. **Install Plugin**
   ```bash
   npm install -D @netlify/plugin-nextjs
   ```

   Add to `netlify.toml`:
   ```toml
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

5. **Environment Variables**

   Add in Site Settings → Environment Variables (same as Vercel).

6. **External Database Required**

   Netlify doesn't provide PostgreSQL. Use:
   - Supabase
   - Neon
   - Railway PostgreSQL
   - AWS RDS

---

### Self-Hosted (VPS/Server)

#### Requirements

- Node.js 18+
- PostgreSQL 14+
- Nginx or Apache (reverse proxy)
- PM2 or systemd (process manager)
- SSL certificate (Let's Encrypt)

#### Setup

1. **Server Preparation**

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib

   # Install PM2
   sudo npm install -g pm2
   ```

2. **Database Setup**

   ```bash
   sudo -u postgres psql
   CREATE DATABASE luna_production;
   CREATE USER luna_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE luna_production TO luna_user;
   \q
   ```

3. **Clone Repository**

   ```bash
   cd /var/www
   git clone <repository-url> luna
   cd luna
   ```

4. **Install Dependencies**

   ```bash
   npm install
   ```

5. **Environment Configuration**

   ```bash
   nano .env.production
   ```

   Add environment variables (same as above).

6. **Build Application**

   ```bash
   npm run build
   ```

7. **Run Migrations**

   ```bash
   npx prisma migrate deploy
   ```

8. **Start with PM2**

   ```bash
   pm2 start npm --name "luna" -- start
   pm2 save
   pm2 startup
   ```

9. **Nginx Configuration**

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **SSL with Certbot**

    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

---

## Database Setup

### Supabase (PostgreSQL)

1. **Create Project**: [supabase.com](https://supabase.com)
2. **Get Connection String**: Settings → Database → Connection String
3. **Format for Prisma**:
   ```
   postgresql://postgres:[password]@[host]:5432/postgres
   ```
4. **Run Migrations**:
   ```bash
   DATABASE_URL="your-connection-string" npx prisma migrate deploy
   ```

### Neon (Serverless PostgreSQL)

1. **Create Account**: [neon.tech](https://neon.tech)
2. **Create Project**: Get connection string
3. **Add to Environment**: `DATABASE_URL`
4. **Enable Connection Pooling**: Recommended for serverless

### Railway PostgreSQL

1. **Add Database**: In Railway project, click "New" → "PostgreSQL"
2. **Connection String**: Auto-added as `DATABASE_URL`
3. **Migrations**: Run in deployment script

---

## Email Configuration

### Resend Setup

1. **Create Account**: [resend.com](https://resend.com)

2. **Verify Domain**
   - Add domain in dashboard
   - Add DNS records:
     ```
     Type: TXT
     Name: resend._domainkey
     Value: [provided value]
     ```

3. **Generate API Key**
   - API Keys → Create API Key
   - Add to `RESEND_API_KEY`

4. **Set From Address**
   ```bash
   FROM_EMAIL=noreply@yourdomain.com
   ADMIN_EMAIL=admin@yourdomain.com
   ```

5. **Test Configuration**
   - Submit contact form
   - Check Resend dashboard for delivery logs

---

## Image Storage

### Option 1: Local Storage (Simple)

- Images stored in `/public/uploads/`
- Works on single-server deployments
- **Not suitable for Vercel/Netlify** (ephemeral filesystem)

### Option 2: Vercel Blob

1. **Enable in Vercel**
   - Project Settings → Storage → Blob

2. **Get Token**
   - Copy `BLOB_READ_WRITE_TOKEN`

3. **Update Upload Code**
   ```typescript
   import { put } from '@vercel/blob';

   const blob = await put(filename, buffer, {
     access: 'public',
   });

   // Save blob.url to database
   ```

### Option 3: AWS S3

1. **Create S3 Bucket**
2. **Get Access Keys**
3. **Install SDK**:
   ```bash
   npm install @aws-sdk/client-s3
   ```
4. **Update Upload Code** to use S3 client

### Option 4: Cloudinary

1. **Create Account**: [cloudinary.com](https://cloudinary.com)
2. **Get Credentials**
3. **Install SDK**:
   ```bash
   npm install cloudinary
   ```
4. **Update Upload Code** to use Cloudinary API

---

## Pre-Deployment Checklist

### Security

- [ ] Change default admin password
- [ ] Use strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set secure password policies
- [ ] Review CORS settings if needed
- [ ] Enable rate limiting (optional)

### Performance

- [ ] Enable Prisma connection pooling
- [ ] Configure CDN for static assets
- [ ] Set up image optimization (Vercel automatic)
- [ ] Enable gzip/brotli compression

### Monitoring

- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom)
- [ ] Enable analytics (Vercel Analytics, Google Analytics)
- [ ] Set up email delivery monitoring (Resend dashboard)

### Backup

- [ ] Database backups configured
- [ ] Image storage backups
- [ ] Environment variables documented
- [ ] Disaster recovery plan

### Testing

- [ ] Test contact form submission
- [ ] Test booking flow
- [ ] Test admin login
- [ ] Test client gallery access
- [ ] Test image uploads
- [ ] Verify email delivery
- [ ] Check mobile responsiveness
- [ ] Test dark mode

---

## Environment Variables Reference

### Required

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-random-secret"
```

### Email (Recommended)

```bash
RESEND_API_KEY="re_..."
ADMIN_EMAIL="admin@yourdomain.com"
FROM_EMAIL="noreply@yourdomain.com"
```

### Image Storage (Optional)

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
# OR
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
AWS_S3_BUCKET="luna-images"
# OR
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

---

## Post-Deployment

### Initial Setup

1. **Login to Admin**
   - Visit `/login`
   - Use seeded credentials or create admin via database

2. **Change Admin Password**
   - Update in database or add password change feature

3. **Create Content**
   - Add galleries
   - Upload images
   - Set availability slots

4. **Test Features**
   - Submit test inquiry
   - Create test booking
   - Create test client gallery

### Ongoing Maintenance

- **Database Backups**: Schedule daily backups
- **Log Monitoring**: Check for errors regularly
- **Email Deliverability**: Monitor Resend logs
- **Performance**: Review Vercel Analytics
- **Updates**: Keep dependencies updated

---

## Troubleshooting

### Build Fails

**Error**: Type errors during build

**Solution**:
```bash
# Regenerate Prisma Client
npx prisma generate
npm run build
```

### Database Connection Fails

**Error**: Can't reach database

**Solutions**:
- Check `DATABASE_URL` format
- Verify database is accessible from deployment platform
- Enable SSL if required: `?sslmode=require`
- Check connection pooling configuration

### Images Not Displaying

**Error**: 404 on image URLs

**Solutions**:
- If using Vercel: Switch to Vercel Blob (ephemeral filesystem)
- If self-hosted: Check `/public/uploads/` permissions
- Verify image URLs in database match storage location

### Email Not Sending

**Error**: Emails not received

**Solutions**:
- Check `RESEND_API_KEY` is set
- Verify domain in Resend dashboard
- Check DNS records for domain verification
- Review Resend logs for errors
- Test with Resend API directly

### Authentication Issues

**Error**: Can't login or session expires immediately

**Solutions**:
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches deployment URL
- Clear cookies and try again
- Review NextAuth logs

---

## Scaling Considerations

### Database

- **Connection Pooling**: Use Prisma with connection pooler (PgBouncer)
- **Read Replicas**: For high-read scenarios
- **Indexes**: Add indexes on frequently queried fields

### Images

- **CDN**: Use Cloudflare, Vercel Edge, or AWS CloudFront
- **Image Optimization**: Implement on-demand resizing
- **Lazy Loading**: Already implemented with Next.js Image

### Caching

- **API Routes**: Add caching headers
- **Static Pages**: Leverage ISR (Incremental Static Regeneration)
- **Database Queries**: Consider Redis for frequently accessed data

---

## Related Documentation

- [Architecture Overview](./architecture.md)
- [Database Schema](./database-schema.md)
- [API Reference](./api-reference.md)
