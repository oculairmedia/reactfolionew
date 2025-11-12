# Ghost Content API Setup Guide

## Overview

The blog now uses the Ghost Content API to fetch posts dynamically instead of redirecting to an external URL.

## Getting Your Content API Key

The credentials you provided (`GHOST_KEY_ID` and `GHOST_KEY_SECRET`) appear to be for the **Admin API**, but we need the **Content API Key** instead.

### Steps to Get Your Content API Key:

1. **Log in to your Ghost Admin Panel**
   - Go to: `https://blog.emmanuelu.com/ghost/`

2. **Navigate to Integrations**
   - Click on **Settings** (gear icon) in the left sidebar
   - Click on **Integrations**

3. **Create a Custom Integration** (or use an existing one)
   - Click **"+ Add custom integration"**
   - Give it a name (e.g., "React Portfolio Blog")
   - Click **"Create"**

4. **Copy the Content API Key**
   - You'll see two keys displayed:
     - **Content API Key** ← This is what we need (a single hex string)
     - **Admin API Key** ← This is NOT what we need (this has an ID and secret)
   - Copy the **Content API Key** (it looks like: `22444f78447824223cefc48062`)

5. **Update Your .env File**
   - Open `/home/user/reactfolionew/.env`
   - Replace `YOUR_CONTENT_API_KEY_HERE` with your actual Content API Key

   ```bash
   REACT_APP_GHOST_KEY=your_actual_content_api_key_here
   ```

6. **Restart Your Development Server**
   - If running locally: Stop and restart `npm start`
   - The blog should now load posts successfully

## Difference Between Admin API and Content API

| Feature | Content API | Admin API |
|---------|-------------|-----------|
| **Purpose** | Read-only access to public content | Full CRUD operations |
| **Authentication** | Single API key | Key ID + Secret (for JWT) |
| **Use Case** | Display blog posts on website | Manage posts, users, settings |
| **Client-Side Safe** | ✅ Yes | ❌ No |

## Troubleshooting

### "Failed to load blog posts" Error

This means the API key is incorrect or missing. Check:
- The `.env` file has `REACT_APP_GHOST_KEY` set
- The key is the Content API key, not Admin API credentials
- The key doesn't have any extra spaces or quotes
- You've restarted the development server after changing `.env`

### "Access Denied" Error

- Verify you're using the **Content API Key** from the integration page
- Make sure the integration is enabled in Ghost Admin
- Check that your Ghost instance is accessible at `https://blog.emmanuelu.com`

## Testing the API Key

You can test your Content API key with curl:

```bash
curl "https://blog.emmanuelu.com/ghost/api/content/posts/?key=YOUR_CONTENT_API_KEY&limit=1"
```

If it works, you'll see JSON data with your blog posts.

## API Version

The SDK is currently configured to use Ghost API `v5.0`. If you have a different Ghost version:
- Ghost 5.x: Use `v5.0`
- Ghost 4.x: Use `v4.0`
- Ghost 3.x: Use `v3.0`

Update the version in `/home/user/reactfolionew/src/services/ghostApi.js` if needed.
