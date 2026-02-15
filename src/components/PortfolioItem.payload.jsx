import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { usePrefetchProject } from "../hooks/useDataPrefetch";
import { PayloadOptimizedImage } from "./OptimizedImage/PayloadOptimizedImage";
import { getPayloadImageUrl } from "../utils/payloadImageHelper";

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

/**
 * Portfolio Item Component - Payload CMS Version
 * 
 * Props:
 * - project: Payload project object with populated media fields
 * - index: Index for stagger animation
 * 
 * Expected project structure:
 * {
 *   id: "abc123",
 *   title: "Project Title",
 *   description: "Project description",
 *   slug: "project-slug",
 *   featuredImage: { ...Payload media object },
 *   featuredVideo: { ...Payload media object } (optional),
 *   isVideo: true/false
 * }
 */
const PortfolioItemPayload = ({ project, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Prefetch project data
  const projectPrefetchHandlers = usePrefetchProject(project.id);

  // Only load video when in viewport
  useEffect(() => {
    if (isInView && project.isVideo && project.featuredVideo) {
      // Delay video loading slightly to prioritize visible content
      const timer = setTimeout(() => {
        setShouldLoadVideo(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isInView, project.isVideo, project.featuredVideo]);

  const handleClick = () => {
    navigate(`/portfolio/${project.slug || project.id}`);
  };

  const handleVideoLoad = () => {
    setIsLoaded(true);
  };

  const variants = {
    hidden: { opacity: 0.6, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: index * 0.2
      }
    }
  };

  // Get video URL if available
  const videoUrl = project.featuredVideo
    ? getPayloadImageUrl(project.featuredVideo, 'original')
    : null;

  // Get poster/thumbnail for video
  const posterUrl = project.featuredImage
    ? getPayloadImageUrl(project.featuredImage, 'small')
    : null;

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
        {project.isVideo && videoUrl ? (
          shouldLoadVideo ? (
            <video
              ref={videoRef}
              className={isLoaded ? 'loaded' : ''}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={posterUrl}
              onLoadedData={handleVideoLoad}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // Show optimized thumbnail while video loads
            <PayloadOptimizedImage
              media={project.featuredImage}
              alt={project.title}
              size="small"
              responsive={false}
              lazyLoad={true}
              className={isLoaded ? 'loaded' : ''}
            />
          )
        ) : (
          // Regular image with responsive sizes
          <PayloadOptimizedImage
            media={project.featuredImage}
            alt={project.title}
            size="small"          // 600px for grid cards
            responsive={true}     // Enable srcSet for different screens
            lazyLoad={true}
            className={isLoaded ? 'loaded' : ''}
          />
        )}
      </div>
      <div className="content">
        <h3>{project.title}</h3>
        <p>{truncateText(project.description || '', 100)}</p>
        <span className="view-project">View Project</span>
      </div>
    </motion.div>
  );
};

export default PortfolioItemPayload;
