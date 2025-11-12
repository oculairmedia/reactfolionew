# Frontend Integration Guide - Payload CMS Assets

## Overview

This guide shows how to use the optimized images and videos from Payload CMS in your React frontend. All assets are automatically optimized and served via BunnyCDN for maximum performance.

## Quick Start

### 1. API Configuration

The frontend is configured to use the public CMS API:

```javascript
// src/utils/payloadApi.js
const API_URL = 'https://cms2.emmanuelu.com/api';
```

For local development, you can override this with an environment variable:

```bash
# .env.local
REACT_APP_API_URL=http://localhost:3006/api
```

### 2. Image Optimization

Every image uploaded to Payload CMS is automatically optimized into 6 sizes:

| Size | Dimensions | Format | Quality | Use Case |
|------|------------|--------|---------|----------|
| `thumbnail` | 300x300 | WebP | 80% | Avatars, small icons |
| `small` | 600px | WebP | 85% | Cards, previews |
| `medium` | 1024px | WebP | 85% | Content images |
| `large` | 1920px | WebP | 90% | Hero images |
| `og` | 1200x630 | JPEG | 85% | Social sharing |
| `original` | Full res | Original | - | Lightbox, downloads |

**Bandwidth Savings: 95%** (24 MB → 1.2 MB)

### 3. Video Optimization

Every video uploaded to Payload CMS is automatically optimized into 4 variants:

| Quality | Resolution | Bitrate | Use Case |
|---------|------------|---------|----------|
| `low` | 480p | 400k | Mobile, slow connections |
| `medium` | 854p | 800k | Tablets |
| `high` | 1280p | 1500k | Desktop 720p |
| `full` | 1920p | 3000k | Desktop 1080p |

Plus a **thumbnail** (JPEG poster image)

**Bandwidth Savings: 85%+** (24 MB → 3.5 MB for mobile)

## Components

### PayloadOptimizedImage

Responsive image component with automatic WebP optimization:

```jsx
import { PayloadOptimizedImage } from './components/OptimizedImage/PayloadOptimizedImage';

// Basic usage
<PayloadOptimizedImage
  media={portfolioItem.featured_image}
  alt="Project thumbnail"
  size="medium"
  responsive={true}
  lazyLoad={true}
/>

// Hero image
<PayloadOptimizedImage
  media={hero.image}
  alt="Hero image"
  size="large"
  responsive={true}
  lazyLoad={false}
/>

// Social sharing
<PayloadOptimizedImage
  media={project.featured_image}
  alt="OG image"
  size="og"
  responsive={false}
/>
```

**Props:**
- `media` (object|string): Payload media object or URL
- `size` (string): 'thumbnail', 'small', 'medium', 'large', 'og', 'original'
- `responsive` (boolean): Generate responsive srcSet
- `lazyLoad` (boolean): Use Intersection Observer for lazy loading
- `alt` (string): Alt text for accessibility
- `className` (string): Additional CSS classes
- `onLoad` (function): Callback when image loads

### PayloadOptimizedVideo

Adaptive video streaming with automatic quality selection:

```jsx
import { PayloadOptimizedVideo } from './components/OptimizedVideo/PayloadOptimizedVideo';

// Auto-quality (recommended)
<PayloadOptimizedVideo
  media={portfolioItem.featured_video}
  quality="auto"
  autoPlay={true}
  loop={true}
  muted={true}
  playsInline={true}
  lazyLoad={true}
/>

// Specific quality
<PayloadOptimizedVideo
  media={video}
  quality="high"
  controls={true}
  lazyLoad={false}
/>
```

**Props:**
- `media` (object): Payload media object with video_sizes
- `quality` (string): 'auto', 'low', 'medium', 'high', 'full', 'original'
- `autoPlay` (boolean): Auto-play video
- `loop` (boolean): Loop video
- `muted` (boolean): Mute audio
- `controls` (boolean): Show video controls
- `playsInline` (boolean): Play inline on mobile
- `lazyLoad` (boolean): Lazy load with Intersection Observer
- `className` (string): Additional CSS classes
- `onLoadedData` (function): Callback when video loads

## Helper Functions

### Image Helpers

```javascript
import { 
  getPayloadImageUrl,
  generatePayloadSrcSet,
  getOgImageUrl,
  getRecommendedSize
} from './utils/payloadImageHelper';

// Get image URL
const url = getPayloadImageUrl(media, 'medium');
// => 'https://oculair.b-cdn.net/media/image-medium.webp'

// Generate responsive srcSet
const srcSet = generatePayloadSrcSet(media, ['small', 'medium', 'large']);
// => 'https://...image-small.webp 600w, https://...image-medium.webp 1024w, https://...image-large.webp 1920w'

// Get OG image for social sharing
const ogImage = getOgImageUrl(media);

// Get recommended size based on viewport
const size = getRecommendedSize(window.innerWidth);
```

### Video Helpers

```javascript
import { 
  getPayloadVideoUrl,
  getVideoThumbnailUrl,
  generateVideoSources,
  getRecommendedVideoQuality,
  isVideo,
  getVideoMetadata
} from './utils/payloadImageHelper';

// Get video URL
const videoUrl = getPayloadVideoUrl(media, 'medium');
// => 'https://oculair.b-cdn.net/media/video-medium.mp4'

// Get video thumbnail
const thumbnail = getVideoThumbnailUrl(media);
// => 'https://oculair.b-cdn.net/media/video-thumb.jpg'

// Generate adaptive sources
const sources = generateVideoSources(media, ['low', 'medium', 'high']);
// => [
//   { src: '...low.mp4', type: 'video/mp4', media: '(max-width: 640px)' },
//   { src: '...medium.mp4', type: 'video/mp4', media: '(max-width: 1024px)' },
//   { src: '...high.mp4', type: 'video/mp4', media: '(min-width: 1025px)' }
// ]

// Check if media is video
if (isVideo(media)) {
  console.log('This is a video');
}

// Get video metadata
const metadata = getVideoMetadata(media);
// => {
//   availableQualities: ['low', 'medium', 'high'],
//   originalWidth: 1920,
//   originalHeight: 1080,
//   hasThumbnail: true,
//   filesize: 25290307,
//   mimeType: 'video/mp4'
// }
```

## API Integration

### Fetching Data

```javascript
import { 
  getPortfolioItems,
  getProjectById,
  getHomeIntro,
  getAboutPage,
  getSiteSettings
} from './utils/payloadApi';

// Get all portfolio items
const portfolio = await getPortfolioItems({ limit: 10, depth: 1 });

// Get single project
const project = await getProjectById('project-id');

// Get globals
const homeIntro = await getHomeIntro();
const aboutPage = await getAboutPage();
const siteSettings = await getSiteSettings();
```

### Data Structure

**Portfolio Item:**
```javascript
{
  id: '12345',
  title: 'Project Title',
  description: 'Project description...',
  featured_image: {
    id: 'img-123',
    filename: 'project.jpg',
    alt: 'Project image',
    sizes: {
      thumbnail: { filename: 'project-thumbnail.webp', width: 300, height: 300, filesize: 45678 },
      small: { filename: 'project-small.webp', width: 600, height: 400, filesize: 89012 },
      medium: { filename: 'project-medium.webp', width: 1024, height: 683, filesize: 234567 },
      large: { filename: 'project-large.webp', width: 1920, height: 1280, filesize: 456789 },
      og: { filename: 'project-og.jpg', width: 1200, height: 630, filesize: 123456 }
    },
    mimeType: 'image/jpeg'
  },
  featured_video: {
    id: 'vid-456',
    filename: 'video.mp4',
    alt: 'Project video',
    video_sizes: {
      low: { filename: 'video-low.mp4', width: 480, height: 480, bitrate: '400k', filesize: 3716910 },
      medium: { filename: 'video-medium.mp4', width: 854, height: 480, bitrate: '800k', filesize: 7500000 },
      high: { filename: 'video-high.mp4', width: 1280, height: 720, bitrate: '1500k', filesize: 15000000 },
      thumbnail: { filename: 'video-thumb.jpg', width: 1280, height: 720, filesize: 63833 }
    },
    mimeType: 'video/mp4'
  },
  category: 'Web Development',
  tags: [{ tag: 'React' }, { tag: 'TypeScript' }],
  year: '2024',
  client: 'Acme Inc',
  url: 'https://project.com'
}
```

## Usage Examples

### Portfolio Grid

```jsx
function PortfolioGrid() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getPortfolioItems({ limit: 12 }).then(setItems);
  }, []);

  return (
    <div className="portfolio-grid">
      {items.map(item => (
        <div key={item.id} className="portfolio-card">
          {item.featured_video ? (
            <PayloadOptimizedVideo
              media={item.featured_video}
              quality="auto"
              autoPlay
              loop
              muted
              playsInline
              lazyLoad
            />
          ) : (
            <PayloadOptimizedImage
              media={item.featured_image}
              alt={item.title}
              size="medium"
              responsive
              lazyLoad
            />
          )}
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Project Detail Page

```jsx
function ProjectDetailPage({ projectId }) {
  const [project, setProject] = useState(null);

  useEffect(() => {
    getProjectById(projectId).then(setProject);
  }, [projectId]);

  if (!project) return <LoadingSpinner />;

  return (
    <div className="project-detail">
      {/* Hero Image */}
      <PayloadOptimizedImage
        media={project.featured_image}
        alt={project.title}
        size="large"
        responsive
      />

      {/* Content */}
      <h1>{project.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: project.content }} />

      {/* Gallery */}
      <div className="gallery">
        {project.gallery?.map((media, index) => (
          isVideo(media) ? (
            <PayloadOptimizedVideo
              key={index}
              media={media}
              quality="auto"
              controls
              lazyLoad
            />
          ) : (
            <PayloadOptimizedImage
              key={index}
              media={media}
              alt={`${project.title} - Image ${index + 1}`}
              size="large"
              responsive
              lazyLoad
            />
          )
        ))}
      </div>
    </div>
  );
}
```

### Hero Section with Video Background

```jsx
function HeroSection() {
  const [heroData, setHeroData] = useState(null);

  useEffect(() => {
    getHomeIntro().then(setHeroData);
  }, []);

  return (
    <section className="hero">
      {heroData?.background_video && (
        <PayloadOptimizedVideo
          media={heroData.background_video}
          quality="high"
          autoPlay
          loop
          muted
          playsInline
          className="hero-video"
        />
      )}
      <div className="hero-content">
        <h1>{heroData?.title}</h1>
        <p>{heroData?.subtitle}</p>
      </div>
    </section>
  );
}
```

### Responsive Picture Element

```jsx
function ResponsiveImage({ media, alt }) {
  const srcSet = generatePayloadSrcSet(media, ['small', 'medium', 'large']);
  
  return (
    <picture>
      {/* WebP for modern browsers */}
      <source 
        type="image/webp"
        srcSet={srcSet}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
      />
      
      {/* Fallback */}
      <img 
        src={getPayloadImageUrl(media, 'medium')}
        alt={alt}
        loading="lazy"
      />
    </picture>
  );
}
```

## Performance Optimization

### Lazy Loading

All images and videos support lazy loading with Intersection Observer:

```jsx
<PayloadOptimizedImage
  media={image}
  lazyLoad={true}  // Loads when entering viewport
  alt="Description"
/>
```

### Responsive Images

Automatically serve appropriate size based on viewport:

```jsx
<PayloadOptimizedImage
  media={image}
  responsive={true}  // Generates srcSet
  size="medium"      // Default/fallback size
  alt="Description"
/>
```

### Adaptive Video Quality

Automatically select video quality based on screen size:

```jsx
<PayloadOptimizedVideo
  media={video}
  quality="auto"  // 480p mobile, 854p tablet, 1280p desktop
  lazyLoad={true}
/>
```

### Preloading Critical Assets

For above-the-fold content:

```jsx
// Hero image - no lazy load
<PayloadOptimizedImage
  media={hero.image}
  lazyLoad={false}
  size="large"
  responsive
/>

// Hero video - high priority
<PayloadOptimizedVideo
  media={hero.video}
  quality="high"
  lazyLoad={false}
  autoPlay
  muted
/>
```

## CDN Configuration

All assets are served from BunnyCDN:

```javascript
// Base URL
const CDN_BASE_URL = 'https://oculair.b-cdn.net/media';

// Image URL structure
// https://oculair.b-cdn.net/media/filename-medium.webp

// Video URL structure
// https://oculair.b-cdn.net/media/filename-low.mp4
```

## Browser Support

- **WebP Images**: Fallback to JPEG for older browsers
- **Video Formats**: MP4/H.264 (universal support)
- **Responsive Images**: srcSet/sizes (polyfill available)
- **Lazy Loading**: Intersection Observer (polyfill available)

## Troubleshooting

### Images Not Loading

1. Check media object structure:
```javascript
console.log('Media object:', media);
console.log('Has sizes:', !!media?.sizes);
```

2. Verify CDN URL:
```javascript
const url = getPayloadImageUrl(media, 'medium');
console.log('Image URL:', url);
```

3. Check network tab for 404s

### Videos Not Playing

1. Check video object:
```javascript
console.log('Is video:', isVideo(media));
console.log('Has video_sizes:', !!media?.video_sizes);
```

2. Check available qualities:
```javascript
const metadata = getVideoMetadata(media);
console.log('Available qualities:', metadata.availableQualities);
```

3. Browser autoplay restrictions:
   - Videos must be muted to autoplay
   - Use `muted={true}` prop

### Performance Issues

1. Enable lazy loading:
```jsx
lazyLoad={true}
```

2. Use appropriate sizes:
   - Don't use 'large' for thumbnails
   - Use 'small' for cards
   - Use 'medium' for content

3. Monitor bandwidth:
```javascript
// Check image size
const url = getPayloadImageUrl(media, 'medium');
const response = await fetch(url);
console.log('Size:', response.headers.get('content-length'));
```

## Migration from Legacy URLs

If you have old CDN URLs:

```javascript
import { convertLegacyCdnUrl } from './utils/payloadImageHelper';

// Convert old URL to media object
const oldUrl = 'https://oculair.b-cdn.net/old-image.jpg';
const media = convertLegacyCdnUrl(oldUrl);

// Now use with components
<PayloadOptimizedImage media={media} alt="Image" />
```

## Next Steps

1. Update all image references to use `PayloadOptimizedImage`
2. Update video references to use `PayloadOptimizedVideo`
3. Remove hardcoded CDN URLs
4. Test on various devices/browsers
5. Monitor performance with Lighthouse
6. Enable service worker caching for assets

## Resources

- [Payload CMS Docs](https://payloadcms.com/docs)
- [BunnyCDN Docs](https://docs.bunny.net/)
- [WebP Optimization](https://developers.google.com/speed/webp)
- [Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Video Optimization](https://web.dev/fast-playback-with-preload/)

---

**Status**: Production Ready  
**Last Updated**: November 11, 2025  
**Performance**: 85-95% bandwidth reduction
