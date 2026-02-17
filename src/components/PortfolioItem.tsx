import React, { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import "./PortfolioItem.css";
import { motion, useInView } from "framer-motion";
import { usePrefetchProject } from "../hooks/useDataPrefetch";
import { PayloadOptimizedImage } from "./OptimizedImage/PayloadOptimizedImage";
import { PayloadOptimizedVideo } from "./OptimizedVideo/PayloadOptimizedVideo";
import { isVideo } from "../utils/payloadImageHelper";
import type {
  PortfolioItem as PortfolioItemType,
  PayloadMedia,
} from "../types";

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};

interface PortfolioItemProps {
  data: PortfolioItemType;
  index?: number;
}

const PortfolioItem = ({ data, index = 0 }: PortfolioItemProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const isInViewport = useInView(ref, { once: true, amount: 0.2 });

  const projectId = data.id || (data.link ? data.link.split("/").pop() : null);
  const projectPrefetchHandlers = usePrefetchProject(projectId);

  const handleClick = () => {
    const link = data.link || `/projects/${data.slug || data.id}`;
    if (link) {
      navigate({ to: link });
    }
  };

  const handleMediaLoad = () => {
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
        delay: Math.min(index * 0.04, 0.4),
      },
    },
  };

  // Determine media type and source
  const featuredVideo = data.isVideo
    ? data.img
    : data.featured_video || data.featuredVideo || data.video;
  const featuredImage = data.isVideo
    ? data.featuredImage || data.featured_image
    : data.img || data.featured_image || data.featuredImage;

  const hasVideo =
    data.isVideo ||
    (featuredVideo &&
      typeof featuredVideo !== "string" &&
      isVideo(featuredVideo as PayloadMedia));

  return (
    <motion.div
      ref={ref}
      onClick={handleClick}
      initial="hidden"
      animate={isInViewport ? "visible" : "hidden"}
      variants={variants}
      {...projectPrefetchHandlers}
      className="po-item group"
    >
      {/* Media Container */}
      <div className="po-item-media">
        {hasVideo ? (
          <PayloadOptimizedVideo
            media={featuredVideo as PayloadMedia | string}
            quality="auto"
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            lazyLoad={true}
            onLoadedData={handleMediaLoad}
            className="po-item-video"
          />
        ) : (
          <PayloadOptimizedImage
            media={featuredImage as PayloadMedia | string}
            alt={data.title}
            size="medium"
            responsive={true}
            lazyLoad={true}
            onLoad={handleMediaLoad}
            className="po-item-image"
          />
        )}
      </div>

      {/* Overlay Gradient */}
      <div className="po-item-overlay" />

      {/* Content */}
      <div className="po-item-content">
        {/* Title */}
        <h3 className="po-item-title">{data.title}</h3>

        {/* Description - shown on hover */}
        <p className="po-item-description">
          {truncateText(data.description, 100)}
        </p>

        {/* View Project Link */}
        <span className="po-item-link">
          View Project
          <svg
            className="po-item-arrow"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </span>
      </div>

      {/* Border overlay for brutalist look */}
      <div className="po-item-border" />
    </motion.div>
  );
};

export default PortfolioItem;
