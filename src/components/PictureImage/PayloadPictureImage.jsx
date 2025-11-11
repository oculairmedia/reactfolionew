import React from 'react';
import { generatePayloadPictureElement } from '../../utils/payloadImageHelper';

/**
 * Picture component using Payload CMS pre-optimized images
 * Generates WebP sources with JPEG fallback using Payload's sizes
 * 
 * Props:
 * - media: Payload media object
 * - alt: Alt text (fallback to media.alt)
 * - size: Preferred size name (default: 'medium')
 * - className: CSS classes
 * - loading: 'lazy' or 'eager'
 */
export const PayloadPictureImage = ({
  media,
  alt,
  size = 'medium',
  className = '',
  loading = 'lazy'
}) => {
  // Handle string URLs (legacy support)
  if (typeof media === 'string') {
    return (
      <img 
        src={media} 
        alt={alt || ''} 
        className={className} 
        loading={loading} 
      />
    );
  }

  if (!media || !media.filename) {
    return null;
  }

  const pictureConfig = generatePayloadPictureElement(media, alt, size);

  if (!pictureConfig) {
    return null;
  }

  return (
    <picture>
      {pictureConfig.sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          type={source.type}
          sizes={source.sizes}
        />
      ))}
      <img
        src={pictureConfig.img.src}
        alt={pictureConfig.img.alt}
        width={pictureConfig.img.width}
        height={pictureConfig.img.height}
        className={className}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
};

export default PayloadPictureImage;
