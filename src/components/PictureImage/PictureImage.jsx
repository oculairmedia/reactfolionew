import React from 'react';
import { generatePictureElement } from '../../utils/cdnHelper';

/**
 * Picture component with AVIF/WebP/JPG fallback support
 * Automatically generates optimal format based on browser support
 */
export const PictureImage = ({
  src,
  alt,
  width = 800,
  quality = 85,
  className = '',
  loading = 'lazy'
}) => {
  // If not a CDN URL, just render regular img
  if (!src || !src.includes('b-cdn.net')) {
    return <img src={src} alt={alt} className={className} loading={loading} />;
  }

  const pictureConfig = generatePictureElement(src, alt, width, quality);

  return (
    <picture>
      {pictureConfig.sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          type={source.type}
        />
      ))}
      <img
        src={pictureConfig.img.src}
        alt={pictureConfig.img.alt}
        className={className}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
};

export default PictureImage;
