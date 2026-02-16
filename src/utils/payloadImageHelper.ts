import type { PayloadMedia, PayloadMediaSize, BreakpointConfig, PictureSource, VideoSource, VideoMetadata } from '../types';

const CMS_BASE_URL = import.meta.env.VITE_API_URL || 'https://cms2.emmanuelu.com';
const CDN_BASE_URL = `${CMS_BASE_URL}/media`;
const CMS_API_URL = `${CMS_BASE_URL}/api/media`;

export const getPayloadImageUrl = (media: PayloadMedia | string, size: string = 'medium'): string | null => {
  if (typeof media === 'string') {
    if (media.startsWith('http')) {
      return media;
    }
    return `${CDN_BASE_URL}/${media}`;
  }

  if (!media || !media.filename) {
    return null;
  }

  if (size === 'original' || !media.sizes || !media.sizes[size]) {
    return `${CDN_BASE_URL}/${media.filename}`;
  }

  const sizeData = media.sizes[size];
  return `${CDN_BASE_URL}/${sizeData.filename}`;
};

export const generatePayloadSrcSet = (media: PayloadMedia, sizes: string[] = ['small', 'medium', 'large']): string | undefined => {
  if (!media || !media.sizes) {
    return undefined;
  }

  const srcSetParts: string[] = [];

  sizes.forEach(sizeName => {
    const sizeData = media.sizes?.[sizeName];
    if (sizeData && sizeData.filename && sizeData.width) {
      const url = `${CDN_BASE_URL}/${sizeData.filename}`;
      srcSetParts.push(`${url} ${sizeData.width}w`);
    }
  });

  return srcSetParts.length > 0 ? srcSetParts.join(', ') : undefined;
};

export const generateSizesAttr = (breakpoints: BreakpointConfig = {
  mobile: { maxWidth: 768, size: '100vw' },
  tablet: { maxWidth: 1024, size: '50vw' },
  desktop: { size: '800px' }
}): string => {
  const sizeStrings: string[] = [];

  if (breakpoints.mobile?.maxWidth) {
    sizeStrings.push(`(max-width: ${breakpoints.mobile.maxWidth}px) ${breakpoints.mobile.size}`);
  }
  if (breakpoints.tablet?.maxWidth) {
    sizeStrings.push(`(max-width: ${breakpoints.tablet.maxWidth}px) ${breakpoints.tablet.size}`);
  }
  if (breakpoints.desktop) {
    sizeStrings.push(breakpoints.desktop.size);
  }

  return sizeStrings.join(', ');
};

interface PayloadPictureConfig {
  sources: PictureSource[];
  img: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export const generatePayloadPictureElement = (media: PayloadMedia, alt: string, defaultSize: string = 'medium'): PayloadPictureConfig | null => {
  if (!media) {
    return null;
  }

  const sizeData: PayloadMediaSize | PayloadMedia = media.sizes?.[defaultSize] || media;
  const originalUrl = `${CDN_BASE_URL}/${media.filename}`;

  const sources: PictureSource[] = [];
  const responsiveSizes = ['small', 'medium', 'large'];
  const webpSrcSet: string[] = [];

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

  const filename = 'filename' in sizeData ? sizeData.filename : undefined;

  return {
    sources,
    img: {
      src: filename ? `${CDN_BASE_URL}/${filename}` : originalUrl,
      alt: alt || media.alt || '',
      width: sizeData.width,
      height: sizeData.height
    }
  };
};

export const PAYLOAD_SIZE_PRESETS: Record<string, string> = {
  thumbnail: 'thumbnail',
  card: 'small',
  content: 'medium',
  hero: 'large',
  social: 'og',
  original: 'original'
};

export const getRecommendedSize = (viewportWidth: number): string => {
  if (viewportWidth <= 640) return 'small';
  if (viewportWidth <= 1024) return 'medium';
  if (viewportWidth <= 1920) return 'large';
  return 'large';
};

export const fetchPayloadMedia = async (idOrFilename: string): Promise<PayloadMedia | null> => {
  try {
    const response = await fetch(`${CMS_API_URL}/${idOrFilename}`);
    if (response.ok) {
      return await response.json() as PayloadMedia;
    }

    const searchResponse = await fetch(
      `${CMS_API_URL}?where[filename][equals]=${encodeURIComponent(idOrFilename)}&limit=1`
    );
    if (searchResponse.ok) {
      const data = await searchResponse.json() as { docs?: PayloadMedia[] };
      return data.docs?.[0] || null;
    }

    return null;
  } catch {
    return null;
  }
};

export const getOgImageUrl = (media: PayloadMedia): string | null => {
  return getPayloadImageUrl(media, 'og');
};

export const convertLegacyCdnUrl = (oldCdnUrl: string): PayloadMedia => {
  if (!oldCdnUrl || !oldCdnUrl.includes('b-cdn.net')) {
    return { filename: oldCdnUrl, sizes: {} };
  }

  const filename = oldCdnUrl.split('/').pop() || oldCdnUrl;
  return {
    filename,
    url: oldCdnUrl,
    sizes: {}
  };
};

export const getPayloadVideoUrl = (media: PayloadMedia | string, quality: string = 'medium'): string | null => {
  if (typeof media === 'string') {
    if (media.startsWith('http')) {
      return media;
    }
    return `${CDN_BASE_URL}/${media}`;
  }

  if (!media || !media.filename) {
    return null;
  }

  if (quality === 'original' || !media.video_sizes || !media.video_sizes[quality]) {
    return `${CDN_BASE_URL}/${media.filename}`;
  }

  const videoData = media.video_sizes[quality];
  return `${CDN_BASE_URL}/${videoData.filename}`;
};

export const getVideoThumbnailUrl = (media: PayloadMedia): string | null => {
  if (!media || !media.video_sizes || !media.video_sizes.thumbnail) {
    return null;
  }
  return `${CDN_BASE_URL}/${media.video_sizes.thumbnail.filename}`;
};

export const generateVideoSources = (media: PayloadMedia, qualities: string[] = ['low', 'medium', 'high']): VideoSource[] => {
  if (!media || !media.video_sizes) {
    return [];
  }

  const sources: VideoSource[] = [];
  const qualityMediaQueries: Record<string, string> = {
    low: '(max-width: 640px)',
    medium: '(max-width: 1024px)',
    high: '(min-width: 1025px)',
    full: '(min-width: 1921px)'
  };

  qualities.forEach(quality => {
    if (media.video_sizes?.[quality]) {
      sources.push({
        src: getPayloadVideoUrl(media, quality) || '',
        type: 'video/mp4',
        media: qualityMediaQueries[quality]
      });
    }
  });

  return sources;
};

export const getRecommendedVideoQuality = (viewportWidth: number): string => {
  if (viewportWidth <= 640) return 'low';
  if (viewportWidth <= 1024) return 'medium';
  if (viewportWidth <= 1920) return 'high';
  return 'full';
};

export const isVideo = (media: PayloadMedia | string): boolean => {
  if (!media) return false;
  if (typeof media === 'string') return false;
  return media.mimeType?.startsWith('video/') || !!media.video_sizes;
};

export const getVideoMetadata = (media: PayloadMedia): VideoMetadata | null => {
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
