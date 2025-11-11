#!/bin/bash
set -e

echo "🎬 Re-uploading Videos for Optimization"
echo "========================================"
echo ""

# Authenticate
echo "🔐 Authenticating..."
TOKEN=$(curl -s -X POST http://localhost:3006/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emanuvaderland@gmail.com","password":"7beEXKPk93xSD6m"}' \
  | jq -r .token)

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed"
  exit 1
fi
echo "✅ Authenticated"
echo ""

# Get current video
echo "📋 Fetching current video info..."
VIDEO_INFO=$(curl -s "http://localhost:3006/api/media?where[filename][equals]=title.mp4")
VIDEO_ID=$(echo "$VIDEO_INFO" | jq -r '.docs[0].id')
VIDEO_ALT=$(echo "$VIDEO_INFO" | jq -r '.docs[0].alt')
VIDEO_SIZE=$(echo "$VIDEO_INFO" | jq -r '.docs[0].filesize')

echo "   ID: $VIDEO_ID"
echo "   Alt: $VIDEO_ALT"
echo "   Size: $(echo "scale=2; $VIDEO_SIZE / 1024 / 1024" | bc) MB"
echo ""

# Download the video from CDN
echo "📥 Downloading video from CDN..."
curl -s "https://oculair.b-cdn.net/media/title.mp4" -o /tmp/title-backup.mp4
DOWNLOADED_SIZE=$(stat -f%z /tmp/title-backup.mp4 2>/dev/null || stat -c%s /tmp/title-backup.mp4 2>/dev/null)
echo "   Downloaded: $(echo "scale=2; $DOWNLOADED_SIZE / 1024 / 1024" | bc) MB"
echo ""

# Delete old video from CMS
echo "🗑️  Deleting old video from CMS..."
DELETE_RESULT=$(curl -s -X DELETE "http://localhost:3006/api/media/$VIDEO_ID" \
  -H "Authorization: JWT $TOKEN")

if echo "$DELETE_RESULT" | jq -e '.id' > /dev/null 2>&1; then
  echo "✅ Old video deleted"
else
  echo "⚠️  Delete may have failed, continuing..."
fi
echo ""

# Wait a moment
sleep 2

# Re-upload the video
echo "📤 Re-uploading video with optimization..."
echo "   (This will take a while - creating 4 optimized variants...)"
echo ""

# Start log monitoring in background
docker logs portfolio-payload -f 2>&1 | grep --line-buffered -E "🎬|📊|🔄|✅|✨|Media.*Uploaded" &
LOG_PID=$!

# Upload
UPLOAD_RESULT=$(curl -s -X POST "http://localhost:3006/api/media" \
  -H "Authorization: JWT $TOKEN" \
  -F "file=@/tmp/title-backup.mp4" \
  -F "alt=$VIDEO_ALT")

# Stop log monitoring
sleep 5
kill $LOG_PID 2>/dev/null || true

echo ""
NEW_VIDEO_ID=$(echo "$UPLOAD_RESULT" | jq -r '.doc.id')

if [ "$NEW_VIDEO_ID" = "null" ] || [ -z "$NEW_VIDEO_ID" ]; then
  echo "❌ Upload failed!"
  echo "$UPLOAD_RESULT" | jq '.'
  exit 1
fi

echo "✅ Video uploaded! New ID: $NEW_VIDEO_ID"
echo ""

# Wait for optimization to complete
echo "⏳ Waiting for optimization to complete (30 seconds)..."
sleep 30

# Fetch results
echo ""
echo "📊 RESULTS"
echo "=========="
curl -s "http://localhost:3006/api/media/$NEW_VIDEO_ID" | jq '{
  filename: .filename,
  original_size_mb: (.filesize / 1024 / 1024 * 100 | round / 100),
  has_variants: has("video_sizes"),
  variants_created: (if .video_sizes then (.video_sizes | keys | length) else 0 end),
  variant_details: (if .video_sizes then {
    low: {
      size_mb: (.video_sizes.low.filesize / 1024 / 1024 * 100 | round / 100),
      reduction: ((1 - .video_sizes.low.filesize / .filesize) * 100 | round)
    },
    medium: {
      size_mb: (.video_sizes.medium.filesize / 1024 / 1024 * 100 | round / 100),
      reduction: ((1 - .video_sizes.medium.filesize / .filesize) * 100 | round)
    },
    high: {
      size_mb: (.video_sizes.high.filesize / 1024 / 1024 * 100 | round / 100),
      reduction: ((1 - .video_sizes.high.filesize / .filesize) * 100 | round)
    },
    thumbnail: {
      size_kb: (.video_sizes.thumbnail.filesize / 1024 * 100 | round / 100)
    }
  } else null end),
  cdn_synced: .cdn_synced,
  cdn_url: .cdn_url
}'

echo ""
echo "✅ Re-optimization complete!"
echo ""
echo "📁 Files on CDN:"
echo "   - https://oculair.b-cdn.net/media/title.mp4 (original)"
echo "   - https://oculair.b-cdn.net/media/title-low.mp4 (mobile)"
echo "   - https://oculair.b-cdn.net/media/title-medium.mp4 (tablet)"
echo "   - https://oculair.b-cdn.net/media/title-high.mp4 (desktop)"
echo "   - https://oculair.b-cdn.net/media/title-thumb.jpg (poster)"
echo ""
echo "🎉 Done! Check logs: docker logs portfolio-payload --tail=100"
