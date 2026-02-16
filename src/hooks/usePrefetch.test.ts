import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefetch } from './usePrefetch';

describe('usePrefetch', () => {
  it('returns onMouseEnter and onTouchStart handlers', () => {
    const loader = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => usePrefetch(loader));

    expect(result.current.onMouseEnter).toBeTypeOf('function');
    expect(result.current.onTouchStart).toBeTypeOf('function');
  });

  it('calls loader on first mouse enter', () => {
    const loader = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => usePrefetch(loader));

    act(() => {
      result.current.onMouseEnter();
    });

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('calls loader only once across multiple triggers', async () => {
    const loader = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => usePrefetch(loader));

    act(() => {
      result.current.onMouseEnter();
    });

    // Wait for the promise to resolve so prefetched.current = true
    await vi.waitFor(() => expect(loader).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.onMouseEnter();
      result.current.onTouchStart();
    });

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('does not crash when loader is undefined', () => {
    const { result } = renderHook(() => usePrefetch(undefined));

    expect(() => {
      act(() => {
        result.current.onMouseEnter();
      });
    }).not.toThrow();
  });

  it('calls loader on touch start', () => {
    const loader = vi.fn().mockResolvedValue({});
    const { result } = renderHook(() => usePrefetch(loader));

    act(() => {
      result.current.onTouchStart();
    });

    expect(loader).toHaveBeenCalledTimes(1);
  });
});
