import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PortfolioItemPayload from '../components/PortfolioItem.payload';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Portfolio Page - Payload CMS Integration Example
 * 
 * This example shows how to:
 * 1. Fetch portfolio projects from Payload CMS
 * 2. Use optimized images with automatic CDN serving
 * 3. Handle loading and error states
 * 4. Display projects in a responsive grid
 */

const CMS_API_URL = import.meta.env.REACT_APP_API_URL || 'https://cms2.emmanuelu.com/api';

const PortfolioPagePayload = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch projects with populated media relationships
      // depth=1 ensures featuredImage and featuredVideo are fully populated
      const response = await fetch(
        `${CMS_API_URL}/projects?depth=1&limit=50&sort=-createdAt`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setProjects(data.docs);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="portfolio-page">
        <div className="container">
          <LoadingSpinner />
          <p className="loading-text">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-page">
        <div className="container">
          <div className="error-message">
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={fetchProjects}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="portfolio-page">
        <div className="container">
          <div className="empty-state">
            <h2>No projects yet</h2>
            <p>Check back soon for new work!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <div className="container">
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Portfolio</h1>
          <p className="subtitle">
            A collection of my recent work ({projects.length} projects)
          </p>
        </motion.div>

        <div className="portfolio-grid">
          {projects.map((project, index) => (
            <PortfolioItemPayload
              key={project.id}
              project={project}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPagePayload;

/**
 * EXAMPLE API RESPONSE STRUCTURE
 * 
 * The Payload API returns:
 * 
 * {
 *   "docs": [
 *     {
 *       "id": "673288c5e00123456789abcd",
 *       "title": "Coffee By Altitude",
 *       "slug": "coffee-by-altitude",
 *       "description": "A modern coffee shop website...",
 *       "isVideo": false,
 *       "featuredImage": {
 *         "id": "673288d5e00123456789abce",
 *         "filename": "coffee-by-altitude-1.jpg",
 *         "alt": "Coffee By Altitude showcase",
 *         "width": 1920,
 *         "height": 1280,
 *         "mimeType": "image/jpeg",
 *         "filesize": 245000,
 *         "sizes": {
 *           "thumbnail": {
 *             "filename": "coffee-by-altitude-1-300x300.webp",
 *             "width": 300,
 *             "height": 300,
 *             "mimeType": "image/webp",
 *             "filesize": 12500,
 *             "url": "/media/coffee-by-altitude-1-300x300.webp"
 *           },
 *           "small": {
 *             "filename": "coffee-by-altitude-1-600x400.webp",
 *             "width": 600,
 *             "height": 400,
 *             "mimeType": "image/webp",
 *             "filesize": 25000,
 *             "url": "/media/coffee-by-altitude-1-600x400.webp"
 *           },
 *           "medium": {
 *             "filename": "coffee-by-altitude-1-1024x683.webp",
 *             "width": 1024,
 *             "height": 683,
 *             "mimeType": "image/webp",
 *             "filesize": 65000,
 *             "url": "/media/coffee-by-altitude-1-1024x683.webp"
 *           },
 *           "large": {
 *             "filename": "coffee-by-altitude-1-1920x1280.webp",
 *             "width": 1920,
 *             "height": 1280,
 *             "mimeType": "image/webp",
 *             "filesize": 195000,
 *             "url": "/media/coffee-by-altitude-1-1920x1280.webp"
 *           },
 *           "og": {
 *             "filename": "coffee-by-altitude-1-1200x630.jpg",
 *             "width": 1200,
 *             "height": 630,
 *             "mimeType": "image/jpeg",
 *             "filesize": 125000,
 *             "url": "/media/coffee-by-altitude-1-1200x630.jpg"
 *           }
 *         },
 *         "url": "/media/coffee-by-altitude-1.jpg",
 *         "cdn_url": "https://oculair.b-cdn.net/media/coffee-by-altitude-1.jpg",
 *         "cdn_synced": true
 *       },
 *       "createdAt": "2025-11-11T19:30:00.000Z",
 *       "updatedAt": "2025-11-11T19:30:00.000Z"
 *     }
 *   ],
 *   "totalDocs": 48,
 *   "limit": 50,
 *   "page": 1,
 *   "totalPages": 1
 * }
 * 
 * PERFORMANCE NOTES:
 * 
 * Mobile (375px):
 * - Uses 'small' size: 600px WebP (~25 KB)
 * - 90% smaller than original
 * 
 * Tablet (768px):
 * - Uses 'medium' size: 1024px WebP (~65 KB)
 * - 73% smaller than original
 * 
 * Desktop (1920px):
 * - Uses 'large' size: 1920px WebP (~195 KB)
 * - 20% smaller than original
 * 
 * All optimized sizes are pre-generated and served from CDN!
 */
