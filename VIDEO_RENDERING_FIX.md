# Video Rendering Fix - Portfolio Cards

## Issue
Portfolio cards for video projects were rendering `<img>` tags with static poster images instead of `<video>` tags with animated content.

**Observed HTML:**
```html
<img src="https://oculair.b-cdn.net/media/...webp" 
     alt="Voices Unheard: The Church and Marginalized Communities">
```

**Expected HTML:**
```html
<video autoplay loop muted playsinline>
  <source src="https://oculair.b-cdn.net/api/v1/videos/.../avc" type="video/mp4">
</video>
```

## Root Cause

The `PortfolioItem.js` component had conditional rendering logic that showed a **placeholder image** while waiting for videos to load:

```javascript
{hasVideo ? (
  shouldLoadVideo ? (
    <PayloadOptimizedVideo ... />  // ← Only after scrolling into view
  ) : (
    <PayloadOptimizedImage ... />  // ← Shown first (PROBLEM!)
  )
) : (
  <PayloadOptimizedImage ... />
)}
```

### Why This Failed

1. **Initial Render:** `shouldLoadVideo` starts as `false`
2. **Before Scroll:** Component renders `PayloadOptimizedImage` with `featuredImage`
3. **Problem:** `featuredImage` was set to the video URL, causing image component to fail
4. **Fallback:** Browser showed the `featuredImage` object's webp thumbnails instead

## Solution

### Remove Redundant Lazy Loading

The `PayloadOptimizedVideo` component **already has built-in lazy loading** using `IntersectionObserver`. We don't need a second layer of lazy loading with placeholder images.

**Old Code:**
```javascript
// Unnecessary state
const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

// Unnecessary effect  
useEffect(() => {
  if (isInView && data.isVideo) {
    setTimeout(() => {
      setShouldLoadVideo(true);  // Delayed video loading
    }, 200);
  }
}, [isInView, data.isVideo]);

// Conditional rendering with placeholder
{hasVideo ? (
  shouldLoadVideo ? (
    <PayloadOptimizedVideo />
  ) : (
    <PayloadOptimizedImage />  // ← Placeholder causing issues
  )
) : (
  <PayloadOptimizedImage />
)}
```

**New Code:**
```javascript
// Simplified - no placeholder needed
{hasVideo ? (
  <PayloadOptimizedVideo
    media={featuredVideo}
    lazyLoad={true}  // ← Component handles its own lazy loading
    autoPlay={true}
    loop={true}
    muted={true}
  />
) : (
  <PayloadOptimizedImage
    media={featuredImage}
  />
)}
```

## How Video Lazy Loading Works Now

### Single Layer of Lazy Loading

`PayloadOptimizedVideo` component (lines 72-92):

```javascript
useEffect(() => {
  if (!lazyLoad) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);  // Internal state
          observer.disconnect();
        }
      });
    },
    { rootMargin: '50px' }  // Start loading 50px before visible
  );

  if (videoRef.current) {
    observer.observe(videoRef.current);
  }

  return () => observer.disconnect();
}, [lazyLoad]);
```

### Rendering Flow

1. **Component Mounts:**
   - Renders `<video>` tag immediately
   - `shouldLoad` (internal state) = `false`
   - No `<source>` tags rendered yet

2. **Scrolling Into View:**
   - IntersectionObserver fires
   - Sets internal `shouldLoad` = `true`
   - Renders `<source>` tags with video URL

3. **Video Loads:**
   - Browser requests video
   - Progressive download starts
   - Video begins playing (autoplay)

## Code Changes

### File: `src/components/PortfolioItem.js`

**Removed:**
- `shouldLoadVideo` state
- `useEffect` for delayed video loading
- Conditional placeholder image rendering

**Changed:**
- Simplified video/image conditional to single level
- Videos render immediately with built-in lazy loading
- Fixed `featuredImage` logic to handle video cases

**Before:** ~140 lines  
**After:** ~120 lines (20 lines removed)

## Benefits

### 1. Cleaner Code
- Removed duplicate lazy loading logic
- Single responsibility per component
- Easier to understand and maintain

### 2. Better Performance
- No unnecessary image requests for video items
- Video component handles optimization internally
- No placeholder flashing

### 3. Correct Rendering
- Videos render as `<video>` tags
- Images render as `<img>` tags  
- No mixing of media types

## Verification

### Expected Behavior

**For Video Portfolio Items:**
```html
<div class="po_item">
  <div class="media-container">
    <video class="payload-optimized-video" 
           autoplay loop muted playsinline>
      <source src="https://oculair.b-cdn.net/api/v1/videos/.../avc" 
              type="video/mp4">
    </video>
  </div>
  <div class="content">
    <h3>Project Title</h3>
    ...
  </div>
</div>
```

**For Image Portfolio Items:**
```html
<div class="po_item">
  <div class="media-container">
    <img src="https://oculair.b-cdn.net/cache/images/..." 
         alt="Project Title">
  </div>
  <div class="content">
    <h3>Project Title</h3>
    ...
  </div>
</div>
```

### Testing Checklist

- [x] Videos render `<video>` tags (not `<img>`)
- [x] Videos lazy load when scrolling into view
- [x] Videos autoplay when loaded
- [x] Videos loop continuously
- [x] Images render `<img>` tags
- [x] No console warnings about invalid media
- [x] Build completes successfully

## Technical Details

### Video Component Legacy URL Support

From `PayloadOptimizedVideo.jsx`:

```javascript
// Handle legacy string URLs
const isLegacyUrl = typeof media === 'string';

// Validate that media is a video (unless it's a legacy URL)
if (!isLegacyUrl && (!media || !isVideo(media))) {
  console.warn('[PayloadOptimizedVideo] Invalid video media object:', media);
  return null;
}

// Get video URLs
const videoUrl = isLegacyUrl ? media : getPayloadVideoUrl(media, currentQuality);
```

**This allows us to pass:**
- Payload media objects: `{ mimeType: 'video/mp4', video_sizes: {...} }`
- Legacy URL strings: `'https://oculair.b-cdn.net/api/v1/videos/.../avc'`

Since our portfolio items use string URLs in `data.img`, the component correctly handles them as legacy URLs.

## Deployment

- **Commit:** 8a588b4
- **Build:** Successful ✅
- **Pushed:** ✅
- **Vercel:** Auto-deploying ✅

## Result

✅ **Videos now render as actual video elements**  
✅ **No more static image placeholders**  
✅ **Proper lazy loading with IntersectionObserver**  
✅ **Autoplay and loop working**  
✅ **Performance optimized**  

---

**Fixed:** 2025-11-12  
**Commit:** 8a588b4  
**Status:** ✅ Complete
