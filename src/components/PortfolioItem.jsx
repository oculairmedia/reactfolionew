import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import "./PortfolioItem.css";
import { motion, useInView } from "framer-motion";
import { usePrefetchProject } from "../hooks/useDataPrefetch";
import { PayloadOptimizedImage } from "./OptimizedImage/PayloadOptimizedImage";
import { PayloadOptimizedVideo } from "./OptimizedVideo/PayloadOptimizedVideo";
import { getPayloadImageUrl, isVideo } from "../utils/payloadImageHelper";

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

const PortfolioItem = ({ data, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Extract project ID from link for prefetching
  // Link format is typically "/portfolio/[id]" or just the ID
  const projectId = data.id || (data.link ? data.link.split('/').pop() : null);
  const projectPrefetchHandlers = usePrefetchProject(projectId);

  // Only load video when in viewport
  useEffect(() => {
    if (isInView && data.isVideo) {
      // Delay video loading slightly to prioritize visible content
      const timer = setTimeout(() => {
        setShouldLoadVideo(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isInView, data.isVideo]);

  const handleClick = () => {
    const link = data.link || `/projects/${data.slug || data.id}`;
    if (link) {
      // Use object syntax for TanStack Router navigation
      navigate({ to: link });
    }
  };

  const handleVideoLoad = () => {
    setIsLoaded(true);
  };

  const variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 25, // Higher damping = less bounce
        mass: 0.5, // Lower mass = faster, lighter feel
        delay: Math.min(index * 0.04, 0.4) // Faster stagger
      }
    }
  };

  // Get media URLs - support both Payload media objects and legacy string URLs
  // When isVideo is true, the video URL is in data.img
  const featuredVideo = data.isVideo ? data.img : (data.featured_video || data.featuredVideo || data.video);
  // For images, prioritize img field (has correct CDN URLs), fallback to featuredImage object
  const featuredImage = data.isVideo
    ? (data.featuredImage || data.featured_image)
    : (data.img || data.featured_image || data.featuredImage);

  // Check if featured media is a video
  const hasVideo = data.isVideo || (featuredVideo && isVideo(featuredVideo));

  return (
    <motion.div
      ref={ref}
      className="po_item"
      onClick={handleClick}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      {...projectPrefetchHandlers}
    >
      <div className="media-container">
        {hasVideo ? (
          <PayloadOptimizedVideo
            media={featuredVideo}
            quality="auto"
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            lazyLoad={true}
            onLoadedData={handleVideoLoad}
            className={isLoaded ? 'loaded' : ''}
          />
        ) : (
          <PayloadOptimizedImage
            media={featuredImage}
            alt={data.title}
            size="small"
            responsive={true}
            lazyLoad={true}
            onLoad={() => setIsLoaded(true)}
            className={isLoaded ? 'loaded' : ''}
          />
        )}
      </div>
      <div className="content">
        <h3>{data.title}</h3>
        <p>{truncateText(data.description, 100)}</p>
        <span className="view-project">View Project</span>
      </div>
    </motion.div>
  );
};

export default PortfolioItem;