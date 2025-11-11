/**
 * Payload CMS + BunnyCDN Image & Video Helper
 * 
 * Uses pre-optimized image and video sizes from Payload CMS served via BunnyCDN.
 * 
 * Images: 6 versions per upload
 * - thumbnail: 300x300 WebP @ 80%
 * - small: 600px WebP @ 85%
 * - medium: 1024px WebP @ 85%
 * - large: 1920px WebP @ 90%
 * - og: 1200x630 JPEG @ 85%
 * - original: full resolution
 * 
 * Videos: 4 variants + thumbnail
 * - low: 480p @ 400k (mobile)
 * - medium: 854p @ 800k (tablet)
 * - high: 1280p @ 1500k (desktop)
 * - full: 1920p @ 3000k (high-res)
 * - thumbnail: JPEG poster image
 */

const CDN_BASE_URL = 'https://oculair.b-cdn.net/media';
const CMS_API_URL = 'https://cms2.emmanuelu.com/api/media';

/**
 * Generate optimized image URL from Payload media object or ID
 * @param {object|string} media - Payload media object or filename
 * @param {string} size - Size name: 'thumbnail', 'small', 'medium', 'large', 'og', or 'original'
 * @returns {string} CDN URL for the optimized image
 */
export const getPayloadImageUrl = (media, size = 'medium') => {
  // Handle direct filename strings
  if (typeof media === 'string') {
    // If it's already a full URL, return as-is
    if (media.startsWith('http')) {
      return media;
    }
    // If it's a filename, construct CDN URL
    return `${CDN_BASE_URL}/${media}`;
  }

  // Handle Payload media object
  if (!media || !media.filename) {
    return null;
  }

  // Return original if no sizes available
  if (size === 'original' || !media.sizes || !media.sizes[size]) {
    return `${CDN_BASE_URL}/${media.filename}`;
  }

  // Return optimized size
  const sizeData = media.sizes[size];
  return `${CDN_BASE_URL}/${sizeData.filename}`;
};

/**
 * Generate srcSet for responsive images using Payload's pre-optimized sizes
 * @param {object} media - Payload media object
 * @param {string[]} sizes - Array of size names to include
 * @returns {string} srcSet string
 */
export const generatePayloadSrcSet = (media, sizes = ['small', 'medium', 'large']) => {
  if (!media || !media.sizes) {
    return undefined;
  }

  const srcSetParts = [];

  sizes.forEach(sizeName => {
    const sizeData = media.sizes[sizeName];
    if (sizeData && sizeData.filename && sizeData.width) {
      const url = `${CDN_BASE_URL}/${sizeData.filename}`;
      srcSetParts.push(`${url} ${sizeData.width}w`);
    }
  });

  return srcSetParts.length > 0 ? srcSetParts.join(', ') : undefined;
};

/**
 * Generate sizes attribute for responsive images
 * @param {object} breakpoints - Breakpoint configuration
 * @returns {string} sizes attribute value
 */
export const generateSizesAttr = (breakpoints = {
  mobile: { maxWidth: 768, size: '100vw' },
  tablet: { maxWidth: 1024, size: '50vw' },
  desktop: { size: '800px' }
}) => {
  const sizeStrings = [];

  if (breakpoints.mobile) {
    sizeStrings.push(`(max-width: ${breakpoints.mobile.maxWidth}px) ${breakpoints.mobile.size}`);
  }
  if (breakpoints.tablet) {
    sizeStrings.push(`(max-width: ${breakpoints.tablet.maxWidth}px) ${breakpoints.tablet.size}`);
  }
  if (breakpoints.desktop) {
    sizeStrings.push(breakpoints.desktop.size);
  }

  return sizeStrings.join(', ');
};

/**
 * Generate picture element configuration with WebP and JPEG fallbacks
 * @param {object} media - Payload media object
 * @param {string} alt - Alt text
 * @param {string} defaultSize - Default size to use
 * @returns {object} Picture element configuration
 */
export const generatePayloadPictureElement = (media, alt, defaultSize = 'medium') => {
  if (!media) {
    return null;
  }

  const sizeData = media.sizes?.[defaultSize] || media;
  const originalUrl = `${CDN_BASE_URL}/${media.filename}`;

  // Generate WebP sources for different sizes
  const sources = [];

  // Add responsive WebP sources
  const responsiveSizes = ['small', 'medium', 'large'];
  const webpSrcSet = [];

  responsiveSizes.forEach(sizeName => {
    const size = media.sizes?.[sizeName];
    if (size && size.filename && size.filename.endsWith('.webp')) {
      const url = `${CDN_BASE_URL}/${size.filename}`;
      webpSrcSet.push(`${url} ${size.width}w`);
    }
  });

  if (webpSrcSet.length > 0) {
    sources.push({
      srcSet: webpSrcSet.join(', '),
      type: 'image/webp',
      sizes: generateSizesAttr()
    });
  }

  // Fallback to original
  return {
    sources,
    img: {
      src: sizeData.filename ? `${CDN_BASE_URL}/${sizeData.filename}` : originalUrl,
      alt: alt || media.alt || '',
      width: sizeData.width,
      height: sizeData.height
    }
  };
};

/**
 * Presets for common use cases
 */
export const PAYLOAD_SIZE_PRESETS = {
  thumbnail: 'thumbnail',    // 300x300 - avatars, small icons
  card: 'small',            // 600px - card images, previews
  content: 'medium',        // 1024px - content images, portfolio items
  hero: 'large',            // 1920px - hero images, full-width
  social: 'og',             // 1200x630 - Open Graph, social sharing
  original: 'original'      // Full resolution - lightbox, downloads
};

/**
 * Get appropriate size based on viewport width
 * @param {number} viewportWidth - Current viewport width
 * @returns {string} Recommended size name
 */
export const getRecommendedSize = (viewportWidth) => {
  if (viewportWidth <= 640) return 'small';
  if (viewportWidth <= 1024) return 'medium';
  if (viewportWidth <= 1920) return 'large';
  return 'large';
};

/**
 * Fetch media object from Payload API by ID or filename
 * @param {string} idOrFilename - Media ID or filename
 * @returns {Promise<object>} Payload media object
 */
export const fetchPayloadMedia = async (idOrFilename) => {
  try {
    // Try by ID first
    const response = await fetch(`${CMS_API_URL}/${idOrFilename}`);
    if (response.ok) {
      return await response.json();
    }

    // Try by filename search
    const searchResponse = await fetch(
      `${CMS_API_URL}?where[filename][equals]=${encodeURIComponent(idOrFilename)}&limit=1`
    );
    if (searchResponse.ok) {
      const data = await searchResponse.json();
      return data.docs?.[0] || null;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch Payload media:', error);
    return null;
  }
};

/**
 * Get OG image URL for social sharing
 * @param {object} media - Payload media object
 * @returns {string} OG image URL
 */
export const getOgImageUrl = (media) => {
  return getPayloadImageUrl(media, 'og');
};

/**
 * Legacy compatibility - converts old CDN URLs to new Payload structure
 * @param {string} oldCdnUrl - Old CDN URL
 * @returns {object} Minimal media object
 */
export const convertLegacyCdnUrl = (oldCdnUrl) => {
  if (!oldCdnUrl || !oldCdnUrl.includes('b-cdn.net')) {
    return { filename: oldCdnUrl, sizes: {} };
  }

  const filename = oldCdnUrl.split('/').pop();
  return {
    filename,
    url: oldCdnUrl,
    sizes: {}
  };
};

/**
 * VIDEO OPTIMIZATION HELPERS
 */

/**
 * Get video URL from Payload media object
 * @param {object} media - Payload media object with video_sizes
 * @param {string} quality - Quality level: 'low', 'medium', 'high', 'full', or 'original'
 * @returns {string} CDN URL for the video
 */
export const getPayloadVideoUrl = (media, quality = 'medium') => {
  // Handle direct filename strings
  if (typeof media === 'string') {
    if (media.startsWith('http')) {
      return media;
    }
    return `${CDN_BASE_URL}/${media}`;
  }

  // Handle Payload media object
  if (!media || !media.filename) {
    return null;
  }

  // Return original if no video_sizes or quality not available
  if (quality === 'original' || !media.video_sizes || !media.video_sizes[quality]) {
    return `${CDN_BASE_URL}/${media.filename}`;
  }

  // Return optimized quality
  const videoData = media.video_sizes[quality];
  return `${CDN_BASE_URL}/${videoData.filename}`;
};

/**
 * Get video thumbnail URL
 * @param {object} media - Payload media object with video_sizes
 * @returns {string} CDN URL for the video thumbnail
 */
export const getVideoThumbnailUrl = (media) => {
  if (!media || !media.video_sizes || !media.video_sizes.thumbnail) {
    return null;
  }
  return `${CDN_BASE_URL}/${media.video_sizes.thumbnail.filename}`;
};

/**
 * Generate video sources for adaptive streaming
 * @param {object} media - Payload media object with video_sizes
 * @param {string[]} qualities - Array of quality levels to include
 * @returns {Array} Array of source objects with src, type, and media query
 */
export const generateVideoSources = (media, qualities = ['low', 'medium', 'high']) => {
  if (!media || !media.video_sizes) {
    return [];
  }

  const sources = [];
  const qualityMediaQueries = {
    low: '(max-width: 640px)',
    medium: '(max-width: 1024px)',
    high: '(min-width: 1025px)',
    full: '(min-width: 1921px)'
  };

  qualities.forEach(quality => {
    if (media.video_sizes[quality]) {
      sources.push({
        src: getPayloadVideoUrl(media, quality),
        type: 'video/mp4',
        media: qualityMediaQueries[quality]
      });
    }
  });

  return sources;
};

/**
 * Get recommended video quality based on viewport width
 * @param {number} viewportWidth - Current viewport width
 * @returns {string} Recommended quality level
 */
export const getRecommendedVideoQuality = (viewportWidth) => {
  if (viewportWidth <= 640) return 'low';
  if (viewportWidth <= 1024) return 'medium';
  if (viewportWidth <= 1920) return 'high';
  return 'full';
};

/**
 * Check if media object is a video
 * @param {object} media - Payload media object
 * @returns {boolean} True if media is a video
 */
export const isVideo = (media) => {
  if (!media) return false;
  return media.mimeType?.startsWith('video/') || !!media.video_sizes;
};

/**
 * Get video metadata
 * @param {object} media - Payload media object with video_sizes
 * @returns {object} Video metadata (duration, dimensions, available qualities)
 */
export const getVideoMetadata = (media) => {
  if (!media || !media.video_sizes) {
    return null;
  }

  const availableQualities = Object.keys(media.video_sizes).filter(key => key !== 'thumbnail');
  const originalQuality = availableQualities.length > 0 ? media.video_sizes[availableQualities[0]] : null;

  return {
    availableQualities,
    originalWidth: originalQuality?.width,
    originalHeight: originalQuality?.height,
    hasThumbnail: !!media.video_sizes.thumbnail,
    filesize: media.filesize,
    mimeType: media.mimeType
  };
};
