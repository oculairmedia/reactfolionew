import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.mock('*.css', () => ({}));

// jsdom lacks scrollIntoView — stub it globally
Element.prototype.scrollIntoView = vi.fn();

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '0px';
  readonly thresholds = [0];

  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
