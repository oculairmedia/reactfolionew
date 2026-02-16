import React, { useRef, useEffect, useState } from 'react';
import {
  getPayloadVideoUrl,
  getVideoThumbnailUrl,
  generateVideoSources,
  getRecommendedVideoQuality,
  isVideo
} from '../../utils/payloadImageHelper';
import type { PayloadMedia } from '../../types';
import './OptimizedVideo.css';

interface PayloadOptimizedVideoProps {
  media: PayloadMedia | string;
  quality?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  playsInline?: boolean;
  lazyLoad?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onLoadedData?: ((e: React.SyntheticEvent<HTMLVideoElement>) => void) | null;
  onError?: ((e: React.SyntheticEvent<HTMLVideoElement>) => void) | null;
}

export const PayloadOptimizedVideo = ({
  media,
  quality = 'auto',
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
}: PayloadOptimizedVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(quality);

  const isLegacyUrl = typeof media === 'string';

  if (!isLegacyUrl && (!media || !isVideo(media))) {
    return null;
  }

  useEffect(() => {
    if (quality === 'auto' && !isLegacyUrl) {
      const handleResize = () => {
        const recommendedQuality = getRecommendedVideoQuality(window.innerWidth);
        setCurrentQuality(recommendedQuality);
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [quality, isLegacyUrl]);

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

  const videoUrl = isLegacyUrl ? media : getPayloadVideoUrl(media as PayloadMedia, currentQuality);
  const posterUrl = isLegacyUrl ? null : getVideoThumbnailUrl(media as PayloadMedia);
  const videoSources = isLegacyUrl ? [] : generateVideoSources(media as PayloadMedia);

  const handleLoadedData = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setIsLoaded(true);
    if (onLoadedData) {
      onLoadedData(e);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
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
      poster={posterUrl || undefined}
      onLoadedData={handleLoadedData}
      onError={handleError}
      preload={lazyLoad ? 'metadata' : 'auto'}
    >
      {shouldLoad && (
        <>
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
            <source src={videoUrl || undefined} type="video/mp4" />
          )}
          Your browser does not support the video tag.
        </>
      )}
    </video>
  );
};

export default PayloadOptimizedVideo;
