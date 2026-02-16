import { useRef } from 'react';
import type { PrefetchHandlers } from '../types';

export const usePrefetch = (loaderFunc: (() => Promise<unknown>) | undefined): PrefetchHandlers => {
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
