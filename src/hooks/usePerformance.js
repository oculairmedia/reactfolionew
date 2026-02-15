import { useEffect, useCallback } from 'react';

export const usePerformance = () => {
  const measurePerformance = useCallback(() => {
    if (window.performance && window.performance.getEntriesByType) {
      // Navigation Timing
      const navigationTiming = performance.getEntriesByType('navigation')[0];
      const timing = {
        dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
        tcp: navigationTiming.connectEnd - navigationTiming.connectStart,
        ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
        download: navigationTiming.responseEnd - navigationTiming.responseStart,
        domInteractive: navigationTiming.domInteractive - navigationTiming.responseEnd,
        domComplete: navigationTiming.domComplete - navigationTiming.domInteractive,
        loadEvent: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
        total: navigationTiming.loadEventEnd - navigationTiming.startTime,
      };

      // Resource Timing
      const resources = performance.getEntriesByType('resource');
      const resourceTiming = resources.map(resource => ({
        name: resource.name,
        duration: resource.duration,
        size: resource.transferSize,
        type: resource.initiatorType,
      }));

      // Report to analytics if needed
      if (window.gtag) {
        window.gtag('event', 'performance', {
          event_category: 'Performance',
          event_label: 'Page Load',
          value: Math.round(timing.total),
        });
      }
    }
  }, []);

  useEffect(() => {
    // Wait for the page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [measurePerformance]);
};