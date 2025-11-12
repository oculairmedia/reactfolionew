# Testing Video Optimization

## ✅ System Status

**CMS Running**: http://localhost:3006  
**FFmpeg Installed**: ✅ Version 6.1.2  
**Container Status**: ✅ Healthy  

---

## How to Test

### Option 1: Via CMS Admin UI (Recommended)

1. **Open CMS Admin**
   ```
   https://cms2.emmanuelu.com/admin
   Login: emanuvaderland@gmail.com
   Password: 7beEXKPk93xSD6m
   ```

2. **Go to Media Collection**
   - Click "Media" in the sidebar
   - Click "Create New"

3. **Upload a Video**
   - Choose any MP4 file
   - Fill in the alt text
   - Click "Create"

4. **Watch the Console**
   - Open a new terminal
   - Run: `docker logs portfolio-payload -f`
   - You should see:
   ```
   🎬 Starting video optimization for: your-video.mp4
      📊 Original: 1920x1080
      🔄 Processing low (854x480)...
      ✅ low: 2.34 MB (90.7% reduction)
      🔄 Processing medium (1280x720)...
      ✅ medium: 5.94 MB (76.5% reduction)
      🔄 Processing high (1920x1080)...
      ✅ high: 11.24 MB (55.5% reduction)
      📸 Generating thumbnail...
      ✅ Thumbnail: 85.43 KB

   ✨ Video optimization complete! Created 4 variants

   [Media] Uploading 4 video variants...
   [Media] ✓ Uploaded video low: your-video-low.mp4
   [Media] ✓ Uploaded video medium: your-video-medium.mp4
   [Media] ✓ Uploaded video high: your-video-high.mp4
   [Media] ✓ Uploaded video thumbnail: your-video-thumb.jpg
   ```

5. **Verify in Database**
   ```bash
   curl -s "http://localhost:3006/api/media?where[filename][equals]=your-video.mp4" \
     | jq '.docs[0].video_sizes'
   ```

   Expected output:
   ```json
   {
     "low": {
       "filename": "your-video-low.mp4",
       "url": "/media/your-video-low.mp4",
       "width": 854,
       "height": 480,
       "bitrate": "500k",
       "filesize": 2458906,
       "mimeType": "video/mp4"
     },
     "medium": {...},
     "high": {...},
     "thumbnail": {...}
   }
   ```

6. **Verify CDN Upload**
   ```bash
   # Check if files exist on CDN
   curl -I https://oculair.b-cdn.net/media/your-video-low.mp4
   curl -I https://oculair.b-cdn.net/media/your-video-medium.mp4
   curl -I https://oculair.b-cdn.net/media/your-video-high.mp4
   curl -I https://oculair.b-cdn.net/media/your-video-thumb.jpg
   ```

---

### Option 2: Via API

```bash
# 1. Authenticate
TOKEN=$(curl -s -X POST http://localhost:3006/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emanuvaderland@gmail.com","password":"7beEXKPk93xSD6m"}' \
  | jq -r .token)

# 2. Upload video
curl -X POST http://localhost:3006/api/media \
  -H "Authorization: JWT $TOKEN" \
  -F "file=@/path/to/your/video.mp4" \
  -F "alt=Test Video"

# 3. Check the document
curl -s "http://localhost:3006/api/media?where[filename][equals]=video.mp4" \
  | jq '.docs[0].video_sizes'
```

---

### Option 3: Re-optimize Existing Video

The existing `title.mp4` (25 MB) was uploaded before video optimization was added.

To re-optimize it:

1. **Download it first** (backup)
   ```bash
   curl "http://localhost:3006/media/title.mp4" -o title-backup.mp4
   ```

2. **Delete and re-upload via CMS admin**
   - Go to Media → find title.mp4 → Delete
   - Upload the same file again
   - Video optimization will run automatically

3. **Or use a script** (see below)

---

## Automated Test Script

```bash
#!/bin/bash
# test-video-optimization.sh

cd /opt/stacks/implement-payload-cms-011CUxhkCJAiefDu2xtFQKcp

echo "🎬 Testing Video Optimization..."
echo "================================"

# Get auth token
TOKEN=$(curl -s -X POST http://localhost:3006/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emanuvaderland@gmail.com","password":"7beEXKPk93xSD6m"}' \
  | jq -r .token)

if [ "$TOKEN" = "null" ]; then
  echo "❌ Authentication failed"
  exit 1
fi

echo "✅ Authenticated"

# Create a small test video (10 seconds, 480p)
echo "📹 Creating test video..."
docker exec portfolio-payload ffmpeg -f lavfi -i testsrc=duration=10:size=854x480:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=10 \
  -pix_fmt yuv420p -c:v libx264 -preset fast \
  /app/media/test-video-upload.mp4 -y 2>&1 | grep -i "video\|audio\|Output"

# Upload via API
echo "📤 Uploading test video..."
RESPONSE=$(curl -s -X POST http://localhost:3006/api/media \
  -H "Authorization: JWT $TOKEN" \
  -F "file=@/app/media/test-video-upload.mp4" \
  -F "alt=Test Video Optimization")

VIDEO_ID=$(echo $RESPONSE | jq -r '.doc.id')

echo "✅ Video uploaded: ID=$VIDEO_ID"

# Wait for processing
echo "⏳ Waiting for video optimization (30 seconds)..."
sleep 30

# Check results
echo "📊 Checking results..."
curl -s "http://localhost:3006/api/media/$VIDEO_ID" | jq '{
  filename: .filename,
  original_size: (.filesize / 1024 / 1024 | round),
  variants: (.video_sizes | keys),
  low_size: (.video_sizes.low.filesize / 1024 / 1024 | round),
  medium_size: (.video_sizes.medium.filesize / 1024 / 1024 | round),
  high_size: (.video_sizes.high.filesize / 1024 / 1024 | round),
  thumbnail_size: (.video_sizes.thumbnail.filesize / 1024 | round)
}'

echo ""
echo "✅ Test complete!"
echo "Check docker logs: docker logs portfolio-payload --tail=100"
```

Save as `test-video-optimization.sh` and run:
```bash
chmod +x test-video-optimization.sh
./test-video-optimization.sh
```

---

## Expected Results

### File System
```
/app/media/
├── test-video-upload.mp4         # Original
├── test-video-upload-low.mp4     # Mobile variant
├── test-video-upload-medium.mp4  # Tablet variant
├── test-video-upload-high.mp4    # Desktop variant
└── test-video-upload-thumb.jpg   # Thumbnail
```

### Database Document
```json
{
  "filename": "test-video-upload.mp4",
  "mimeType": "video/mp4",
  "filesize": 5242880,
  "video_sizes": {
    "low": {...},
    "medium": {...},
    "high": {...},
    "thumbnail": {...}
  },
  "cdn_synced": true,
  "cdn_url": "https://oculair.b-cdn.net/media/test-video-upload.mp4"
}
```

### CDN Files
All 5 files uploaded to:
- `https://oculair.b-cdn.net/media/test-video-upload.mp4`
- `https://oculair.b-cdn.net/media/test-video-upload-low.mp4`
- `https://oculair.b-cdn.net/media/test-video-upload-medium.mp4`
- `https://oculair.b-cdn.net/media/test-video-upload-high.mp4`
- `https://oculair.b-cdn.net/media/test-video-upload-thumb.jpg`

---

## Troubleshooting

### No video_sizes field
- Check logs: `docker logs portfolio-payload --tail=100`
- Verify FFmpeg: `docker exec portfolio-payload ffmpeg -version`
- Check hook is applied: Look for "🎬 Starting video optimization" in logs

### Optimization fails
- Check available disk space
- Check FFmpeg errors in logs
- Ensure video format is supported (MP4, MOV, AVI, WebM)

### CDN upload fails
- Check BunnyCDN credentials in .env
- Check `cdn_sync_error` field in document
- Verify network connectivity to BunnyCDN

---

## Manual Verification Steps

```bash
# 1. Check FFmpeg is installed
docker exec portfolio-payload ffmpeg -version

# 2. Check CMS is running
curl -s http://localhost:3006/api/media?limit=1 | jq .totalDocs

# 3. Watch logs in real-time
docker logs portfolio-payload -f

# 4. List all videos
curl -s http://localhost:3006/api/media | jq '.docs[] | select(.mimeType | contains("video")) | {filename, has_variants: has("video_sizes")}'

# 5. Check CDN sync status
curl -s http://localhost:3006/api/media | jq '.docs[] | select(.mimeType | contains("video")) | {filename, cdn_synced, variants_count: (.video_sizes | keys | length)}'
```

---

**Status**: ✅ Ready to test  
**Next Step**: Upload a video via CMS admin and watch the magic happen! 🎥
