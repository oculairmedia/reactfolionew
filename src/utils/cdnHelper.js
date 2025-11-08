/**
 * BunnyCDN Image Optimization Helper
 *
 * Provides utilities to optimize images served from BunnyCDN by adding
 * transformation parameters like width, quality, and format conversion.
 */

/**
 * Optimizes an image URL with BunnyCDN parameters
 * @param {string} url - The original image URL
 * @param {object} options - Optimization options
 * @param {number} options.width - Target width in pixels
 * @param {number} options.quality - JPEG/WebP/AVIF quality (1-100)
 * @param {string} options.format - Target format (avif, webp, jpg, png)
 * @param {number} options.height - Target height in pixels (optional)
 * @returns {string} Optimized image URL
 */
export const optimizeImage = (url, options = {}) => {
  const {
    width = null,
    quality = 85,
    format = 'avif', // AVIF is 30% smaller than WebP
    height = null
  } = options;

  // Only apply optimization to BunnyCDN URLs
  if (!url || !url.includes('b-cdn.net')) {
    return url;
  }

  const params = new URLSearchParams();

  if (width) params.append('width', width);
  if (height) params.append('height', height);
  if (quality) params.append('quality', quality);
  if (format) params.append('format', format);

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

/**
 * Generates responsive image srcSet for different screen sizes
 * @param {string} url - The original image URL
 * @param {number[]} widths - Array of widths to generate
 * @param {object} options - Additional options (quality, format)
 * @returns {string} srcSet string for responsive images
 */
export const generateSrcSet = (url, widths = [400, 800, 1200, 1600], options = {}) => {
  if (!url || !url.includes('b-cdn.net')) {
    return undefined;
  }

  const { quality = 85, format = 'webp' } = options;

  return widths
    .map(w => {
      const optimized = optimizeImage(url, { width: w, quality, format });
      return `${optimized} ${w}w`;
    })
    .join(', ');
};

/**
 * Generates sizes attribute for responsive images
 * @param {object} breakpoints - Breakpoint definitions
 * @returns {string} sizes attribute value
 */
export const generateSizes = (breakpoints = {
  mobile: { maxWidth: 768, size: '100vw' },
  tablet: { maxWidth: 1200, size: '50vw' },
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
 * Presets for common use cases (using AVIF for maximum compression)
 */
export const IMAGE_PRESETS = {
  thumbnail: { width: 400, quality: 80, format: 'avif' },
  card: { width: 800, quality: 85, format: 'avif' },
  hero: { width: 1920, quality: 85, format: 'avif' },
  fullscreen: { width: 2560, quality: 90, format: 'avif' },
};

/**
 * Generates a picture element config with multiple format fallbacks
 * @param {string} url - The original image URL
 * @param {string} alt - Alt text for the image
 * @param {number} width - Target width
 * @param {number} quality - Quality (1-100)
 * @returns {object} Picture element config for React
 */
export const generatePictureElement = (url, alt, width = 800, quality = 85) => {
  if (!url || !url.includes('b-cdn.net')) {
    return { src: url, alt };
  }

  return {
    sources: [
      {
        srcSet: optimizeImage(url, { width, quality, format: 'avif' }),
        type: 'image/avif'
      },
      {
        srcSet: optimizeImage(url, { width, quality, format: 'webp' }),
        type: 'image/webp'
      }
    ],
    img: {
      src: optimizeImage(url, { width, quality, format: 'jpg' }),
      alt
    }
  };
};

/**
 * Optimizes a video poster/thumbnail
 * @param {string} url - Video URL or poster URL
 * @param {object} options - Optimization options
 * @returns {string} Optimized poster URL
 */
export const optimizeVideoPoster = (url, options = {}) => {
  return optimizeImage(url, {
    width: 1200,
    quality: 80,
    format: 'avif',
    ...options
  });
};
