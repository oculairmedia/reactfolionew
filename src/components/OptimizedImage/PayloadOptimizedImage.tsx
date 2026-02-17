import React, { useState, useEffect, useRef } from "react";
import {
  getPayloadImageUrl,
  generatePayloadSrcSet,
  generateSizesAttr,
} from "../../utils/payloadImageHelper";
import type { PayloadMedia } from "../../types";
import "./OptimizedImage.css";

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
  size = "medium",
  className = "",
  responsive = true,
  lazyLoad = true,
  sizes,
  width,
  height,
  onLoad,
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
        rootMargin: "100px",
        threshold: 0.01,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazyLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
  };

  // Handle string URLs directly
  if (typeof media === "string") {
    return (
      <div ref={imgRef} className={`optimized-image-container ${className}`}>
        {isInView && (
          <img
            src={media}
            alt={alt || ""}
            className={isLoaded ? "loaded" : ""}
            loading={lazyLoad ? "lazy" : "eager"}
            onLoad={handleLoad}
            onError={handleError}
            decoding="async"
          />
        )}
        {!isLoaded && !error && <div className="image-placeholder" />}
        {error && (
          <div className="image-error">
            <span>Failed to load</span>
          </div>
        )}
      </div>
    );
  }

  // Handle PayloadMedia objects
  const mainSrc = getPayloadImageUrl(media, size);

  const srcSet =
    responsive && media?.sizes
      ? generatePayloadSrcSet(media, ["small", "medium", "large"])
      : undefined;

  const sizesAttr = sizes || (responsive ? generateSizesAttr() : undefined);
  const altText = alt || media?.alt || "";

  // No valid source
  if (!mainSrc) {
    return (
      <div className={`optimized-image-container ${className}`}>
        <div className="image-error">
          <span>No image</span>
        </div>
      </div>
    );
  }

  const containerStyle: React.CSSProperties | undefined =
    width && height
      ? { width: width as number, height: height as number }
      : undefined;

  return (
    <div
      ref={imgRef}
      className={`optimized-image-container ${className}`}
      style={containerStyle}
    >
      {isInView && (
        <img
          src={mainSrc}
          srcSet={srcSet}
          sizes={sizesAttr}
          alt={altText}
          className={isLoaded ? "loaded" : ""}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazyLoad ? "lazy" : "eager"}
          decoding="async"
        />
      )}
      {!isLoaded && !error && <div className="image-placeholder" />}
      {error && (
        <div className="image-error">
          <span>Failed to load</span>
        </div>
      )}
    </div>
  );
};

export default PayloadOptimizedImage;
