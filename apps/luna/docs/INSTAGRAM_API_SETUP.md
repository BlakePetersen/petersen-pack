# Instagram API Setup Guide

This guide walks through setting up the Instagram Basic Display API to fetch posts for the InstagramFeed component.

## Prerequisites

- An Instagram account (must be Business or Creator account)
- A Facebook account
- Your Instagram account connected to a Facebook Page

## Step 1: Create a Facebook Developer Account

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Get Started" in the top right
3. Log in with your Facebook account
4. Complete the registration process

## Step 2: Create a Facebook App

1. From the [Facebook Developers dashboard](https://developers.facebook.com/apps), click "Create App"
2. Select "Consumer" as the app type
3. Fill in the app details:
   - **App Name**: Choose a name (e.g., "Luna Photography Website")
   - **App Contact Email**: Your email address
4. Click "Create App"

## Step 3: Add Instagram Basic Display Product

1. In your app dashboard, scroll down to "Add Products to Your App"
2. Find "Instagram Basic Display" and click "Set Up"
3. Click "Create New App" at the bottom of Basic Display settings
4. Fill in the required fields:
   - **Valid OAuth Redirect URIs**: `https://localhost/`
   - **Deauthorize Callback URL**: `https://localhost/`
   - **Data Deletion Request URL**: `https://localhost/`
5. Click "Save Changes"

## Step 4: Add Instagram Test User

1. Scroll down to "User Token Generator"
2. Click "Add Instagram Test User"
3. Log in to the Instagram account you want to display posts from
4. Approve the authorization request

## Step 5: Generate Access Token

1. In the "User Token Generator" section, you should now see your test user
2. Click "Generate Token" next to your Instagram account
3. Approve the permissions request
4. Copy the generated access token

## Step 6: Configure Environment Variable

1. In your Luna project root, create or edit `.env.local`:

```bash
INSTAGRAM_ACCESS_TOKEN=your_access_token_here
```

2. Replace `your_access_token_here` with the token from Step 5

## Step 7: Test the Integration

1. Start your development server:

```bash
pnpm dev
```

2. Navigate to any page with the footer (e.g., homepage)
3. The Instagram carousel should display your actual posts instead of placeholders

## Access Token Expiration

Instagram Basic Display API tokens expire after 60 days. You have two options:

### Option A: Manual Refresh (Simple)

1. Go back to your Facebook App dashboard
2. Navigate to Instagram Basic Display settings
3. Click "Generate Token" again for your test user
4. Update the `INSTAGRAM_ACCESS_TOKEN` in `.env.local`

### Option B: Long-Lived Tokens (Recommended for Production)

Exchange your short-lived token for a long-lived token (valid for 60 days):

```bash
curl -i -X GET "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=YOUR_ACCESS_TOKEN"
```

Before the token expires, refresh it:

```bash
curl -i -X GET "https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=YOUR_LONG_LIVED_TOKEN"
```

This extends the expiration by another 60 days.

## Troubleshooting

### No posts showing up

1. Check the browser console for errors
2. Verify the access token is correctly set in `.env.local`
3. Restart your development server after adding the environment variable
4. Check that your Instagram account has public image posts

### API rate limit errors

The component implements a 1-hour cache to avoid rate limits. If you're hitting limits:

1. Check that the cache is working (look for repeated API calls in console)
2. Increase `CACHE_DURATION` in `/app/api/instagram/posts/route.ts`

### Token expired error

Follow the token refresh process in "Access Token Expiration" above.

### "Invalid OAuth access token" error

1. Generate a new access token from Facebook Developer dashboard
2. Update `.env.local` with the new token
3. Restart your development server

## Production Deployment

1. Add `INSTAGRAM_ACCESS_TOKEN` to your production environment variables (e.g., Vercel environment variables)
2. Set up a cron job or scheduled function to refresh the token before it expires
3. Consider implementing automatic token refresh in your application

## API Limits

Instagram Basic Display API limits:

- **Rate limit**: 200 requests per hour per user
- **Posts returned**: Up to 10,000 most recent posts
- **Token expiration**: 60 days (long-lived tokens)

The current implementation caches responses for 1 hour, limiting requests to ~24 per day under normal usage.
