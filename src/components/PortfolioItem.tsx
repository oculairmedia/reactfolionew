import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
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
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const isInViewport = useInView(ref, { once: true, amount: 0.2 });

  const projectId = data.id || (data.link ? data.link.split("/").pop() : null);
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
        delay: Math.min(index * 0.04, 0.4),
      },
    },
  };

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
      className="group relative aspect-[4/3] overflow-hidden cursor-pointer bg-base-200"
    >
      {/* Media Container */}
      <div className="absolute inset-0 w-full h-full">
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
            className={`w-full h-full object-cover transition-all duration-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-105`}
          />
        ) : (
          <PayloadOptimizedImage
            media={featuredImage as PayloadMedia | string}
            alt={data.title}
            size="small"
            responsive={true}
            lazyLoad={true}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isLoaded ? "opacity-100" : "opacity-0"
            } group-hover:scale-105`}
          />
        )}
      </div>

      {/* Overlay - Always visible gradient, enhanced on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-base-100/90 via-base-100/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
        {/* Title */}
        <h3 className="font-heading text-lg md:text-xl font-bold uppercase tracking-tight text-base-content mb-1 line-clamp-2 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
          {data.title}
        </h3>

        {/* Description - Hidden by default, shown on hover */}
        <p className="font-mono text-[0.65rem] uppercase tracking-wider text-base-content/70 line-clamp-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 mb-2">
          {truncateText(data.description, 100)}
        </p>

        {/* View Project Link */}
        <span className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-primary font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
          View Project
          <svg
            className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-200"
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
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default PortfolioItem;
