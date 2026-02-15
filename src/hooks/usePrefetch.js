import { useRef } from 'react';

/**
 * Predictive prefetching hook
 * Prefetches a route when user hovers over a link
 *
 * @param {string} path - The route to prefetch
 * @returns {object} - Event handlers for onMouseEnter and onTouchStart
 */
export const usePrefetch = (loaderFunc) => {
  const prefetched = useRef(false);

  const prefetchRoute = () => {
    if (prefetched.current || !loaderFunc) return;

    loaderFunc()
      .then(() => {
        prefetched.current = true;
      })
      .catch(() => {});
  };

  return {
    onMouseEnter: prefetchRoute,
    onTouchStart: prefetchRoute
  };
};

export default usePrefetch;

