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
 * Skeleton for portfolio grid item - matches .po_item structure
 */
export const PortfolioItemSkeleton = () => (
  <div className="portfolio-item-skeleton">
    <div className="skeleton-media-container">
      <Skeleton height="100%" className="skeleton-image" />
    </div>
  </div>
);

/**
 * Skeleton for portfolio grid (multiple items) - matches .po_items_ho structure
 */
export const PortfolioGridSkeleton = ({ count = 6, className = '' }) => (
  <div className={`portfolio-grid-skeleton ${className}`}>
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
 * Skeleton for home intro section - matches .intro_sec layout
 */
export const HomeIntroSkeleton = () => (
  <div className="home-intro-skeleton">
    <div className="skeleton-intro-content">
      <div className="skeleton-intro-inner">
        <Skeleton height="40px" width="70%" className="skeleton-intro-title" />
        <Skeleton height="60px" width="90%" className="skeleton-intro-typewriter" />
        <Skeleton height="20px" width="100%" className="skeleton-intro-text" />
        <Skeleton height="20px" width="95%" className="skeleton-intro-text" />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Skeleton height="45px" width="150px" className="skeleton-intro-button" />
          <Skeleton height="45px" width="150px" className="skeleton-intro-button" />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Skeleton circle width="40px" height="40px" />
          <Skeleton circle width="40px" height="40px" />
          <Skeleton circle width="40px" height="40px" />
        </div>
      </div>
    </div>
    <div className="skeleton-intro-video" />
  </div>
);

/**
 * Skeleton for about page - matches Bootstrap Row/Col layout
 */
export const AboutPageSkeleton = () => (
  <div className="about-page-skeleton">
    {/* Page title section */}
    <div className="mb-5 mt-3">
      <Skeleton height="48px" width="300px" className="skeleton-page-title" />
      <Skeleton height="4px" width="100px" style={{ marginTop: '1.5rem' }} />
    </div>

    {/* About section - matches Row with Col lg="5" and lg="7" */}
    <div className="skeleton-about-section sec_sp">
      <div className="skeleton-about-grid">
        <div className="skeleton-about-left">
          <Skeleton height="32px" width="80%" className="skeleton-section-title" />
          <Skeleton height="400px" width="100%" style={{ marginTop: '1rem', borderRadius: '8px' }} />
        </div>
        <div className="skeleton-about-right">
          <Skeleton height="18px" width="100%" />
          <Skeleton height="18px" width="100%" />
          <Skeleton height="18px" width="95%" />
          <Skeleton height="18px" width="98%" />
          <Skeleton height="18px" width="100%" />
          <Skeleton height="18px" width="92%" />
          <Skeleton height="18px" width="96%" />
        </div>
      </div>
    </div>

    {/* Work Timeline section */}
    <div className="skeleton-timeline-section sec_sp">
      <div className="skeleton-about-grid">
        <div className="skeleton-about-left">
          <Skeleton height="32px" width="200px" />
        </div>
        <div className="skeleton-about-right">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
              <Skeleton height="20px" width="30%" />
              <Skeleton height="20px" width="30%" />
              <Skeleton height="20px" width="30%" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Skills section */}
    <div className="skeleton-skills-section sec_sp">
      <div className="skeleton-about-grid">
        <div className="skeleton-about-left">
          <Skeleton height="32px" width="150px" />
        </div>
        <div className="skeleton-about-right">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-skill">
              <Skeleton height="20px" width="120px" />
              <Skeleton height="5px" width="100%" className="skeleton-skill-bar" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Services section */}
    <div className="skeleton-services-section sec_sp">
      <div className="skeleton-about-grid">
        <div className="skeleton-about-left">
          <Skeleton height="32px" width="150px" />
        </div>
        <div className="skeleton-about-right">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ marginBottom: '2rem' }}>
              <Skeleton height="24px" width="60%" />
              <Skeleton height="16px" width="100%" />
              <Skeleton height="16px" width="90%" />
            </div>
          ))}
        </div>
      </div>
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
