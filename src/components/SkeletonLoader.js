import React from 'react';
import './SkeletonLoader.css';
import { Row, Col } from 'react-bootstrap';

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
 * Skeleton for home intro section - matches EXACT .intro_sec structure
 */
export const HomeIntroSkeleton = () => (
  <>
    <div className="h_bg-video skeleton-video-bg">
      <Skeleton height="100%" width="100%" />
    </div>
    <div className="text">
      <div className="intro">
        <Skeleton height="40px" width="70%" style={{ marginBottom: '1rem' }} />
        <Skeleton height="60px" width="90%" style={{ marginBottom: '1rem' }} className="typewriter-container" />
        <Skeleton height="20px" width="100%" style={{ marginBottom: '0.5rem' }} />
        <div className="intro_btn-action">
          <Skeleton height="45px" width="150px" style={{ display: 'inline-block', marginRight: '1rem' }} />
          <Skeleton height="45px" width="150px" style={{ display: 'inline-block' }} />
        </div>
        <div className="social-icons" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Skeleton circle width="40px" height="40px" />
          <Skeleton circle width="40px" height="40px" />
          <Skeleton circle width="40px" height="40px" />
        </div>
      </div>
    </div>
  </>
);

/**
 * Skeleton for about page - matches EXACT Bootstrap Row/Col structure
 */
export const AboutPageSkeleton = () => (
  <>
    <Row className="mb-5 mt-3 pt-md-3">
      <Col lg="8">
        <Skeleton height="48px" width="200px" className="display-4 mb-4" />
        <hr className="t_border my-4 ml-0 text-left" style={{ borderColor: 'var(--text-color)' }} />
      </Col>
    </Row>

    <Row className="sec_sp">
      <Col lg="5">
        <Skeleton height="32px" width="80%" className="color_sec py-4" />
        <Skeleton height="400px" width="100%" className="about-image mb-4" style={{ borderRadius: '8px' }} />
      </Col>
      <Col lg="7" className="d-flex align-items-center">
        <div>
          <Skeleton height="18px" width="100%" />
          <Skeleton height="18px" width="100%" />
          <Skeleton height="18px" width="95%" />
          <Skeleton height="18px" width="98%" />
          <Skeleton height="18px" width="100%" />
          <Skeleton height="18px" width="92%" />
        </div>
      </Col>
    </Row>

    <Row className="sec_sp">
      <Col lg="5">
        <Skeleton height="32px" width="200px" className="color_sec py-4" />
      </Col>
      <Col lg="7">
        <table className="table caption-top">
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>
                <th scope="row"><Skeleton height="20px" width="120px" /></th>
                <td><Skeleton height="20px" width="100px" /></td>
                <td><Skeleton height="20px" width="80px" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Col>
    </Row>

    <Row className="sec_sp">
      <Col lg="5">
        <Skeleton height="32px" width="150px" className="color_sec py-4" />
      </Col>
      <Col lg="7">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <Skeleton height="20px" width="120px" className="progress-title" />
            <div className="progress">
              <Skeleton height="5px" width="100%" className="progress-bar" />
            </div>
          </div>
        ))}
      </Col>
    </Row>

    <Row className="sec_sp">
      <Col lg="5">
        <Skeleton height="32px" width="150px" className="color_sec py-4" />
      </Col>
      <Col lg="7">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="service_ py-4" key={i}>
            <Skeleton height="24px" width="60%" className="service__title" />
            <Skeleton height="16px" width="100%" />
            <Skeleton height="16px" width="90%" />
          </div>
        ))}
      </Col>
    </Row>
  </>
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
