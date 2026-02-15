// Helper to handle video URLs with CORS issues
export const getProxiedVideoUrl = (originalUrl) => {
  // For development, we'll use the direct URL and rely on browser extensions
  // or backend proxy. In production, these should be served from a CDN
  // with proper CORS headers
  
  // If the URL is already a CDN URL without /api/v1/videos path,
  // it might work better
  if (originalUrl.includes('/api/v1/videos/')) {
    // Try using the direct CDN URL format
    const match = originalUrl.match(/videos\/([a-f0-9]+)\/([^\/]+)\/(.+)/);
    if (match) {
      const [, hash, folder, format] = match;
      // Try the direct storage URL format
      const cdnBase = import.meta.env.REACT_APP_CDN_URL || 'https://oculair.b-cdn.net';
      return `${cdnBase}/${hash}/${folder}/${format}.mp4`;
    }
  }
  
  return originalUrl;
};

// Alternative: Use HLS.js for streaming if available
export const isHLSSupported = () => {
  const video = document.createElement('video');
  return Boolean(
    video.canPlayType('application/vnd.apple.mpegurl') ||
    video.canPlayType('audio/mpegurl')
  );
};