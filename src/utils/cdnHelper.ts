import type {
  ImageOptimizationOptions,
  SrcSetOptions,
  BreakpointConfig,
  PictureElementConfig,
  ImagePreset,
} from '../types';

export const optimizeImage = (url: string, options: ImageOptimizationOptions = {}): string => {
  const {
    width = null,
    quality = 85,
    format = 'avif',
    height = null
  } = options;

  if (!url || !url.includes('b-cdn.net')) {
    return url;
  }

  const params = new URLSearchParams();

  if (width) params.append('width', String(width));
  if (height) params.append('height', String(height));
  if (quality) params.append('quality', String(quality));
  if (format) params.append('format', format);

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

export const generateSrcSet = (
  url: string,
  widths: number[] = [400, 800, 1200, 1600],
  options: SrcSetOptions = {}
): string | undefined => {
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

export const generateSizes = (breakpoints: BreakpointConfig = {
  mobile: { maxWidth: 768, size: '100vw' },
  tablet: { maxWidth: 1200, size: '50vw' },
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

export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  thumbnail: { width: 400, quality: 80, format: 'avif' },
  card: { width: 800, quality: 85, format: 'avif' },
  hero: { width: 1920, quality: 85, format: 'avif' },
  fullscreen: { width: 2560, quality: 90, format: 'avif' },
};

export const generatePictureElement = (
  url: string,
  alt: string,
  width: number = 800,
  quality: number = 85
): PictureElementConfig => {
  if (!url || !url.includes('b-cdn.net')) {
    return { img: { src: url, alt } };
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

export const optimizeVideoPoster = (url: string, options: ImageOptimizationOptions = {}): string => {
  return optimizeImage(url, {
    width: 1200,
    quality: 80,
    format: 'avif',
    ...options
  });
};
