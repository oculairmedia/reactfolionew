import { useCallback, useRef, useEffect } from 'react';
import {
  getPortfolioItems,
  getAboutPage,
  getProjectById,
  getSiteSettings,
  getHomeIntro,
} from '../utils/payloadApi';

/**
 * Data Prefetching Hook
 * Prefetches API data on hover/touch to populate cache for instant navigation
 *
 * Features:
 * - Works with existing localStorage cache in payloadApi.ts
 * - Prevents duplicate prefetch requests
 * - Silent failures (doesn't show errors to user)
 * - Prefetches on hover with debounce
 */

/**
 * Hook to prefetch portfolio items list
 * @returns {object} Event handlers for onMouseEnter and onTouchStart
 */
export const usePrefetchPortfolio = () => {
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;

    prefetched.current = true;
    // Prefetch silently - data will be in cache when user navigates
    getPortfolioItems()
      .catch(() => {
        prefetched.current = false; // Allow retry on error
      });
  }, []);

  return {
    onMouseEnter: prefetch,
    onTouchStart: prefetch,
  };
};

/**
 * Hook to prefetch about page data
 * @returns {object} Event handlers for onMouseEnter and onTouchStart
 */
export const usePrefetchAbout = () => {
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;

    prefetched.current = true;
    getAboutPage()
      .catch(() => {
        prefetched.current = false;
      });
  }, []);

  return {
    onMouseEnter: prefetch,
    onTouchStart: prefetch,
  };
};

/**
 * Hook to prefetch a specific project by ID
 * @param {string} projectId - The project ID to prefetch
 * @returns {object} Event handlers for onMouseEnter and onTouchStart
 */
export const usePrefetchProject = (projectId) => {
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current || !projectId) return;

    prefetched.current = true;
    getProjectById(projectId)
      .catch(() => {
        prefetched.current = false;
      });
  }, [projectId]);

  return {
    onMouseEnter: prefetch,
    onTouchStart: prefetch,
  };
};

/**
 * Hook to prefetch home intro data
 * @returns {object} Event handlers for onMouseEnter and onTouchStart
 */
export const usePrefetchHomeIntro = () => {
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;

    prefetched.current = true;
    getHomeIntro()
      .catch(() => {
        prefetched.current = false;
      });
  }, []);

  return {
    onMouseEnter: prefetch,
    onTouchStart: prefetch,
  };
};

/**
 * Hook to prefetch site settings
 * @returns {object} Event handlers for onMouseEnter and onTouchStart
 */
export const usePrefetchSiteSettings = () => {
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;

    prefetched.current = true;
    getSiteSettings()
      .catch(() => {
        prefetched.current = false;
      });
  }, []);

  return {
    onMouseEnter: prefetch,
    onTouchStart: prefetch,
  };
};

/**
 * Hook to prefetch critical data on idle
 * Use this on the home page to prefetch portfolio and about data
 * @param {Array<string>} dataTypes - Array of data types to prefetch: ['portfolio', 'about', 'home-intro', 'site-settings']
 */
export const usePrefetchCriticalData = (dataTypes = []) => {
  const prefetched = useRef(false);

  useEffect(() => {
    if (prefetched.current || !dataTypes.length) return;

    const prefetchData = async () => {
      const prefetchFunctions = {
        portfolio: getPortfolioItems,
        about: getAboutPage,
        'home-intro': getHomeIntro,
        'site-settings': getSiteSettings,
      };

      for (const type of dataTypes) {
        const fetchFn = prefetchFunctions[type];
        if (fetchFn) {
          try {
            await fetchFn();
          } catch {
            // Prefetch failed — will load normally on navigation
          }
        }
      }
    };

    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchData();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        prefetchData();
      }, 2000);
    }

    prefetched.current = true;
  }, [dataTypes]);
};

/**
 * Generic data prefetch function
 * Can be called directly for custom prefetch scenarios
 * @param {Function} fetchFn - The API function to call
 * @param {string} label - Label for logging
 */
export const prefetchData = (fetchFn, label = 'data') => {
  fetchFn().catch(() => {});
};

export default {
  usePrefetchPortfolio,
  usePrefetchAbout,
  usePrefetchProject,
  usePrefetchHomeIntro,
  usePrefetchSiteSettings,
  usePrefetchCriticalData,
  prefetchData,
};
