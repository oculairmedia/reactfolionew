import React from 'react';
import { motion } from 'framer-motion';
import './LoadingSpinner.css';

export const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <motion.div
        className="spinner"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};
