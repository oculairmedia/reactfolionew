import { useCallback, useRef, useEffect } from 'react';
import {
  getPortfolioItems,
  getAboutPage,
  getProjectById,
  getSiteSettings,
  getHomeIntro,
} from '../utils/payloadApi';
import type { PrefetchHandlers, DataPrefetchType } from '../types';

export const usePrefetchPortfolio = (): PrefetchHandlers => {
  const prefetched = useRef(false);

  const prefetch = useCallback(() => {
    if (prefetched.current) return;

    prefetched.current = true;
    getPortfolioItems()
      .catch(() => {
        prefetched.current = false;
      });
  }, []);

  return {
    onMouseEnter: prefetch,
    onTouchStart: prefetch,
  };
};

export const usePrefetchAbout = (): PrefetchHandlers => {
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

export const usePrefetchProject = (projectId: string | null | undefined): PrefetchHandlers => {
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

export const usePrefetchHomeIntro = (): PrefetchHandlers => {
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

export const usePrefetchSiteSettings = (): PrefetchHandlers => {
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

export const usePrefetchCriticalData = (dataTypes: DataPrefetchType[] = []): void => {
  const prefetched = useRef(false);

  useEffect(() => {
    if (prefetched.current || !dataTypes.length) return;

    const prefetchData = async () => {
      const prefetchFunctions: Record<DataPrefetchType, () => Promise<unknown>> = {
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

    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
        prefetchData();
      });
    } else {
      setTimeout(() => {
        prefetchData();
      }, 2000);
    }

    prefetched.current = true;
  }, [dataTypes]);
};

export const prefetchData = (fetchFn: () => Promise<unknown>, _label: string = 'data'): void => {
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
