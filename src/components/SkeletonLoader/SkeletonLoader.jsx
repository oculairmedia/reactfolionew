import React from 'react';
import './SkeletonLoader.css';

/**
 * Skeleton loader component for better perceived performance
 * Shows content structure before actual content loads
 */
export const SkeletonLoader = ({ type = 'default' }) => {
  if (type === 'portfolio') {
    return (
      <div className="skeleton-portfolio">
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-item">
              <div className="skeleton-image"></div>
              <div className="skeleton-text">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-desc"></div>
                <div className="skeleton-line skeleton-desc short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'project') {
    return (
      <div className="skeleton-project">
        <div className="skeleton-hero"></div>
        <div className="skeleton-content">
          <div className="skeleton-line skeleton-title big"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="skeleton-default">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
    </div>
  );
};

export default SkeletonLoader;
