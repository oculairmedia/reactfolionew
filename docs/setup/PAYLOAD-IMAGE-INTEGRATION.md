# Payload CMS Image Integration Guide

## Overview

Your site now uses **Payload CMS pre-optimized images** served via BunnyCDN instead of on-the-fly transformation. This provides:

- ✅ Faster load times (pre-generated vs on-demand)
- ✅ 6 optimized sizes per image
- ✅ WebP format (50-70% smaller than JPEG)
- ✅ Automatic CDN sync
- ✅ Better SEO with proper dimensions

## New Components

### 1. PayloadOptimizedImage (Recommended)

Use this for single images with responsive srcSet support.

```jsx
import { PayloadOptimizedImage } from './components/OptimizedImage/PayloadOptimizedImage';

// With Payload media object
<PayloadOptimizedImage
  media={portfolioItem.featuredImage}  // Payload media object
  alt="Coffee shop interior"
  size="medium"                        // thumbnail, small, medium, large, og
  responsive={true}                    // Enable srcSet
  lazyLoad={true}                      // Enable lazy loading
  className="portfolio-image"
/>

// With legacy CDN URL (auto-converts)
<PayloadOptimizedImage
  media="https://oculair.b-cdn.net/media/image.jpg"
  alt="Legacy image"
/>
```

### 2. PayloadPictureImage

Use this for maximum browser compatibility (WebP with JPEG fallback).

```jsx
import { PayloadPictureImage } from './components/PictureImage/PayloadPictureImage';

<PayloadPictureImage
  media={project.thumbnail}
  alt="Project thumbnail"
  size="card"
  loading="lazy"
/>
```

## Helper Functions

### Get specific size URL

```js
import { getPayloadImageUrl, PAYLOAD_SIZE_PRESETS } from './utils/payloadImageHelper';

// Get medium size
const mediumUrl = getPayloadImageUrl(media, 'medium');

// Get thumbnail
const thumbUrl = getPayloadImageUrl(media, PAYLOAD_SIZE_PRESETS.thumbnail);

// Get original
const originalUrl = getPayloadImageUrl(media, 'original');
```

### Generate responsive srcSet

```js
import { generatePayloadSrcSet } from './utils/payloadImageHelper';

const srcSet = generatePayloadSrcSet(media, ['small', 'medium', 'large']);
// Returns: "url1 600w, url2 1024w, url3 1920w"
```

### Get OG image for social sharing

```js
import { getOgImageUrl } from './utils/payloadImageHelper';

const ogImage = getOgImageUrl(media);
// Returns 1200x630 JPEG optimized for social media
```

## Available Sizes

Payload generates 6 versions of each uploaded image:

| Size | Dimensions | Format | Quality | Use Case |
|------|------------|--------|---------|----------|
| `thumbnail` | 300x300 | WebP | 80% | Avatars, small icons |
| `small` | 600px wide | WebP | 85% | Cards, mobile |
| `medium` | 1024px wide | WebP | 85% | Content images |
| `large` | 1920px wide | WebP | 90% | Hero images |
| `og` | 1200x630 | JPEG | 85% | Social sharing |
| `original` | Full res | Original | 90% | Lightbox, downloads |

## Migration Example

### Before (Old CDN Helper)

```jsx
import { OptimizedImage } from './components/OptimizedImage/OptimizedImage';
import { optimizeImage } from './utils/cdnHelper';

// Manual URL construction
const imageUrl = optimizeImage(
  'https://oculair.b-cdn.net/cache/images/project.jpg',
  { width: 800, quality: 85, format: 'webp' }
);

<OptimizedImage
  src={imageUrl}
  alt="Project"
/>
```

### After (Payload CMS)

```jsx
import { PayloadOptimizedImage } from './components/OptimizedImage/PayloadOptimizedImage';

// Fetch from Payload API
const project = await fetch('https://cms2.emmanuelu.com/api/projects/123')
  .then(r => r.json());

// Use media object directly
<PayloadOptimizedImage
  media={project.featuredImage}  // Contains all sizes
  alt={project.title}
  size="medium"                  // Automatically uses 1024px WebP
  responsive={true}              // Generates srcSet with small/medium/large
/>
```

## Real-World Example: Portfolio Grid

```jsx
import { PayloadOptimizedImage } from './components/OptimizedImage/PayloadOptimizedImage';

const PortfolioGrid = ({ projects }) => {
  return (
    <div className="grid">
      {projects.map(project => (
        <div key={project.id} className="portfolio-card">
          <PayloadOptimizedImage
            media={project.featuredImage}
            alt={project.title}
            size="small"              // 600px WebP for card
            responsive={true}
            lazyLoad={true}
            className="card-image"
          />
          <h3>{project.title}</h3>
        </div>
      ))}
    </div>
  );
};
```

## API Integration

### Fetching Projects with Media

```js
// Fetch project with populated media
const response = await fetch(
  'https://cms2.emmanuelu.com/api/projects?depth=1'
);
const data = await response.json();

// data.docs[0].featuredImage contains:
{
  id: "abc123",
  filename: "project-image.jpg",
  alt: "Project showcase",
  width: 2400,
  height: 1600,
  mimeType: "image/jpeg",
  filesize: 245000,
  sizes: {
    thumbnail: {
      filename: "project-image-300x300.webp",
      width: 300,
      height: 300,
      mimeType: "image/webp",
      filesize: 12000,
      url: "/media/project-image-300x300.webp"
    },
    small: { /* ... */ },
    medium: { /* ... */ },
    large: { /* ... */ },
    og: { /* ... */ }
  },
  url: "/media/project-image.jpg",
  cdn_url: "https://oculair.b-cdn.net/media/project-image.jpg",
  cdn_synced: true
}
```

## Performance Benefits

### Example: Portfolio Image

**Old Method (On-the-fly CDN transformation):**
- Original: `project.jpg` (500 KB)
- Mobile loads: 500 KB (CDN transforms on-demand)
- Cold cache = slow first load

**New Method (Payload pre-optimized):**
- Original: `project.jpg` (500 KB) 
- Mobile loads: `project-300x300.webp` (15 KB) ✨
- Pre-generated = instant load
- **97% bandwidth savings!**

## Next Steps

1. ✅ Update your components to use `PayloadOptimizedImage`
2. ✅ Fetch projects/portfolio from Payload API
3. ✅ Test responsive images on mobile
4. ✅ Monitor CDN bandwidth savings in BunnyCDN dashboard

## Support

- Payload CMS Admin: https://cms2.emmanuelu.com/admin
- API Docs: https://cms2.emmanuelu.com/api/docs
- Media Collection: https://cms2.emmanuelu.com/api/media

