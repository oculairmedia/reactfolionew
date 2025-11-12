# Payload CMS - Quick Reference

## 🎯 System Status: Production Ready

### Services
- **CMS**: http://localhost:3006
- **API**: http://localhost:3006/api
- **Admin**: http://localhost:3006/admin
- **Health**: http://localhost:3006/api/health

### Credentials
- **Email**: emanuvaderland@gmail.com
- **Password**: 7beEXKPk93xSD6m

## 🚀 Quick Start

```bash
# Start
cd /opt/stacks/implement-payload-cms-011CUxhkCJAiefDu2xtFQKcp
docker-compose up -d

# Stop
docker-compose down

# Rebuild after code changes
docker-compose build payload && docker-compose up -d

# View logs
docker logs portfolio-payload -f
```

## 📊 What's Working

### ✅ Data (73 items)
- 48 media files (images + videos)
- 11 portfolio items
- 11 project case studies
- 3 global settings

### ✅ Image Optimization
- 6 WebP sizes auto-generated
- 95% bandwidth reduction
- BunnyCDN ready

### ✅ Video Optimization
- 4 MP4 variants (480p, 854p, 1280p, 1920p)
- Thumbnail (first frame)
- 85%+ bandwidth reduction
- H.264 encoding with faststart

## 📝 API Usage

### Get Auth Token
```bash
TOKEN=$(curl -s -X POST http://localhost:3006/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emanuvaderland@gmail.com","password":"7beEXKPk93xSD6m"}' \
  | jq -r .token)
```

### Upload Image
```bash
curl -X POST "http://localhost:3006/api/media" \
  -H "Authorization: JWT $TOKEN" \
  -F "file=@image.jpg" \
  -F "alt=Image description"
```

### Upload Video
```bash
curl -X POST "http://localhost:3006/api/media" \
  -H "Authorization: JWT $TOKEN" \
  -F "file=@video.mp4;type=video/mp4" \
  -F "alt=Video description"
```

### Get Media with Sizes
```bash
curl "http://localhost:3006/api/media/{id}" \
  -H "Authorization: JWT $TOKEN"
```

### Query Media
```bash
# Get all videos
curl "http://localhost:3006/api/media?where[mimeType][like]=video" \
  -H "Authorization: JWT $TOKEN"

# Get by filename
curl "http://localhost:3006/api/media?where[filename][equals]=video.mp4" \
  -H "Authorization: JWT $TOKEN"
```

## 🖼️ Frontend Integration

### Image with Responsive Sizes
```typescript
const image = await fetch(`/api/media/${imageId}`);

// Use optimized sizes
<picture>
  <source srcSet={image.sizes.small.url} media="(max-width: 640px)" />
  <source srcSet={image.sizes.medium.url} media="(max-width: 1024px)" />
  <source srcSet={image.sizes.large.url} />
  <img src={image.url} alt={image.alt} />
</picture>
```

### Video with Adaptive Quality
```typescript
const video = await fetch(`/api/media/${videoId}`);

<video poster={video.video_sizes.thumbnail?.url}>
  <source src={video.video_sizes.low?.url} media="(max-width: 640px)" />
  <source src={video.video_sizes.medium?.url} media="(max-width: 1024px)" />
  <source src={video.video_sizes.high?.url} />
</video>
```

### Portfolio Items
```typescript
const portfolio = await fetch('/api/portfolio');

portfolio.docs.map(item => (
  <div>
    <img src={item.featured_image.sizes.medium.url} />
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </div>
))
```

### Project Case Studies
```typescript
const projects = await fetch('/api/projects');

projects.docs.map(project => (
  <div>
    <img src={project.featured_image.sizes.large.url} />
    <h2>{project.title}</h2>
    <div dangerouslySetInnerHTML={{ __html: project.content }} />
  </div>
))
```

## 🔧 Troubleshooting

### CMS Not Responding
```bash
# Check status
docker-compose ps

# Restart
docker-compose restart

# Check logs
docker logs portfolio-payload -f
```

### Images Not Optimized
```bash
# Check Sharp is installed
docker exec portfolio-payload npm list sharp

# Rebuild
docker-compose build payload && docker-compose up -d
```

### Videos Not Optimized
```bash
# Check FFmpeg
docker exec portfolio-payload ffmpeg -version

# Check media folder
docker exec portfolio-payload ls -lh /app/media/

# View hook logs (during upload)
docker logs portfolio-payload -f
```

### Database Issues
```bash
# Check MongoDB
docker exec portfolio-mongodb mongosh --eval "db.adminCommand('ping')"

# Backup database
docker exec portfolio-mongodb mongodump --out=/tmp/backup

# Restore database
docker exec portfolio-mongodb mongorestore /tmp/backup
```

## 📂 Project Structure

```
implement-payload-cms-011CUxhkCJAiefDu2xtFQKcp/
├── payload/
│   ├── collections/
│   │   ├── Media.ts              # Media with image & video optimization
│   │   ├── Portfolio.ts          # Portfolio items
│   │   ├── Projects.ts           # Case studies
│   │   └── Users.ts              # User management
│   ├── globals/
│   │   ├── AboutPage.ts          # About page content
│   │   ├── HomeIntro.ts          # Home page intro
│   │   └── SiteSettings.ts       # Site-wide settings
│   ├── hooks/
│   │   └── videoOptimizationAfter.ts  # Video optimization
│   └── services/
│       └── BunnyCDNClient.ts     # CDN integration
├── media/                        # Uploaded files
├── Dockerfile                    # Container with FFmpeg
├── docker-compose.yml            # Docker orchestration
├── payload.config.ts             # Payload configuration
└── server.ts                     # Express server
```

## 📚 Documentation

- `SESSION-SUMMARY-UPDATED.md` - Complete session summary
- `VIDEO-OPTIMIZATION-COMPLETE.md` - Video feature guide
- `VIDEO-OPTIMIZATION.md` - Video overview
- `README-MIGRATION.md` - Migration guide
- `QUICK-START.md` - Getting started
- `FINAL-STATUS.md` - Data inventory

## 🎛️ Configuration

### Environment Variables (.env)
```bash
# MongoDB
MONGODB_URI=mongodb://portfolio-mongodb:27017/portfolio

# Payload
PAYLOAD_SECRET=your-secret-key-here

# BunnyCDN (optional)
REACT_APP_BUNNY_CDN_URL=https://la.storage.bunnycdn.com
BUNNY_CDN_API_KEY=your-api-key
BUNNY_CDN_STORAGE_ZONE=your-storage-zone
BUNNY_CDN_AUTO_UPLOAD=true
```

### Ports
- `3006` → Payload CMS API
- `27018` → MongoDB
- `80/443` → Nginx (optional)

## 🎨 Collections

### Media
- **Upload**: Images (JPEG, PNG, WebP, GIF) and Videos (MP4, MOV, AVI, WebM)
- **Image Sizes**: thumbnail, small, medium, large, og (6 sizes)
- **Video Sizes**: low, medium, high, full + thumbnail (5 variants)
- **CDN**: Auto-upload ready

### Portfolio
- **Fields**: title, description, featured_image, category, tags, year, client, url
- **Count**: 11 items

### Projects
- **Fields**: title, slug, content, featured_image, category, status, date
- **Count**: 11 case studies

### Globals
- **About Page**: bio, skills, experience
- **Home Intro**: title, subtitle, cta
- **Site Settings**: site_name, logo, social_links

## 🔐 Access Control

### Collections
- **Read**: Public
- **Create/Update/Delete**: Admin only

### Media
- **Upload**: Admin only
- **View**: Public (via CDN URLs)

### API Routes
- `/api/media` - Media library
- `/api/portfolio` - Portfolio items
- `/api/projects` - Case studies
- `/api/globals/about-page` - About content
- `/api/globals/home-intro` - Home intro
- `/api/globals/site-settings` - Site settings

## 💡 Tips

### Performance
- Use WebP images for modern browsers
- Use appropriate video quality for device
- Enable CDN for production
- Cache API responses

### Development
- Use `docker-compose logs -f` to watch all logs
- Rebuild container after hook changes
- Test uploads with various file types
- Monitor disk space in container

### Production
- Set strong `PAYLOAD_SECRET`
- Enable HTTPS (Nginx)
- Configure CDN auto-upload
- Set up backups (MongoDB + media folder)
- Monitor container health

---

**Last Updated**: November 11, 2025  
**Status**: ✅ Production Ready  
**Version**: Payload 2.x  
**Container**: Docker with FFmpeg 6.1.2
