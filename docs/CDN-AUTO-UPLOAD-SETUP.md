# BunnyCDN Auto-Upload Setup Guide

## Overview

The BunnyCDN auto-upload system automatically uploads media files from Payload CMS to BunnyCDN storage, providing:

- ✅ **Zero manual work** - Files auto-sync to CDN after upload
- ✅ **CDN acceleration** - Fast global delivery via BunnyCDN
- ✅ **Local backups** - Configurable local file retention
- ✅ **Retry logic** - Automatic retry of failed uploads
- ✅ **Monitoring** - Track sync status in Payload admin

## Architecture

```
User uploads via Payload Admin
    ↓
File saved locally (fast, reliable)
    ↓
afterChange hook triggers (async)
    ↓
Upload to BunnyCDN in background
    ↓ (on success)
Update Media document with CDN URL
    ↓
Mark as 'cdn_synced: true'
    ↓ (optional after 30 days)
Delete local file backup
```

## Components

### 1. BunnyCDN Client (`payload/services/BunnyCDNClient.ts`)
- REST API client for BunnyCDN Storage
- Upload/delete operations with retry logic
- Exponential backoff for network errors
- Connection testing and validation

### 2. Media Collection Hooks (`payload/collections/Media.ts`)
- **afterChange**: Auto-upload to CDN after file save
- **beforeDelete**: Clean up CDN files on deletion
- New fields: `cdn_synced`, `cdn_sync_error`, `cdn_uploaded_at`, `cdn_remote_path`

### 3. Background Jobs (`payload/services/CDNSyncJob.ts`)
- **Retry Job**: Re-attempt failed uploads every hour
- **Cleanup Job**: Remove old local files after 30 days
- Configurable intervals and retention periods

### 4. Server Integration (`server.ts`)
- Initializes CDN sync jobs on startup
- Logs job activity and errors

## Installation

### 1. Install Dependencies

The system uses `axios` for HTTP requests (already included in most Node.js projects):

```bash
npm install axios
# or
yarn add axios
```

### 2. Configure Environment Variables

Add these to your backend `.env` or `.env.backend` file:

```bash
# BunnyCDN Configuration
BUNNY_STORAGE_ZONE=your-storage-zone-name
BUNNY_ACCESS_KEY=your-storage-zone-password
BUNNY_PULL_ZONE_URL=https://your-zone.b-cdn.net

# Enable auto-upload
ENABLE_CDN_AUTO_UPLOAD=true

# File retention (optional)
KEEP_LOCAL_BACKUP=true
DELETE_LOCAL_AFTER_DAYS=30

# Job intervals (optional)
CDN_RETRY_INTERVAL_MINUTES=60
CDN_CLEANUP_INTERVAL_DAYS=1
```

#### How to Get BunnyCDN Credentials:

1. **Sign up** at https://bunny.net/
2. **Create a Storage Zone**:
   - Go to Storage → Add Storage Zone
   - Choose region (e.g., Falkenstein for EU)
   - Note the zone name (e.g., `oculair`)
3. **Get Access Key**:
   - Click on your storage zone
   - Copy the "Password" (this is your access key)
4. **Create a Pull Zone** (if needed):
   - Go to Pull Zones → Add Pull Zone
   - Link it to your storage zone
   - Note the pull zone URL (e.g., `https://oculair.b-cdn.net`)

### 3. Deploy

The code is already integrated! Just:

1. **Set environment variables** on your server
2. **Restart Payload CMS** to apply changes
3. **Upload a test image** via Payload admin
4. **Check logs** to verify CDN upload

## Usage

### Uploading New Media

1. Go to Payload Admin → Media
2. Click "Create New"
3. Upload a file and add alt text
4. Click "Save"
5. File is saved locally, then auto-uploaded to CDN
6. Check the sidebar for CDN status:
   - ✅ `cdn_synced: true` - Upload successful
   - ❌ `cdn_sync_error` - Error message if failed

### Registering Existing CDN Media

For media already on your CDN:

1. Go to Payload Admin → Media
2. Click "Create New"
3. **Don't upload a file**
4. Fill in:
   - `cdn_url`: Full CDN URL (e.g., `https://oculair.b-cdn.net/cache/images/photo.jpg`)
   - `source`: Will auto-set to "CDN (External)"
   - `alt`: Alt text for accessibility
5. Click "Save"

### Monitoring Sync Status

Each media item shows:
- **cdn_synced**: Whether upload succeeded
- **cdn_uploaded_at**: When uploaded to CDN
- **cdn_sync_error**: Error message if failed
- **cdn_remote_path**: Path on CDN storage

## Background Jobs

### Retry Job

Runs every hour (configurable via `CDN_RETRY_INTERVAL_MINUTES`):
- Finds media with `cdn_synced: false`
- Retries upload to CDN
- Updates sync status

### Cleanup Job

Runs daily (configurable via `CDN_CLEANUP_INTERVAL_DAYS`):
- Only runs if `KEEP_LOCAL_BACKUP=false`
- Finds files synced > 30 days ago (configurable)
- Deletes local copies to free disk space

## Troubleshooting

### Upload Fails Immediately

**Check environment variables:**
```bash
# In your server logs, look for:
[BunnyCDN] Client initialized successfully
[BunnyCDN] Missing configuration. Auto-upload disabled.
```

If disabled, verify `.env` has correct values.

### Upload Fails with Network Error

**Retry logic handles this automatically:**
- Uploads retry 3 times with exponential backoff
- If still failing, error saved to `cdn_sync_error`
- Retry job will attempt again in 1 hour

**Common causes:**
- Firewall blocking BunnyCDN API
- Invalid access key
- Storage zone doesn't exist

### Files Not Cleaning Up

**Check settings:**
```bash
KEEP_LOCAL_BACKUP=true  # Set to 'false' to enable cleanup
DELETE_LOCAL_AFTER_DAYS=30  # Minimum age for deletion
```

**Verify cleanup job is running:**
```bash
# Look for in server logs:
[CDNSyncJob] Starting cleanup of files synced before...
```

### CDN URL Not Appearing

**Verify afterChange hook:**
1. Upload test image
2. Check server logs for:
   ```
   [Media] Auto-uploading filename.jpg to CDN...
   [Media] Successfully uploaded to CDN: https://...
   ```

3. If you see "CDN client not available", check env vars

## Testing

### Manual Test

```bash
# 1. Start your Payload server
npm run dev

# 2. Upload a test image via admin UI

# 3. Check logs for:
[BunnyCDN] Uploading /path/to/file to media/filename.jpg
[BunnyCDN] Upload successful: https://...
[Media] Successfully uploaded to CDN: https://...

# 4. Verify in BunnyCDN dashboard:
# Storage > Your Zone > Browse Files > media/
```

### Test Retry Job Manually

Add to `server.ts` temporarily:

```typescript
import { retrySyncFailedUploads } from './payload/services/CDNSyncJob';

// In onInit callback:
setTimeout(async () => {
  const stats = await retrySyncFailedUploads(payload);
  console.log('Retry stats:', stats);
}, 5000);
```

## Migration

See [MEDIA-MIGRATION-GUIDE.md](./MEDIA-MIGRATION-GUIDE.md) for detailed instructions on:
- Importing existing CDN media
- Migrating local uploads to CDN
- Rollback procedures

## Configuration Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BUNNY_STORAGE_ZONE` | Yes* | - | Storage zone name |
| `BUNNY_ACCESS_KEY` | Yes* | - | Storage zone password |
| `BUNNY_PULL_ZONE_URL` | Yes* | - | Pull zone CDN URL |
| `ENABLE_CDN_AUTO_UPLOAD` | No | `false` | Enable auto-upload |
| `KEEP_LOCAL_BACKUP` | No | `true` | Keep local files |
| `DELETE_LOCAL_AFTER_DAYS` | No | `30` | Days before cleanup |
| `CDN_RETRY_INTERVAL_MINUTES` | No | `60` | Retry job interval |
| `CDN_CLEANUP_INTERVAL_DAYS` | No | `1` | Cleanup job interval |

\* Required only if `ENABLE_CDN_AUTO_UPLOAD=true`

## Security Considerations

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Access keys are sensitive** - Store in environment variables, not code
3. **Use HTTPS** - BunnyCDN API uses HTTPS by default
4. **Validate file types** - Payload's `mimeTypes` setting protects against malicious uploads
5. **Backup strategy** - Keep local backups initially (`KEEP_LOCAL_BACKUP=true`)

## Performance

- **Upload time**: ~1-3 seconds per file (depending on size)
- **Async processing**: Upload happens in background, doesn't block UI
- **Retry overhead**: Failed uploads retry hourly (low server impact)
- **Cleanup impact**: Minimal (runs once daily, batch processes)

## Support

- **BunnyCDN Docs**: https://docs.bunny.net/
- **BunnyCDN Support**: https://bunny.net/support/
- **Payload Docs**: https://payloadcms.com/docs/

## Roadmap

Potential future enhancements:

- [ ] Support for official `@bunny.net/storage-sdk`
- [ ] Image transformation on upload (resize, optimize)
- [ ] Multi-region support (upload to multiple zones)
- [ ] Admin UI for manual sync control
- [ ] Webhook notifications for sync events
- [ ] CDN analytics integration
