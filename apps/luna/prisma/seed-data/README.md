# Seed Data Cache

This directory contains cached gallery data scraped from the legacy Ashley Petersen Photography website.

## Purpose

Instead of re-scraping the legacy site every time we reset the database, we cache the gallery metadata (image URLs, titles, descriptions) as JSON files. This:

- Saves time when re-seeding the database
- Reduces load on the legacy website
- Ensures consistent data across database resets
- Allows for offline database seeding (as long as image URLs remain accessible)

## Files

- `galleries-index.json` - Index of all cached galleries
- `{slug}.json` - Individual gallery data files (e.g., `animals.json`, `headshots.json`)

## Workflow

### One-time: Cache gallery data

Run this ONCE to scrape the legacy site and create the cache:

```bash
pnpm cache:galleries
```

This will:

1. Scrape all gallery pages from the legacy site
2. Extract image URLs and metadata
3. Save to JSON files in this directory

### Every database reset: Seed from cache

Run this whenever you reset the database:

```bash
pnpm seed:galleries
```

This will:

1. Read the cached JSON files
2. Download and process images
3. Populate the database with galleries and images

## Refreshing the Cache

If the legacy site changes or you need updated data, simply run:

```bash
pnpm cache:galleries
```

This will overwrite the existing cache files with fresh data.

## Cache Format

Each gallery JSON file contains:

```json
{
  "title": "Gallery Title",
  "slug": "gallery-slug",
  "description": "Gallery description",
  "featured": false,
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "altText": "Image description"
    }
  ],
  "scrapedAt": "2025-01-16T00:00:00.000Z"
}
```
