import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './OptimizedImage.css';

export const OptimizedImage = ({ src, alt, className, width, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setError(true);
    };
  }, [src]);

  return (
    <div 
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
        {isLoaded && !error && (
          <motion.img
            src={imageSrc}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
            decoding="async"
          />
        )}
      </AnimatePresence>
    </div>
  );
};