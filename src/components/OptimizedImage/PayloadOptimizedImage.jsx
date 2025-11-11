import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getPayloadImageUrl, 
  generatePayloadSrcSet, 
  generateSizesAttr,
  PAYLOAD_SIZE_PRESETS 
} from '../../utils/payloadImageHelper';
import './OptimizedImage.css';

/**
 * Optimized Image component using Payload CMS pre-generated sizes
 * 
 * Props:
 * - media: Payload media object (with sizes)
 * - alt: Alt text (fallback to media.alt)
 * - size: Preferred size ('thumbnail', 'small', 'medium', 'large', 'og')
 * - className: Additional CSS classes
 * - responsive: Enable responsive srcSet (default: true)
 * - lazyLoad: Enable lazy loading (default: true)
 * - sizes: Custom sizes attribute
 */
export const PayloadOptimizedImage = ({
  media,
  alt,
  size = 'medium',
  className = '',
  responsive = true,
  lazyLoad = true,
  sizes,
  width,
  height
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazyLoad);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!lazyLoad) return;

    // Use Intersection Observer for true lazy loading
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Load 50px before entering viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad]);

  // Handle string URLs (legacy support)
  if (typeof media === 'string') {
    return (
      <img
        ref={imgRef}
        src={media}
        alt={alt || ''}
        className={className}
        loading={lazyLoad ? 'lazy' : 'eager'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
    );
  }

  // Get the main image URL
  const mainSrc = getPayloadImageUrl(media, size);
  
  // Generate srcSet for responsive images if media has sizes
  const srcSet = responsive && media?.sizes 
    ? generatePayloadSrcSet(media, ['small', 'medium', 'large'])
    : undefined;

  // Generate sizes attribute
  const sizesAttr = sizes || (responsive ? generateSizesAttr() : undefined);

  // Get alt text from media object or prop
  const altText = alt || media?.alt || '';

  // Get dimensions from media object
  const imgWidth = width || media?.width;
  const imgHeight = height || media?.height;

  if (!mainSrc) {
    return (
      <div className={`optimized-image-container ${className}`}>
        <div className="image-error">
          <span>No image available</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`optimized-image-container ${className}`}
      style={{ width: imgWidth, height: imgHeight }}
    >
      <AnimatePresence mode="wait">
        {!isLoaded && !error && (
          <motion.div
            className="image-placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        {error && (
          <motion.div
            className="image-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span>Failed to load image</span>
          </motion.div>
        )}
        {isInView && (
          <motion.img
            src={mainSrc}
            srcSet={srcSet}
            sizes={sizesAttr}
            alt={altText}
            width={imgWidth}
            height={imgHeight}
            onLoad={() => setIsLoaded(true)}
            onError={() => setError(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            loading={lazyLoad ? 'lazy' : 'eager'}
            decoding="async"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayloadOptimizedImage;
