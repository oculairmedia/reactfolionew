# CDN Media Management in Payload CMS

## Overview

The site uses **BunnyCDN** (`oculair.b-cdn.net`) for fast, globally-distributed media delivery. The Payload CMS Media collection is configured to support both:

1. **CDN References** - Register existing CDN media URLs in the CMS without duplication
2. **Direct Uploads** - Upload new media to Payload (stores in `/media` directory)

## Why This Hybrid Approach?

✅ **Performance** - Keep using CDN for existing media (no migration needed)  
✅ **Flexibility** - Upload new media directly to CMS when needed  
✅ **Management** - Manage all media (CDN + uploaded) in one place  
✅ **No Disruption** - Existing CDN URLs continue to work  

## Media Collection Fields

### Core Fields
- **cdn_url** (text) - CDN URL for external media (e.g., `https://oculair.b-cdn.net/cache/images/...`)
- **source** (select) - `upload` or `cdn` (auto-detected)
- **media_type** (select) - `image` or `video`
- **alt** (text, required) - Alt text for accessibility
- **caption** (text, optional) - Display caption
- **credit** (text, optional) - Photo credit/attribution

### Upload Fields (when source = 'upload')
- **filename** - Uploaded file name
- **url** - Local media URL
- **sizes** - Generated image variants (thumbnail, small, medium, large, og)

## Usage Scenarios

### Scenario 1: Register Existing CDN Media

For media already hosted on your CDN:

```javascript
// In Payload Admin:
1. Go to Media collection
2. Click "Create New"
3. Fill in:
   - cdn_url: https://oculair.b-cdn.net/cache/images/your-image.jpg
   - alt: "Descriptive alt text"
   - media_type: image
4. Save
```

The `source` field will automatically be set to `cdn`.

### Scenario 2: Upload New Media

For new content:

```javascript
// In Payload Admin:
1. Go to Media collection
2. Click "Create New"
3. Upload file using file picker
4. Fill in alt text
5. Save
```

The `source` field will automatically be set to `upload`.

## Importing Existing CDN Media

A migration script is provided to automatically import all CDN media references from your codebase:

### Prerequisites
```bash
# Set your Payload admin credentials
export PAYLOAD_EMAIL="admin@emmanuelu.com"
export PAYLOAD_PASSWORD="your_admin_password"
export PAYLOAD_PUBLIC_SERVER_URL="https://cms2.emmanuelu.com"
```

### Run the Import
```bash
cd /path/to/reactfolionew
node import-cdn-media.js
```

### What the Script Does
1. Scans `src/content/` for CDN URLs (`oculair.b-cdn.net`)
2. Extracts image and video URLs
3. Checks if media already exists in CMS
4. Creates Media entries for new CDN URLs
5. Auto-generates alt text from filenames
6. Provides detailed import summary

### Sample Output
```
🔍 Scanning for CDN media URLs...

📊 Found 47 unique CDN media references

✅ Authenticated successfully

📤 Importing media to Payload CMS...

✅ Created: Voices Poster
✅ Created: Branton Poster
⏭️  Skipping (already exists): https://oculair.b-cdn.net/...
✅ Created: Coffee Altitude Hero

============================================================
📊 Import Summary:
============================================================
✅ Imported: 45
⏭️  Skipped (already exist): 2
❌ Failed: 0
📦 Total processed: 47
============================================================
```

## Using Media in Projects/Portfolio

### Option 1: Reference by CDN URL (Current Method)
```json
{
  "title": "Project Name",
  "featured_image": "https://oculair.b-cdn.net/cache/images/project.jpg"
}
```

### Option 2: Reference by Media ID (Recommended)
After importing CDN media to Payload:

```json
{
  "title": "Project Name",
  "featured_image": "media_id_from_payload"
}
```

Then in your frontend code:
```javascript
// Fetch project with populated media
const project = await fetch('/api/projects/123?depth=1');
// featured_image will be fully populated with all media data
const imageUrl = project.featured_image.cdn_url || project.featured_image.url;
```

## Best Practices

### For Existing Media
1. ✅ Keep using CDN URLs directly
2. ✅ Register them in Payload for cataloging
3. ✅ Add meaningful alt text for SEO/accessibility
4. ❌ Don't re-upload (creates duplicates)

### For New Media
1. ✅ Upload directly to Payload CMS
2. ✅ Let Payload generate optimized sizes
3. ✅ Consider uploading to CDN then registering URL
4. ✅ Always add alt text

### CDN Workflow Recommendation
```
New Image → Upload to BunnyCDN → Get CDN URL → Register in Payload
```

This keeps your CDN as source of truth while CMS manages metadata.

## Image Optimization

### For CDN Images
BunnyCDN handles optimization via URL parameters:
```
https://oculair.b-cdn.net/cache/images/image.jpg?width=800&quality=85
```

### For Uploaded Images
Payload automatically generates these sizes:
- **thumbnail** - 300×300 (WebP, 80% quality)
- **small** - 600px wide (WebP, 85% quality)
- **medium** - 1024px wide (WebP, 85% quality)
- **large** - 1920px wide (WebP, 90% quality)
- **og** - 1200×630 (JPEG, 85% quality) for social media

## API Endpoints

### List All Media
```bash
GET https://cms2.emmanuelu.com/api/media
GET https://cms2.emmanuelu.com/api/media?where[source][equals]=cdn
GET https://cms2.emmanuelu.com/api/media?where[media_type][equals]=video
```

### Get Specific Media
```bash
GET https://cms2.emmanuelu.com/api/media/{id}
```

### Create CDN Media Entry
```bash
POST https://cms2.emmanuelu.com/api/media
Content-Type: application/json

{
  "cdn_url": "https://oculair.b-cdn.net/cache/images/example.jpg",
  "media_type": "image",
  "alt": "Example image",
  "source": "cdn"
}
```

## Troubleshooting

### Media Not Showing in Admin
**Cause:** No media entries in database (only files on disk)  
**Solution:** Run `import-cdn-media.js` script

### CDN Images Broken
**Cause:** CDN URL changed or file removed from BunnyCDN  
**Solution:** Update `cdn_url` field in Payload or re-upload

### Duplicate Media Entries
**Cause:** Running import script multiple times  
**Solution:** Script checks for duplicates, but you can manually delete extras

### Upload Too Large
**Cause:** File exceeds Payload size limit  
**Solution:** Upload to CDN first, then register URL in Payload

## Migration Path (Future)

If you want to eventually move away from CDN uploads to Payload uploads:

1. Run import script to catalog all CDN media
2. For new projects, upload to Payload
3. Gradually migrate old projects to reference Payload media IDs
4. Update frontend code to handle both CDN URLs and Payload media objects
5. Eventually deprecate direct CDN URL references

## Environment Variables

For the import script and CMS:

```bash
# CMS Configuration
PAYLOAD_PUBLIC_SERVER_URL=https://cms2.emmanuelu.com
PAYLOAD_EMAIL=admin@emmanuelu.com
PAYLOAD_PASSWORD=your_secure_password

# CDN Configuration (optional, for future enhancements)
CDN_BASE_URL=https://oculair.b-cdn.net
CDN_API_KEY=your_bunnycdn_api_key  # If you want automated CDN uploads
```

## Summary

- ✅ Media collection supports both CDN and uploaded media
- ✅ Import script catalogs existing CDN media
- ✅ No performance impact - CDN URLs continue to work
- ✅ Centralized media management in Payload admin
- ✅ Flexible: Choose CDN or upload per use case

Your CDN acceleration remains intact while gaining CMS management benefits!
