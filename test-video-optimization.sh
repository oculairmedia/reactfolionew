#!/bin/bash
echo "🎬 Testing Video Optimization..."
echo "================================"

# Get auth token
TOKEN=$(curl -s -X POST http://localhost:3006/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"emanuvaderland@gmail.com","password":"7beEXKPk93xSD6m"}' \
  | jq -r .token)

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Authentication failed"
  exit 1
fi

echo "✅ Authenticated"

# Create a small test video (5 seconds, 480p)
echo "📹 Creating test video..."
docker exec portfolio-payload ffmpeg -f lavfi -i testsrc=duration=5:size=854x480:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=5 \
  -pix_fmt yuv420p -c:v libx264 -preset ultrafast -crf 28 \
  /app/media/test-video-temp.mp4 -y 2>&1 | tail -5

if [ $? -ne 0 ]; then
  echo "❌ Failed to create test video"
  exit 1
fi

echo "✅ Test video created"

# Upload via API
echo "📤 Uploading test video..."
RESPONSE=$(curl -s -X POST http://localhost:3006/api/media \
  -H "Authorization: JWT $TOKEN" \
  -F "file=@media/test-video-temp.mp4;type=video/mp4" \
  -F "alt=Test Video Optimization" 2>&1)

VIDEO_ID=$(echo "$RESPONSE" | jq -r '.doc.id' 2>/dev/null)

if [ "$VIDEO_ID" = "null" ] || [ -z "$VIDEO_ID" ]; then
  echo "❌ Upload failed"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

echo "✅ Video uploaded: ID=$VIDEO_ID"
echo "📝 Filename: $(echo "$RESPONSE" | jq -r '.doc.filename')"

# Wait for processing
echo "⏳ Waiting for video optimization (20 seconds)..."
echo "   (Watch logs: docker logs portfolio-payload -f)"
sleep 20

# Check results
echo ""
echo "📊 Checking results..."
curl -s "http://localhost:3006/api/media/$VIDEO_ID" | jq '{
  filename: .filename,
  original_size_mb: (.filesize / 1024 / 1024 * 100 | round / 100),
  has_video_sizes: has("video_sizes"),
  variants: (if .video_sizes then (.video_sizes | keys) else [] end),
  sizes: (if .video_sizes then {
    low_mb: (.video_sizes.low.filesize / 1024 / 1024 * 100 | round / 100),
    medium_mb: (.video_sizes.medium.filesize / 1024 / 1024 * 100 | round / 100),
    high_mb: (.video_sizes.high.filesize / 1024 / 1024 * 100 | round / 100),
    thumbnail_kb: (.video_sizes.thumbnail.filesize / 1024 * 100 | round / 100)
  } else null end),
  cdn_synced: .cdn_synced
}'

echo ""
echo "✅ Test complete!"
echo ""
echo "Check logs for optimization details:"
echo "  docker logs portfolio-payload --tail=50 | grep -A 20 '🎬'"
