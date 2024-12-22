import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AnimatedText.css';

export const AnimatedText = ({ texts, typingSpeed = 50, deleteSpeed = 30, delayBetweenTexts = 2000 }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    // Function to measure text height
    const measureText = (text) => {
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.fontSize = '32px';
      tempSpan.style.fontWeight = '700';
      tempSpan.style.whiteSpace = 'normal';
      tempSpan.style.width = containerRef.current?.clientWidth + 'px';
      tempSpan.innerText = text;
      document.body.appendChild(tempSpan);
      const height = tempSpan.clientHeight;
      document.body.removeChild(tempSpan);
      return height;
    };

    // Find the tallest text
    const maxHeight = Math.max(...texts.map(text => measureText(text)));
    setContainerHeight(maxHeight);
  }, [texts]);

  useEffect(() => {
    const text = texts[currentTextIndex];
    
    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((current) => (current + 1) % texts.length);
        return;
      }

      const timer = setTimeout(() => {
        setDisplayText(current => current.slice(0, -1));
      }, deleteSpeed);
      return () => clearTimeout(timer);
    }

    if (displayText === text) {
      const timer = setTimeout(() => {
        setIsDeleting(true);
      }, delayBetweenTexts);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setDisplayText(text.slice(0, displayText.length + 1));
    }, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentTextIndex, displayText, isDeleting, texts, typingSpeed, deleteSpeed, delayBetweenTexts]);

  return (
    <div 
      ref={containerRef} 
      className="animated-text-container"
      style={{ height: containerHeight }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={displayText}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="animated-text"
        >
          {displayText}
          <span className="cursor"></span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};