import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { uiText } from '../content_option';
import './ReturnToPortfolio.css';

const ReturnToPortfolio = () => {
  return (
    <motion.div
      className="return-button-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      <Link to="/portfolio" className="return-button">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {uiText.returnToPortfolio}
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ReturnToPortfolio;