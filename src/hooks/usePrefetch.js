import { useEffect, useRef } from 'react';

/**
 * Predictive prefetching hook
 * Prefetches a route when user hovers over a link
 *
 * @param {string} path - The route to prefetch
 * @returns {object} - Event handlers for onMouseEnter and onTouchStart
 */
export const usePrefetch = (path) => {
  const prefetched = useRef(false);

  const prefetchRoute = () => {
    if (prefetched.current || !path) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = path;
    link.as = 'document';
    document.head.appendChild(link);

    prefetched.current = true;
  };

  return {
    onMouseEnter: prefetchRoute,
    onTouchStart: prefetchRoute
  };
};

/**
 * Prefetch component - wraps children and prefetches on hover
 */
export const Prefetch = ({ path, children, ...props }) => {
  const prefetchHandlers = usePrefetch(path);

  return (
    <div {...prefetchHandlers} {...props}>
      {children}
    </div>
  );
};

/**
 * Prefetch critical routes on idle
 * Call this in your main App component
 */
export const usePrefetchCriticalRoutes = (routes = []) => {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        routes.forEach(route => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          link.as = 'document';
          document.head.appendChild(link);
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        routes.forEach(route => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = route;
          link.as = 'document';
          document.head.appendChild(link);
        });
      }, 2000);
    }
  }, [routes]);
};

export default usePrefetch;
