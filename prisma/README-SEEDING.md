# Database Seeding Guide

This guide explains how to generate mock data for demos and training purposes.

## Quick Start

```bash
# 1. Seed usage rights (required first)
pnpm db:seed

# 2. Seed contracts and galleries
pnpm db:seed:contracts
```

## What Gets Created

The `seed-contracts.ts` script generates realistic mock data:

### Clients

- **10 demo clients** with realistic names
- Login credentials: `client1@demo.com` through `client10@demo.com`
- Password for all demo accounts: `demo123`

### Contracts

- **10 contracts** with varying statuses:
  - DRAFT (not yet sent to client)
  - SENT (awaiting signature)
  - SIGNED (client signed, ready for gallery)
- Realistic shoot details:
  - Random shoot types (Wedding, Portrait, Family, etc.)
  - Future shoot dates
  - Locations across various venues
  - Session durations (2-8 hours)
  - Package amounts ($1,500-$5,000)
  - Deposit percentages (25%, 30%, or 50%)
- Deliverables:
  - 5-20 included retouches per contract
  - 30-100 download quota
  - Various max file sizes (2000px-6000px)
- Usage rights randomly assigned (1-2 per contract)

### Client Galleries

- Created automatically for **SIGNED contracts**
- 50/50 chance of being linked to the contract
- 20-80 mock images per gallery
- Realistic metadata:
  - Some images marked as favorites
  - Optional titles and captions
  - Proper ordering

### Retouch Requests

- 2-8 retouch requests per linked gallery
- Realistic request notes:
  - "Please brighten the background slightly"
  - "Can you remove the person in the background?"
  - "Would love to see this in black and white"
  - etc.
- Statuses: PENDING, APPROVED, or COMPLETED

### Expiration Tracking

- Linked galleries get future expiration dates
- Some galleries have download quotas partially used
- Final payment status varies (PENDING, COMPLETED, or null)

## Advanced Usage

### Generate More Data

You can run the seed script multiple times to generate more contracts:

```bash
# Run multiple times to create more data
pnpm db:seed:contracts
pnpm db:seed:contracts
pnpm db:seed:contracts
```

### Reset and Reseed

```bash
# Reset database (WARNING: Deletes all data!)
pnpm prisma migrate reset

# Re-seed everything
pnpm db:seed              # Usage rights
pnpm db:seed:contracts    # Contracts & galleries
```

### Login as Demo Client

1. Navigate to `/login`
2. Use any demo email: `client1@demo.com` (through `client10@demo.com`)
3. Password: `demo123`

### View Generated Data

```bash
# Open Prisma Studio to browse the data
pnpm db:studio
```

Navigate to http://localhost:5555 to view:

- Contracts table
- ClientGallery table
- ClientImage table
- RetouchRequest table
- User table (see demo clients)

## Data Structure

```
User (CLIENT)
  ├── Contract (DRAFT/SENT/SIGNED)
  │     ├── UsageRights (1-2 selected)
  │     └── Payments (created later in Phase 3)
  └── ClientGallery
        ├── Contract (50% are linked)
        ├── ClientImages (20-80 per gallery)
        │     └── RetouchRequests (2-8 per gallery)
        └── Expiration date (if linked)
```

## Notes

- **Image files don't exist**: The seed script creates database records with paths like `/uploads/galleries/wedding-abc123/image-1.jpg`, but actual files aren't generated. This is for database demos only.
- **Passwords are hashed**: All demo clients use bcrypt-hashed passwords
- **IDs are random**: UUIDs/CUIDs are generated automatically by Prisma
- **Data is realistic**: Uses Faker.js to generate believable names, dates, and text

## Customization

To modify the seed script:

1. Edit `prisma/seed-contracts.ts`
2. Adjust the constants at the top:
   - `SHOOT_TYPES` - Add more shoot types
   - `SHOOT_LOCATIONS` - Add more locations
3. Change quantities:
   - Number of clients (currently 10)
   - Images per gallery (currently 20-80)
   - Retouch requests (currently 2-8)

## Troubleshooting

### "No usage rights found"

Run `pnpm db:seed` first to create usage rights.

### "Email already exists"

The script checks for existing emails and reuses them. This is expected behavior.

### TypeScript errors

Make sure you've run `pnpm db:generate` after any schema changes.

## Production Warning

⚠️ **Never run seed scripts in production!** These are for development, demos, and training only.
