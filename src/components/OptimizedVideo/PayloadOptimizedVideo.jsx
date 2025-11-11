import React, { useRef, useEffect, useState } from 'react';
import { 
  getPayloadVideoUrl, 
  getVideoThumbnailUrl, 
  generateVideoSources,
  getRecommendedVideoQuality,
  isVideo 
} from '../../utils/payloadImageHelper';
import './OptimizedVideo.css';

/**
 * Optimized Video Component for Payload CMS
 * 
 * Automatically serves appropriate video quality based on viewport size
 * Uses pre-optimized video variants from Payload CMS:
 * - low: 480p @ 400k (mobile)
 * - medium: 854p @ 800k (tablet)
 * - high: 1280p @ 1500k (desktop)
 * - full: 1920p @ 3000k (high-res)
 * 
 * Features:
 * - Adaptive quality selection based on viewport
 * - Lazy loading with Intersection Observer
 * - Poster image from video thumbnail
 * - Progressive loading states
 * - Fallback to original if variants unavailable
 */

export const PayloadOptimizedVideo = ({
  media,
  quality = 'auto', // 'auto', 'low', 'medium', 'high', 'full', or 'original'
  autoPlay = false,
  loop = false,
  muted = false,
  controls = false,
  playsInline = true,
  lazyLoad = true,
  className = '',
  style = {},
  onLoadedData = null,
  onError = null,
}) => {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(quality);

  // Validate that media is a video
  if (!media || !isVideo(media)) {
    console.warn('[PayloadOptimizedVideo] Invalid video media object:', media);
    return null;
  }

  // Determine quality based on viewport
  useEffect(() => {
    if (quality === 'auto') {
      const handleResize = () => {
        const recommendedQuality = getRecommendedVideoQuality(window.innerWidth);
        setCurrentQuality(recommendedQuality);
      };

      handleResize(); // Set initial quality
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [quality]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!lazyLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad]);

  // Get video URLs
  const videoUrl = getPayloadVideoUrl(media, currentQuality);
  const posterUrl = getVideoThumbnailUrl(media);
  const videoSources = generateVideoSources(media);

  const handleLoadedData = (e) => {
    setIsLoaded(true);
    if (onLoadedData) {
      onLoadedData(e);
    }
  };

  const handleError = (e) => {
    console.error('[PayloadOptimizedVideo] Video load error:', e);
    if (onError) {
      onError(e);
    }
  };

  return (
    <video
      ref={videoRef}
      className={`payload-optimized-video ${isLoaded ? 'loaded' : ''} ${className}`}
      style={style}
      autoPlay={shouldLoad && autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline={playsInline}
      poster={posterUrl}
      onLoadedData={handleLoadedData}
      onError={handleError}
      preload={lazyLoad ? 'metadata' : 'auto'}
    >
      {shouldLoad && (
        <>
          {/* Use video sources for adaptive streaming */}
          {videoSources.length > 0 ? (
            videoSources.map((source, index) => (
              <source 
                key={index}
                src={source.src}
                type={source.type}
                media={source.media}
              />
            ))
          ) : (
            <source src={videoUrl} type="video/mp4" />
          )}
          Your browser does not support the video tag.
        </>
      )}
    </video>
  );
};

export default PayloadOptimizedVideo;
