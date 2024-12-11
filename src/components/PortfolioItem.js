import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

const PortfolioItem = ({ data, index }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  useEffect(() => {
    if (data.isVideo) {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = data.video;
      video.muted = true;
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        video.currentTime = 0;
      };

      video.onseeked = () => {
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumbnailUrl(canvas.toDataURL());
      };

      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 500);

      return () => {
        clearTimeout(timer);
        video.remove();
      };
    } else if (data.img) {
      const img = new Image();
      img.src = data.img;
      img.onload = () => setIsLoaded(true);
    }
  }, [data.isVideo, data.video, data.img]);

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
          showVideo ? (
            <video 
              ref={videoRef}
              className={isLoaded ? 'loaded' : ''}
              autoPlay 
              loop 
              muted 
              playsInline
              poster={thumbnailUrl || data.img}
              onLoadedData={handleVideoLoad}
            >
              <source src={data.video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <img src={thumbnailUrl || data.img} alt={data.title} className={isLoaded ? 'loaded' : ''} onLoad={() => setIsLoaded(true)} />
          )
        ) : (
          <img src={data.img} alt={data.title} className={isLoaded ? 'loaded' : ''} onLoad={() => setIsLoaded(true)} />
        )}
      </div>
      <div className="content">
        <h3>{data.title}</h3>
        <p>{truncateText(data.description, 100)}</p>
        <span className="view-project">View Project</span>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </motion.div>
  );
};

export default PortfolioItem;