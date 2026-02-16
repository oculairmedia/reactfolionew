import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPayloadImageUrl,
  generatePayloadSrcSet,
  generateSizesAttr,
} from '../../utils/payloadImageHelper';
import type { PayloadMedia } from '../../types';
import './OptimizedImage.css';

interface PayloadOptimizedImageProps {
  media: PayloadMedia | string;
  alt?: string;
  size?: string;
  className?: string;
  responsive?: boolean;
  lazyLoad?: boolean;
  sizes?: string;
  width?: number | string;
  height?: number | string;
  onLoad?: () => void;
}

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
}: PayloadOptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazyLoad);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lazyLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad]);

  if (typeof media === 'string') {
    return (
      <img
        src={media}
        alt={alt || ''}
        className={`${className} ${isLoaded ? 'loaded' : ''}`}
        loading={lazyLoad ? 'lazy' : 'eager'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
      />
    );
  }

  const mainSrc = getPayloadImageUrl(media, size);

  const srcSet = responsive && media?.sizes
    ? generatePayloadSrcSet(media, ['small', 'medium', 'large'])
    : undefined;

  const sizesAttr = sizes || (responsive ? generateSizesAttr() : undefined);
  const altText = alt || media?.alt || '';
  const imgWidth = width;
  const imgHeight = height;

  if (!mainSrc) {
    return (
      <div className={`optimized-image-container ${className}`}>
        <div className="image-error">
          <span>No image available</span>
        </div>
      </div>
    );
  }

  const containerStyle: React.CSSProperties | undefined = (imgWidth && imgHeight)
    ? { width: imgWidth as number, height: imgHeight as number }
    : undefined;

  return (
    <div
      ref={imgRef}
      className={`optimized-image-container ${className}`}
      style={containerStyle}
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
            className={`${className} ${isLoaded ? 'loaded' : ''}`}
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
