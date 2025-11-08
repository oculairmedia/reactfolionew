/**
 * Tests for OptimizedImage component
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { OptimizedImage } from './OptimizedImage';
import * as cdnHelper from '../../utils/cdnHelper';

// Mock framer-motion to avoid animation complexities in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, style, initial, animate, exit, ...props }) => (
      <div className={className} style={style} {...props}>{children}</div>
    ),
    img: ({ children, className, style, initial, animate, transition, ...props }) => (
      <img className={className} style={style} {...props} />
    )
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.elements = new Set();
  }

  observe(element) {
    this.elements.add(element);
    // Immediately trigger intersection for testing
    setTimeout(() => {
      this.callback([{ isIntersecting: true, target: element }], this);
    }, 0);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock CSS file
jest.mock('./OptimizedImage.css', () => ({}));

describe('OptimizedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });

    it('should render placeholder initially', () => {
      const { container } = render(
        <OptimizedImage src="https://example.com/image.jpg" alt="Test image" />
      );
      
      const placeholder = container.querySelector('.image-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('should render image with correct src', async () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('Test image');
        expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
      });
    });

    it('should render image with correct alt text', async () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Beautiful scenery" />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Beautiful scenery')).toBeInTheDocument();
      });
    });

    it('should apply custom className to container', () => {
      const { container } = render(
        <OptimizedImage 
          src="https://example.com/image.jpg" 
          alt="Test image"
          className="custom-class"
        />
      );
      
      const imageContainer = container.querySelector('.optimized-image-container');
      expect(imageContainer).toHaveClass('custom-class');
    });

    it('should apply width and height styles', () => {
      const { container } = render(
        <OptimizedImage 
          src="https://example.com/image.jpg" 
          alt="Test image"
          width="800px"
          height="600px"
        />
      );
      
      const imageContainer = container.querySelector('.optimized-image-container');
      expect(imageContainer).toHaveStyle({ width: '800px', height: '600px' });
    });

    it('should set loading="lazy" attribute', async () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('Test image');
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });

    it('should set decoding="async" attribute', async () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('Test image');
        expect(img).toHaveAttribute('decoding', 'async');
      });
    });
  });

  describe('Happy Path - BunnyCDN Integration', () => {
    it('should generate srcSet for BunnyCDN URLs', async () => {
      const cdnUrl = 'https://example.b-cdn.net/image.jpg';
      const mockSrcSet = 'https://example.b-cdn.net/image.jpg?width=400 400w, https://example.b-cdn.net/image.jpg?width=800 800w';
      
      jest.spyOn(cdnHelper, 'generateSrcSet').mockReturnValue(mockSrcSet);
      
      render(<OptimizedImage src={cdnUrl} alt="CDN image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('CDN image');
        expect(img).toHaveAttribute('srcset', mockSrcSet);
      });
      
      expect(cdnHelper.generateSrcSet).toHaveBeenCalledWith(cdnUrl);
    });

    it('should not generate srcSet for non-CDN URLs', async () => {
      const regularUrl = 'https://example.com/image.jpg';
      
      jest.spyOn(cdnHelper, 'generateSrcSet');
      
      render(<OptimizedImage src={regularUrl} alt="Regular image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('Regular image');
        expect(img).not.toHaveAttribute('srcset');
      });
    });

    it('should pass sizes attribute to image', async () => {
      const cdnUrl = 'https://example.b-cdn.net/image.jpg';
      const mockSrcSet = 'https://example.b-cdn.net/image.jpg?width=400 400w';
      
      jest.spyOn(cdnHelper, 'generateSrcSet').mockReturnValue(mockSrcSet);
      
      render(
        <OptimizedImage 
          src={cdnUrl} 
          alt="CDN image"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      );
      
      await waitFor(() => {
        const img = screen.getByAltText('CDN image');
        expect(img).toHaveAttribute('sizes', '(max-width: 768px) 100vw, 50vw');
      });
    });

    it('should use default sizes attribute', async () => {
      const cdnUrl = 'https://example.b-cdn.net/image.jpg';
      
      render(<OptimizedImage src={cdnUrl} alt="CDN image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('CDN image');
        expect(img).toHaveAttribute('sizes', '100vw');
      });
    });
  });

  describe('Lazy Loading Behavior', () => {
    it('should not render image until in viewport', () => {
      const { container } = render(
        <OptimizedImage src="https://example.com/image.jpg" alt="Test image" />
      );
      
      // Initially, image should not be rendered
      expect(screen.queryByAltText('Test image')).not.toBeInTheDocument();
      expect(container.querySelector('.image-placeholder')).toBeInTheDocument();
    });

    it('should render image when intersecting', async () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Test image')).toBeInTheDocument();
      });
    });

    it('should disconnect observer after intersection', async () => {
      const disconnectSpy = jest.spyOn(MockIntersectionObserver.prototype, 'disconnect');
      
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Test image')).toBeInTheDocument();
      });
      
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show placeholder while loading', () => {
      const { container } = render(
        <OptimizedImage src="https://example.com/image.jpg" alt="Test image" />
      );
      
      const placeholder = container.querySelector('.image-placeholder');
      expect(placeholder).toBeInTheDocument();
    });

    it('should hide placeholder after image loads', async () => {
      const { container } = render(
        <OptimizedImage src="https://example.com/image.jpg" alt="Test image" />
      );
      
      await waitFor(() => {
        const img = screen.getByAltText('Test image');
        expect(img).toBeInTheDocument();
      });
      
      // Simulate image load
      const img = screen.getByAltText('Test image');
      act(() => {
        img.dispatchEvent(new Event('load'));
      });
      
      await waitFor(() => {
        const placeholder = container.querySelector('.image-placeholder');
        expect(placeholder).not.toBeInTheDocument();
      });
    });

    it('should handle onLoad event', async () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('Test image');
        expect(img).toBeInTheDocument();
      });
      
      const img = screen.getByAltText('Test image');
      
      act(() => {
        img.dispatchEvent(new Event('load'));
      });
      
      // After load, image should be visible (opacity would be 1 in real scenario)
      expect(img).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error message on image load failure', async () => {
      const { container } = render(
        <OptimizedImage src="https://example.com/broken-image.jpg" alt="Test image" />
      );
      
      await waitFor(() => {
        const img = screen.getByAltText('Test image');
        expect(img).toBeInTheDocument();
      });
      
      const img = screen.getByAltText('Test image');
      
      act(() => {
        img.dispatchEvent(new Event('error'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load image')).toBeInTheDocument();
      });
    });

    it('should hide placeholder on error', async () => {
      const { container } = render(
        <OptimizedImage src="https://example.com/broken-image.jpg" alt="Test image" />
      );
      
      await waitFor(() => {
        const img = screen.getByAltText('Test image');
        expect(img).toBeInTheDocument();
      });
      
      const img = screen.getByAltText('Test image');
      
      act(() => {
        img.dispatchEvent(new Event('error'));
      });
      
      await waitFor(() => {
        const placeholder = container.querySelector('.image-placeholder');
        expect(placeholder).not.toBeInTheDocument();
      });
    });

    it('should not show image after error', async () => {
      render(<OptimizedImage src="https://example.com/broken-image.jpg" alt="Test image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('Test image');
        expect(img).toBeInTheDocument();
      });
      
      const img = screen.getByAltText('Test image');
      
      act(() => {
        img.dispatchEvent(new Event('error'));
      });
      
      await waitFor(() => {
        expect(screen.queryByAltText('Test image')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases - Props', () => {
    it('should handle undefined src', () => {
      render(<OptimizedImage src={undefined} alt="Test image" />);
      
      // Should not crash
      expect(screen.queryByAltText('Test image')).not.toBeInTheDocument();
    });

    it('should handle null src', () => {
      render(<OptimizedImage src={null} alt="Test image" />);
      
      // Should not crash
      expect(screen.queryByAltText('Test image')).not.toBeInTheDocument();
    });

    it('should handle empty string src', () => {
      render(<OptimizedImage src="" alt="Test image" />);
      
      // Should not crash
      expect(screen.queryByAltText('Test image')).not.toBeInTheDocument();
    });

    it('should handle missing alt attribute', async () => {
      render(<OptimizedImage src="https://example.com/image.jpg" />);
      
      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
      });
    });

    it('should handle undefined className', () => {
      const { container } = render(
        <OptimizedImage src="https://example.com/image.jpg" alt="Test image" />
      );
      
      const imageContainer = container.querySelector('.optimized-image-container');
      expect(imageContainer).toBeInTheDocument();
      expect(imageContainer.className).toBe('optimized-image-container ');
    });

    it('should handle undefined width and height', () => {
      const { container } = render(
        <OptimizedImage src="https://example.com/image.jpg" alt="Test image" />
      );
      
      const imageContainer = container.querySelector('.optimized-image-container');
      expect(imageContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases - Various Image URLs', () => {
    it('should handle data URLs', async () => {
      const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      render(<OptimizedImage src={dataUrl} alt="Data URL image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('Data URL image');
        expect(img).toHaveAttribute('src', dataUrl);
      });
    });

    it('should handle relative URLs', async () => {
      const relativeUrl = '/images/photo.jpg';
      
      render(<OptimizedImage src={relativeUrl} alt="Relative URL image" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('Relative URL image');
        expect(img).toHaveAttribute('src', relativeUrl);
      });
    });

    it('should handle URLs with query parameters', async () => {
      const urlWithParams = 'https://example.com/image.jpg?v=123&cache=bust';
      
      render(<OptimizedImage src={urlWithParams} alt="URL with params" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('URL with params');
        expect(img).toHaveAttribute('src', urlWithParams);
      });
    });

    it('should handle URLs with hash fragments', async () => {
      const urlWithHash = 'https://example.com/image.jpg#section';
      
      render(<OptimizedImage src={urlWithHash} alt="URL with hash" />);
      
      await waitFor(() => {
        const img = screen.getByAltText('URL with hash');
        expect(img).toHaveAttribute('src', urlWithHash);
      });
    });
  });

  describe('Component Cleanup', () => {
    it('should disconnect observer on unmount', () => {
      const disconnectSpy = jest.spyOn(MockIntersectionObserver.prototype, 'disconnect');
      
      const { unmount } = render(
        <OptimizedImage src="https://example.com/image.jpg" alt="Test image" />
      );
      
      unmount();
      
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should clean up resources properly', () => {
      const { unmount, container } = render(
        <OptimizedImage src="https://example.com/image.jpg" alt="Test image" />
      );
      
      expect(container.firstChild).toBeInTheDocument();
      
      unmount();
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role for image', async () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
      });
    });

    it('should provide alt text for screen readers', async () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Accessible image description" />);
      
      await waitFor(() => {
        expect(screen.getByAltText('Accessible image description')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should use Intersection Observer for lazy loading', () => {
      const observeSpy = jest.spyOn(MockIntersectionObserver.prototype, 'observe');
      
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      expect(observeSpy).toHaveBeenCalled();
    });

    it('should load image with 50px rootMargin', () => {
      let capturedOptions;
      
      const OriginalObserver = global.IntersectionObserver;
      global.IntersectionObserver = class extends MockIntersectionObserver {
        constructor(callback, options) {
          super(callback, options);
          capturedOptions = options;
        }
      };
      
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      expect(capturedOptions.rootMargin).toBe('50px');
      
      global.IntersectionObserver = OriginalObserver;
    });

    it('should have threshold of 0.01', () => {
      let capturedOptions;
      
      const OriginalObserver = global.IntersectionObserver;
      global.IntersectionObserver = class extends MockIntersectionObserver {
        constructor(callback, options) {
          super(callback, options);
          capturedOptions = options;
        }
      };
      
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" />);
      
      expect(capturedOptions.threshold).toBe(0.01);
      
      global.IntersectionObserver = OriginalObserver;
    });
  });
});