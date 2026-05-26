# Image Upscale and Migration Script

This script upscales all images using Replicate's Real-ESRGAN AI and migrates them from Cloudinary to Vercel Blob storage.

## Prerequisites

### 1. Get a Replicate API Token

1. Sign up at [replicate.com](https://replicate.com)
2. Go to your [account settings](https://replicate.com/account/api-tokens)
3. Create a new API token
4. Copy the token

### 2. Set Up Vercel Blob Storage

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Create a new **Blob Store**
4. Copy the `BLOB_READ_WRITE_TOKEN` from the connection string

### 3. Add Environment Variables

Add these to your `.env` file:

```bash
# Replicate API Token
REPLICATE_API_TOKEN=r8_xxx...

# Vercel Blob Token (from your Blob store settings)
LUNA_READ_WRITE_TOKEN=vercel_blob_rw_xxx...
```

## Usage

### Dry Run (Recommended First)

Test the script without making any changes:

```bash
DRY_RUN=true pnpm upscale:migrate
```

This will:
- Show you which images would be processed
- Estimate costs
- Not upscale or modify anything

### Production Run

Once you're ready to proceed:

```bash
pnpm upscale:migrate
```

This will:
1. Fetch all images from your database
2. Upscale each image using Real-ESRGAN (2x by default)
3. Upload the upscaled image to Vercel Blob
4. Update the database with the new Vercel Blob URL
5. Process images in batches of 5 to avoid rate limits

## Configuration

You can modify these settings in `scripts/upscale-and-migrate.ts`:

```typescript
const BATCH_SIZE = 5        // How many images to process at once
const UPSCALE_FACTOR = 2    // 2x or 4x upscaling
const DRY_RUN = false       // Test mode
```

## Cost Estimate

For your **343 images**:
- Replicate upscaling: ~$3-7 one-time
- Vercel Blob storage: ~$3-4/month ongoing

## After Migration

### 1. Update next.config.js

Remove Cloudinary from remote patterns and add Vercel Blob:

```javascript
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'blob.vercel-storage.com',
  },
  // Remove the Cloudinary pattern
]
```

### 2. Remove Cloudinary Dependencies

```bash
# Remove environment variables
# CLOUDINARY_CLOUD_NAME
# CLOUDINARY_API_KEY
# CLOUDINARY_API_SECRET
```

### 3. Monitor Costs

Check your Vercel dashboard → Storage to monitor usage and costs.

## Troubleshooting

### Rate Limits

If you hit rate limits, the script will automatically retry with delays. You can also:
- Reduce `BATCH_SIZE` to process fewer images at once
- Run the script in smaller batches

### Failed Images

The script will log any failed images. You can:
- Re-run the script (it skips already-migrated images)
- Check the logs for specific error messages

### Vercel Blob Connection Issues

Make sure your `BLOB_READ_WRITE_TOKEN` is correct and has write permissions.

## Reverting

If you need to revert, you still have your original Cloudinary images. The script doesn't delete anything from Cloudinary.
