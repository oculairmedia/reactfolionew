import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import "./PortfolioItem.css";
import { motion, useInView } from "framer-motion";
import { usePrefetchProject } from "../hooks/useDataPrefetch";
import { PayloadOptimizedImage } from "./OptimizedImage/PayloadOptimizedImage";
import { PayloadOptimizedVideo } from "./OptimizedVideo/PayloadOptimizedVideo";
import { isVideo } from "../utils/payloadImageHelper";
import type { PortfolioItem as PortfolioItemType, PayloadMedia } from "../types";

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

interface PortfolioItemProps {
  data: PortfolioItemType;
  index?: number;
}

const PortfolioItem = ({ data, index = 0 }: PortfolioItemProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const isInViewport = useInView(ref, { once: true, amount: 0.2 });

  const projectId = data.id || (data.link ? data.link.split('/').pop() : null);
  const projectPrefetchHandlers = usePrefetchProject(projectId);

  useEffect(() => {
    if (isInViewport && data.isVideo) {
      const timer = setTimeout(() => {
        setShouldLoadVideo(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isInViewport, data.isVideo]);

  const handleClick = () => {
    const link = data.link || `/projects/${data.slug || data.id}`;
    if (link) {
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
        damping: 25,
        mass: 0.5,
        delay: Math.min(index * 0.04, 0.4)
      }
    }
  };

  const featuredVideo = data.isVideo ? data.img : (data.featured_video || data.featuredVideo || data.video);
  const featuredImage = data.isVideo
    ? (data.featuredImage || data.featured_image)
    : (data.img || data.featured_image || data.featuredImage);

  const hasVideo = data.isVideo || (featuredVideo && typeof featuredVideo !== 'string' && isVideo(featuredVideo as PayloadMedia));

  return (
    <motion.div
      ref={ref}
      className="po_item"
      onClick={handleClick}
      initial="hidden"
      animate={isInViewport ? "visible" : "hidden"}
      variants={variants}
      {...projectPrefetchHandlers}
    >
      <div className="media-container">
        {hasVideo ? (
          <PayloadOptimizedVideo
            media={featuredVideo as PayloadMedia | string}
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
            media={featuredImage as PayloadMedia | string}
            alt={data.title}
            size="small"
            responsive={true}
            lazyLoad={true}
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
