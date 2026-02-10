import React from "react";
import { Image } from "react-bootstrap";

// Determine if a URL points to a video asset
const isVideoUrl = (url) => {
  if (typeof url !== "string") return false;
  return (
    url.includes("/videos/") ||
    url.includes(".mp4") ||
    url.includes(".avc") ||
    url.includes(".hevc")
  );
};

export const normalizeGalleryItem = (item) => {
  if (typeof item === "string") {
    return {
      type: isVideoUrl(item) ? "video" : "image",
      url: item,
    };
  }

  // Prefer explicit type, otherwise infer
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

const GalleryMedia = ({ item, registerVideoRef }) => {
  const media = normalizeGalleryItem(item);
  const altText = media.alt || media.caption || "Gallery media";

  if (media.type === "video") {
    return (
      <video
        ref={el => registerVideoRef && el && registerVideoRef(el)}
        autoPlay
        loop
        muted
        playsInline
        style={{ width: "100%", height: "auto", display: "block" }}
        onError={(e) => console.error("Video load error:", media.url, e)}
        onLoadedData={() => console.log("Video loaded:", media.url)}
        poster={media.poster}
      >
        <source src={media.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <Image
      src={media.url}
      alt={altText}
      fluid
      style={{ width: "100%", height: "auto", display: "block" }}
    />
  );
};

export default GalleryMedia;
