#!/bin/bash

# Script to fix Merchant Ale House broken image URLs

# Admin credentials
ADMIN_EMAIL="emanuvaderland@gmail.com"
ADMIN_PASSWORD="7beEXKPk93xSD6m"

echo "🔧 Fixing Merchant Ale House gallery images..."

CMS_URL="https://cms2.emmanuelu.com"
PROJECT_ID="merchant-ale-house"

echo "Logging in to CMS..."

# Login to get JWT token
LOGIN_RESPONSE=$(curl -s -X POST "$CMS_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Please check your credentials."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"

# Create the fixed gallery JSON
cat > /tmp/merchant-gallery-fixed.json << 'EOF'
{
  "gallery": [
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_merchant-ale-house/the-merchant-ale-house-2.jpg",
      "caption": "Brand identity refresh",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_merchant-ale-house/the-merchant-ale-house-5.jpg",
      "caption": "Logo design details",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_merchant-ale-house/the-merchant-ale-house-6.jpg",
      "caption": "Brand application",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_merchant-ale-house/the-merchant-ale-house-7.jpg",
      "caption": "Merchandise design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_merchant-ale-house/the-merchant-ale-house-12.jpg",
      "caption": "Menu design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_merchant-ale-house/the-merchant-ale-house-13.jpg",
      "caption": "Signage design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_merchant-ale-house/the-merchant-ale-house-14.jpg",
      "caption": "Brand collateral",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_merchant-ale-house/the-merchant-ale-house-15.jpg",
      "caption": "Brand implementation",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_merchant-ale-house/the-merchant-ale-house-16.jpg",
      "caption": "Final deliverables",
      "width": "half"
    }
  ]
}
EOF

echo "Updating project gallery..."

# Update the project
UPDATE_RESPONSE=$(curl -s -X PATCH "$CMS_URL/api/projects/$PROJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/merchant-gallery-fixed.json)

# Check if update was successful
if echo "$UPDATE_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo ""
  echo "✅ Gallery updated successfully!"
  echo ""
  echo "📸 Updated gallery with 9 working images:"
  echo "$UPDATE_RESPONSE" | jq -r '.gallery[] | "  ✓ " + .caption'
  echo ""
  echo "🎉 Done! All images fixed."
  echo ""
  echo "Verify at: https://emmanuelu.com/projects/merchant-ale-house"
else
  echo "❌ Update failed."
  echo "Response: $UPDATE_RESPONSE"
  exit 1
fi

# Cleanup
rm -f /tmp/merchant-gallery-fixed.json

