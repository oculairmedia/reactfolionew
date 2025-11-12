# Portfolio Site Management Guide

## Quick Reference

### 🌐 URLs
- **Live Site**: https://emmanuelu.com
- **CMS Admin**: https://cms2.emmanuelu.com/admin
- **Local CMS**: http://192.168.50.90:3006/admin
- **GitHub**: https://github.com/oculairmedia/reactfolionew

### 🔐 Credentials
- **Email**: emanuvaderland@gmail.com
- **Password**: 7beEXKPk93xSD6m
- **Stored in**: `/opt/stacks/personal-site/.env.payload`

## Common Tasks

### Add New Project

1. **Go to CMS Admin** → Projects → Create New
2. **Fill Required Fields:**
   - Title (e.g., "Project Name")
   - Subtitle (short description, ~150 chars)
   - Slug (auto-generated from title)
3. **Add Hero:**
   - Type: Choose "image" or "video"
   - Upload/link media
   - Add alt text
4. **Add Content Sections:**
   - Click "Add Section"
   - Title + Content (supports markdown)
   - Choose layout: single-column or two-column
5. **Add Gallery Images/Videos:**
   - Click "Add Gallery Item"
   - Upload or link to CDN URL
   - Choose width: full, half, third
6. **Add Metadata:**
   - Client name
   - Project date
   - Your role
   - Technologies used
7. **Add to Portfolio:**
   - Go to Portfolio collection
   - Create new portfolio item
   - Link to the project you just created
   - Upload featured image

### Edit About Page

**Go to**: Globals → About Page

**Sections to Edit:**
- **Bio**: Your personal introduction
- **Timeline**: Work history
  - Click "Add Timeline Item"
  - Fill: Job Title, Company, Date Range
- **Skills**: Technical skills with percentages
  - Click "Add Skill"
  - Fill: Skill Name, Value (0-100)
- **Services**: Services you offer
  - Click "Add Service"
  - Fill: Title, Description

### Update Site Settings

**Go to**: Globals → Site Settings

- **Logo Text**: Your name/brand
- **Contact Info**: Email for contact form
- **Social Links**: Add/edit social media URLs
- **Site Metadata**: SEO title/description

## Development Workflow

### Local Development

```bash
cd /opt/stacks/personal-site

# Start frontend dev server
npm start

# Start CMS (if needed)
# CMS is already running on port 3006
```

### Make Code Changes

```bash
# 1. Make your changes to src/ files
# 2. Test locally
npm start

# 3. Build production version
npm run build

# 4. Commit changes
git add .
git commit -m "Description of changes"
git push origin master

# Vercel auto-deploys on push
```

### Content Updates via CMS

1. Log into CMS admin
2. Make changes through UI
3. Click "Save"
4. Rebuild frontend to pick up changes:
   ```bash
   npm run build
   git add build/
   git commit -m "Content update from CMS"
   git push
   ```

**Note**: The build process syncs from CMS automatically, so you don't need to manually export content.

## File Structure

```
personal-site/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── content/        # Static content (about.json)
│   └── App.js          # Main app
├── public/             # Static assets
├── build/              # Production build
├── payload/            # CMS configuration
│   ├── collections/    # CMS collection schemas
│   └── globals/        # CMS global schemas
├── scripts/            # Migration/utility scripts
└── .env.payload        # CMS credentials
```

## Troubleshooting

### CMS Not Loading
```bash
# Check if CMS is running
curl http://192.168.50.90:3006/health

# Restart CMS container (if using Docker)
docker-compose restart
```

### Build Fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Content Not Updating
```bash
# CMS sync happens during build
# Force fresh sync:
rm -rf src/content/cms-data.json
npm run build
```

### Images Not Loading
- Check CDN URLs are correct
- Verify BunnyCDN is accessible
- Images should use: `https://oculair.b-cdn.net/...`

## API Scripts

### Run Existing Scripts

```bash
# Import media from CDN
node import-cdn-media-axios.js

# Link media to content
node link-media-to-content-v2.js

# Populate CMS with data
node populate-all-cms-data.js

# Verify everything
node verify-final.js
```

## CDN Management

### BunnyCDN URLs
- **Images**: `https://oculair.b-cdn.net/cache/images/[hash].jpg`
- **Videos**: `https://oculair.b-cdn.net/downloads/[filename].avc`
- **Video API**: `https://oculair.b-cdn.net/api/v1/videos/[id]/[token]/avc`

### Optimize Images
Images use BunnyCDN optimization:
```
?width=800&quality=85
```

## Backup

### Export CMS Data

```bash
# Export projects
curl https://cms2.emmanuelu.com/api/projects?limit=100 > projects-backup.json

# Export portfolio
curl https://cms2.emmanuelu.com/api/portfolio?limit=100 > portfolio-backup.json

# Export globals
curl https://cms2.emmanuelu.com/api/globals/about-page > about-backup.json
```

### Backup Database
```bash
# MongoDB backup command (if direct access)
mongodump --uri="mongodb://..." --out=backup/
```

## Deployment

### Vercel Auto-Deploy
- Pushes to `master` branch auto-deploy
- View status: https://vercel.com/dashboard

### Manual Deploy
```bash
# Build locally
npm run build

# Deploy to Vercel
vercel --prod
```

## Support

### Key Documentation
- **React**: https://react.dev
- **Payload CMS**: https://payloadcms.com/docs
- **Vercel**: https://vercel.com/docs

### Project Scripts
All migration and utility scripts are in the root directory:
- `final-fixes.js` - Fix project heroes and about data
- `verify-final.js` - Verify CMS data
- `import-cdn-media-axios.js` - Import media from CDN
- `migrate-project-content-v2.js` - Migrate project text content

---

**Last Updated:** 2025-11-12  
**Status:** Production Ready ✅
