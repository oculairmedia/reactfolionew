import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSrcSet } from '../../utils/cdnHelper';
import './OptimizedImage.css';

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  sizes = "100vw"
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
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
  }, []);

  // Generate srcSet for responsive images (only for CDN images)
  const srcSet = src?.includes('b-cdn.net') ? generateSrcSet(src) : undefined;

  return (
    <div
      ref={imgRef}
      className={`optimized-image-container ${className || ''}`}
      style={{ width, height }}
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
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            onError={() => setError(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
            decoding="async"
          />
        )}
      </AnimatePresence>
    </div>
  );
};