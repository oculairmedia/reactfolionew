import React, { useEffect, useRef, useState } from "react";
import type { NormalizedGalleryItem, ProjectGalleryItem } from "../types";

const isVideoUrl = (url: string): boolean => {
  if (typeof url !== "string") return false;
  return (
    url.includes("/videos/") ||
    url.includes(".mp4") ||
    url.includes(".avc") ||
    url.includes(".hevc")
  );
};

export const normalizeGalleryItem = (
  item: ProjectGalleryItem | string,
): NormalizedGalleryItem => {
  if (typeof item === "string") {
    return {
      type: isVideoUrl(item) ? "video" : "image",
      url: item,
    };
  }

  const url = item.url || item.image || "";
  const type = item.type || (isVideoUrl(url) ? "video" : "image");

  return {
    type,
    url,
    caption: item.caption,
    width: item.width,
    poster: item.poster,
    alt: item.alt,
  };
};

interface GalleryMediaProps {
  item: NormalizedGalleryItem | ProjectGalleryItem | string;
  registerVideoRef?: (el: HTMLVideoElement) => void;
  className?: string;
}

const GalleryMedia = ({
  item,
  registerVideoRef,
  className = "",
}: GalleryMediaProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const media =
    typeof item === "string" || !("type" in item && "url" in item)
      ? normalizeGalleryItem(item as ProjectGalleryItem | string)
      : (item as NormalizedGalleryItem);
  const altText = media.alt || media.caption || "Gallery media";

  useEffect(() => {
    if (media.type !== "video" || !videoRef.current) return;

    const video = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [media.type]);

  if (media.type === "video") {
    return (
      <video
        ref={(el: HTMLVideoElement | null) => {
          videoRef.current = el;
          if (registerVideoRef && el) registerVideoRef(el);
        }}
        loop
        muted
        playsInline
        preload="none"
        className={`w-full h-auto block ${className}`}
        onError={() => {}}
        onLoadedData={() => {}}
        poster={media.poster}
      >
        {shouldLoad && <source src={media.url} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img
      src={media.url}
      alt={altText}
      className={`w-full h-auto block ${className}`}
      loading="lazy"
    />
  );
};

export default GalleryMedia;
