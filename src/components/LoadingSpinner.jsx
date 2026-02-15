import React from 'react';
import './LoadingSpinner.css';

/**
 * Reusable loading spinner component
 *
 * @param {Object} props
 * @param {string} props.size - Size of spinner: 'small', 'medium', 'large'
 * @param {string} props.color - Color of spinner (CSS color value)
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.fullScreen - Whether to show fullscreen overlay
 */
export const LoadingSpinner = ({
  size = 'medium',
  color = '#007bff',
  message = 'Loading...',
  fullScreen = false
}) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  };

  const spinnerContent = (
    <div className="loading-spinner-container">
      <div
        className={`loading-spinner ${sizeClasses[size]}`}
        style={{ borderTopColor: color }}
      />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
