import React from 'react';
import './SkeletonLoader.css';

/**
 * Generic skeleton component
 */
export const Skeleton = ({ width = '100%', height = '20px', circle = false, className = '' }) => {
  const style = {
    width,
    height,
    borderRadius: circle ? '50%' : '4px',
  };

  return <div className={`skeleton ${className}`} style={style} />;
};

/**
 * Skeleton for portfolio grid item
 */
export const PortfolioItemSkeleton = () => (
  <div className="portfolio-item-skeleton">
    <Skeleton height="250px" className="skeleton-image" />
    <div className="skeleton-content">
      <Skeleton height="24px" width="80%" className="skeleton-title" />
      <Skeleton height="16px" width="60%" className="skeleton-description" />
      <div className="skeleton-tags">
        <Skeleton height="24px" width="60px" className="skeleton-tag" />
        <Skeleton height="24px" width="80px" className="skeleton-tag" />
        <Skeleton height="24px" width="70px" className="skeleton-tag" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for portfolio grid (multiple items)
 */
export const PortfolioGridSkeleton = ({ count = 6 }) => (
  <div className="portfolio-grid-skeleton">
    {Array.from({ length: count }).map((_, index) => (
      <PortfolioItemSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton for project detail page
 */
export const ProjectDetailSkeleton = () => (
  <div className="project-detail-skeleton">
    <div className="skeleton-hero">
      <Skeleton height="60px" width="70%" className="skeleton-title" />
      <Skeleton height="30px" width="50%" className="skeleton-subtitle" />
      <Skeleton height="400px" className="skeleton-hero-image" />
    </div>
    <div className="skeleton-metadata">
      <Skeleton height="20px" width="150px" />
      <Skeleton height="20px" width="150px" />
      <Skeleton height="20px" width="150px" />
      <Skeleton height="20px" width="150px" />
    </div>
    <div className="skeleton-section">
      <Skeleton height="32px" width="40%" className="skeleton-section-title" />
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="95%" />
      <Skeleton height="16px" width="98%" />
      <Skeleton height="16px" width="90%" />
    </div>
    <div className="skeleton-section">
      <Skeleton height="32px" width="35%" className="skeleton-section-title" />
      <Skeleton height="16px" width="100%" />
      <Skeleton height="16px" width="92%" />
      <Skeleton height="16px" width="96%" />
    </div>
  </div>
);

/**
 * Skeleton for home intro section
 */
export const HomeIntroSkeleton = () => (
  <div className="home-intro-skeleton">
    <div className="skeleton-intro-content">
      <Skeleton height="48px" width="60%" className="skeleton-intro-title" />
      <Skeleton height="24px" width="80%" className="skeleton-intro-text" />
      <Skeleton height="24px" width="75%" className="skeleton-intro-text" />
      <Skeleton height="40px" width="200px" className="skeleton-intro-button" />
    </div>
    <div className="skeleton-intro-image">
      <Skeleton circle width="300px" height="300px" />
    </div>
  </div>
);

/**
 * Skeleton for about page
 */
export const AboutPageSkeleton = () => (
  <div className="about-page-skeleton">
    <Skeleton height="48px" width="300px" className="skeleton-page-title" />
    <div className="skeleton-about-content">
      <div className="skeleton-about-text">
        <Skeleton height="16px" width="100%" />
        <Skeleton height="16px" width="95%" />
        <Skeleton height="16px" width="98%" />
        <Skeleton height="16px" width="92%" />
        <Skeleton height="16px" width="96%" />
      </div>
      <Skeleton circle width="200px" height="200px" className="skeleton-about-image" />
    </div>
    <div className="skeleton-skills">
      <Skeleton height="32px" width="200px" className="skeleton-section-title" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton-skill">
          <Skeleton height="20px" width="120px" />
          <Skeleton height="12px" width="100%" className="skeleton-skill-bar" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton for text content
 */
export const TextSkeleton = ({ lines = 3 }) => (
  <div className="text-skeleton">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height="16px"
        width={index === lines - 1 ? '80%' : '100%'}
      />
    ))}
  </div>
);

export default Skeleton;
