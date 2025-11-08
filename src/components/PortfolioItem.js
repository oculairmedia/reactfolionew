import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";

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
    navigate(data.link);
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
        delay: index * 0.2 // Add a delay based on the index
      } 
    }
  };

  return (
    <motion.div
      ref={ref}
      className="po_item"
      onClick={handleClick}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      <div className="media-container">
        {data.isVideo ? (
          shouldLoadVideo ? (
            <video
              ref={videoRef}
              className={isLoaded ? 'loaded' : ''}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster={data.img}
              onLoadedData={handleVideoLoad}
            >
              <source src={data.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={data.img}
              alt={data.title}
              className={isLoaded ? 'loaded' : ''}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
            />
          )
        ) : (
          <img
            src={data.img}
            alt={data.title}
            className={isLoaded ? 'loaded' : ''}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
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