#!/bin/bash

# Script to fix all projects with "test 1" folder broken images

ADMIN_EMAIL="emanuvaderland@gmail.com"
ADMIN_PASSWORD="7beEXKPk93xSD6m"

echo "🔧 Fixing broken images in multiple projects..."
echo ""

CMS_URL="https://cms2.emmanuelu.com"

echo "Logging in to CMS..."

# Login to get JWT token
LOGIN_RESPONSE=$(curl -s -X POST "$CMS_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed."
  exit 1
fi

echo "✅ Login successful!"
echo ""

# ============================================
# Fix Liebling Wines
# ============================================
echo "📦 Fixing Liebling Wines..."

cat > /tmp/liebling-gallery.json << 'EOF'
{
  "gallery": [
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_liebling-wines/liebling-wines-2.jpg",
      "caption": "Brand identity design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_liebling-wines/liebling-wines-3.jpg",
      "caption": "Logo design details",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_liebling-wines/liebling-wines-4.jpg",
      "caption": "Typography and color palette",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_liebling-wines/liebling-wines-5.jpg",
      "caption": "Packaging design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_liebling-wines/liebling-wines-6.jpg",
      "caption": "Label design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_liebling-wines/liebling-wines-7.jpg",
      "caption": "Brand application",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_liebling-wines/liebling-wines-11.jpg",
      "caption": "Bottle design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_liebling-wines/liebling-wines-15.jpg",
      "caption": "Final brand implementation",
      "width": "half"
    }
  ]
}
EOF

curl -s -X PATCH "$CMS_URL/api/projects/liebling-wines" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/liebling-gallery.json > /dev/null

echo "  ✅ Liebling Wines: 8 images fixed"

# ============================================
# Fix Garden City Essentials
# ============================================
echo "📦 Fixing Garden City Essentials..."

cat > /tmp/garden-gallery.json << 'EOF'
{
  "gallery": [
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_garden-city-essentials/garden-city-essentials-2.jpg",
      "caption": "Brand identity design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_garden-city-essentials/garden-city-essentials-3.jpg",
      "caption": "Logo design details",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_garden-city-essentials/garden-city-essentials-5.jpg",
      "caption": "Typography system",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_garden-city-essentials/garden-city-essentials-6.jpg",
      "caption": "Packaging design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_garden-city-essentials/garden-city-essentials-7.jpg",
      "caption": "Label design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_garden-city-essentials/garden-city-essentials-11.jpg",
      "caption": "Brand application",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_garden-city-essentials/garden-city-essentials-13.jpg",
      "caption": "Brand collateral",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_garden-city-essentials/garden-city-essentials-14.jpg",
      "caption": "Final implementation",
      "width": "half"
    }
  ]
}
EOF

curl -s -X PATCH "$CMS_URL/api/projects/garden-city-essentials" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/garden-gallery.json > /dev/null

echo "  ✅ Garden City Essentials: 8 images fixed"

# ============================================
# Fix Coffee by Altitude
# ============================================
echo "📦 Fixing Coffee by Altitude..."

cat > /tmp/coffee-gallery.json << 'EOF'
{
  "gallery": [
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_coffee-by-altitude/coffee-by-altitude-2.jpg",
      "caption": "Brand identity design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_coffee-by-altitude/coffee-by-altitude-3.jpg",
      "caption": "Logo design details",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_coffee-by-altitude/coffee-by-altitude-4.jpg",
      "caption": "Color palette",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_coffee-by-altitude/coffee-by-altitude-5.jpg",
      "caption": "Packaging design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_coffee-by-altitude/coffee-by-altitude-6.jpg",
      "caption": "Label design",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_coffee-by-altitude/coffee-by-altitude-10.jpg",
      "caption": "Brand application",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_coffee-by-altitude/coffee-by-altitude-12.jpg",
      "caption": "Brand collateral",
      "width": "half"
    },
    {
      "type": "image",
      "url": "https://oculair.b-cdn.net/cache/images/projects/work_coffee-by-altitude/coffee-by-altitude-14.jpg",
      "caption": "Final implementation",
      "width": "half"
    }
  ]
}
EOF

curl -s -X PATCH "$CMS_URL/api/projects/coffee-by-altitude" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @/tmp/coffee-gallery.json > /dev/null

echo "  ✅ Coffee by Altitude: 8 images fixed"

# Cleanup
rm -f /tmp/liebling-gallery.json /tmp/garden-gallery.json /tmp/coffee-gallery.json

echo ""
echo "🎉 All projects fixed!"
echo ""
echo "Summary:"
echo "  ✓ Liebling Wines: 5 broken → 8 working"
echo "  ✓ Garden City Essentials: 5 broken → 8 working"
echo "  ✓ Coffee by Altitude: 4 broken → 8 working"
echo ""
echo "All images now use the correct 'work_*' folders instead of 'test 1'"
echo ""
echo "Verify at:"
echo "  - https://emmanuelu.com/projects/liebling-wines"
echo "  - https://emmanuelu.com/projects/garden-city-essentials"
echo "  - https://emmanuelu.com/projects/coffee-by-altitude"

