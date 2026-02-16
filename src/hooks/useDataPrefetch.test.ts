import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock the API module before importing hooks
const mockGetPortfolioItems = vi.fn().mockResolvedValue([]);
const mockGetAboutPage = vi.fn().mockResolvedValue(null);
const mockGetHomeIntro = vi.fn().mockResolvedValue(null);
const mockGetSiteSettings = vi.fn().mockResolvedValue(null);
const mockGetProjectById = vi.fn().mockResolvedValue(null);

vi.mock('../utils/payloadApi', () => ({
  getPortfolioItems: (...args: unknown[]) => mockGetPortfolioItems(...args),
  getAboutPage: (...args: unknown[]) => mockGetAboutPage(...args),
  getHomeIntro: (...args: unknown[]) => mockGetHomeIntro(...args),
  getSiteSettings: (...args: unknown[]) => mockGetSiteSettings(...args),
  getProjectById: (...args: unknown[]) => mockGetProjectById(...args),
}));

import {
  usePrefetchPortfolio,
  usePrefetchAbout,
  usePrefetchProject,
  prefetchData,
} from './useDataPrefetch';

describe('useDataPrefetch hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePrefetchPortfolio', () => {
    it('returns handlers', () => {
      const { result } = renderHook(() => usePrefetchPortfolio());
      expect(result.current.onMouseEnter).toBeTypeOf('function');
      expect(result.current.onTouchStart).toBeTypeOf('function');
    });

    it('calls getPortfolioItems on trigger', () => {
      const { result } = renderHook(() => usePrefetchPortfolio());

      act(() => {
        result.current.onMouseEnter();
      });

      expect(mockGetPortfolioItems).toHaveBeenCalledTimes(1);
    });

    it('only prefetches once', () => {
      const { result } = renderHook(() => usePrefetchPortfolio());

      act(() => {
        result.current.onMouseEnter();
        result.current.onMouseEnter();
        result.current.onTouchStart();
      });

      expect(mockGetPortfolioItems).toHaveBeenCalledTimes(1);
    });

    it('resets on fetch failure', async () => {
      mockGetPortfolioItems.mockRejectedValueOnce(new Error('fail'));
      const { result } = renderHook(() => usePrefetchPortfolio());

      act(() => {
        result.current.onMouseEnter();
      });

      // Wait for rejection to process
      await vi.waitFor(() => expect(mockGetPortfolioItems).toHaveBeenCalledTimes(1));

      // After failure, prefetched.current resets to false, so it should allow retry
      act(() => {
        result.current.onMouseEnter();
      });

      expect(mockGetPortfolioItems).toHaveBeenCalledTimes(2);
    });
  });

  describe('usePrefetchAbout', () => {
    it('calls getAboutPage on trigger', () => {
      const { result } = renderHook(() => usePrefetchAbout());

      act(() => {
        result.current.onMouseEnter();
      });

      expect(mockGetAboutPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('usePrefetchProject', () => {
    it('calls getProjectById with project ID', () => {
      const { result } = renderHook(() => usePrefetchProject('project-123'));

      act(() => {
        result.current.onMouseEnter();
      });

      expect(mockGetProjectById).toHaveBeenCalledWith('project-123');
    });

    it('does not fetch when projectId is null', () => {
      const { result } = renderHook(() => usePrefetchProject(null));

      act(() => {
        result.current.onMouseEnter();
      });

      expect(mockGetProjectById).not.toHaveBeenCalled();
    });
  });

  describe('prefetchData', () => {
    it('calls the provided fetch function', () => {
      const fetchFn = vi.fn().mockResolvedValue({});
      prefetchData(fetchFn, 'test');
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw on fetch failure', () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('fail'));
      expect(() => prefetchData(fetchFn, 'test')).not.toThrow();
    });
  });
});
