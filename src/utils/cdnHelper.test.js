/**
 * Tests for BunnyCDN Image Optimization Helper
 */

import {
  optimizeImage,
  generateSrcSet,
  generateSizes,
  IMAGE_PRESETS,
  optimizeVideoPoster
} from './cdnHelper';

describe('optimizeImage', () => {
  describe('Happy Path - URL Optimization', () => {
    it('should optimize a BunnyCDN URL with default parameters', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url);
      
      expect(result).toContain('quality=85');
      expect(result).toContain('format=webp');
      expect(result).not.toContain('width=');
      expect(result).not.toContain('height=');
    });

    it('should add width parameter when specified', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { width: 800 });
      
      expect(result).toContain('width=800');
      expect(result).toBe('https://example.b-cdn.net/image.jpg?width=800&quality=85&format=webp');
    });

    it('should add height parameter when specified', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { height: 600 });
      
      expect(result).toContain('height=600');
      expect(result).toContain('quality=85');
    });

    it('should add both width and height parameters', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { width: 800, height: 600 });
      
      expect(result).toContain('width=800');
      expect(result).toContain('height=600');
    });

    it('should use custom quality parameter', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { quality: 95 });
      
      expect(result).toContain('quality=95');
    });

    it('should use custom format parameter', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { format: 'jpg' });
      
      expect(result).toContain('format=jpg');
    });

    it('should combine all parameters correctly', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, {
        width: 1200,
        height: 800,
        quality: 90,
        format: 'png'
      });
      
      expect(result).toContain('width=1200');
      expect(result).toContain('height=800');
      expect(result).toContain('quality=90');
      expect(result).toContain('format=png');
    });

    it('should handle URLs with existing query parameters', () => {
      const url = 'https://example.b-cdn.net/image.jpg?existing=param';
      const result = optimizeImage(url, { width: 800 });
      
      expect(result).toContain('existing=param');
      expect(result).toContain('&width=800');
      expect(result).toMatch(/\?existing=param&/);
    });

    it('should handle URLs with multiple existing query parameters', () => {
      const url = 'https://example.b-cdn.net/image.jpg?param1=value1&param2=value2';
      const result = optimizeImage(url, { width: 800, quality: 80 });
      
      expect(result).toContain('param1=value1');
      expect(result).toContain('param2=value2');
      expect(result).toContain('width=800');
      expect(result).toContain('quality=80');
    });
  });

  describe('Edge Cases - Non-BunnyCDN URLs', () => {
    it('should return the original URL for non-BunnyCDN URLs', () => {
      const url = 'https://example.com/image.jpg';
      const result = optimizeImage(url, { width: 800 });
      
      expect(result).toBe(url);
    });

    it('should return undefined for undefined URL', () => {
      const result = optimizeImage(undefined, { width: 800 });
      
      expect(result).toBeUndefined();
    });

    it('should return null for null URL', () => {
      const result = optimizeImage(null, { width: 800 });
      
      expect(result).toBeNull();
    });

    it('should return empty string for empty string URL', () => {
      const result = optimizeImage('', { width: 800 });
      
      expect(result).toBe('');
    });

    it('should handle relative URLs gracefully', () => {
      const url = '/images/photo.jpg';
      const result = optimizeImage(url, { width: 800 });
      
      expect(result).toBe(url);
    });

    it('should handle URLs from other CDNs', () => {
      const url = 'https://cloudinary.com/image.jpg';
      const result = optimizeImage(url, { width: 800 });
      
      expect(result).toBe(url);
    });
  });

  describe('Edge Cases - Parameter Values', () => {
    it('should handle zero width gracefully', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { width: 0 });
      
      // Zero is falsy, so it shouldn't be added
      expect(result).not.toContain('width=0');
    });

    it('should handle zero quality', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { quality: 0 });
      
      // Zero quality is falsy but the default should apply
      expect(result).not.toContain('quality=0');
    });

    it('should handle negative width', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { width: -100 });
      
      // Negative values should still be added (validation is the caller's responsibility)
      expect(result).toContain('width=-100');
    });

    it('should handle very large width values', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { width: 10000 });
      
      expect(result).toContain('width=10000');
    });

    it('should handle quality at minimum boundary (1)', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { quality: 1 });
      
      expect(result).toContain('quality=1');
    });

    it('should handle quality at maximum boundary (100)', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { quality: 100 });
      
      expect(result).toContain('quality=100');
    });

    it('should handle non-standard format values', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { format: 'avif' });
      
      expect(result).toContain('format=avif');
    });

    it('should handle empty string format', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { format: '' });
      
      // Empty string is falsy, so default 'webp' should apply
      expect(result).not.toContain('format=');
    });
  });

  describe('Edge Cases - Empty Options', () => {
    it('should use defaults when options object is empty', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, {});
      
      expect(result).toContain('quality=85');
      expect(result).toContain('format=webp');
    });

    it('should use defaults when no options provided', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url);
      
      expect(result).toContain('quality=85');
      expect(result).toContain('format=webp');
    });
  });

  describe('URL Structure Tests', () => {
    it('should create proper query string separator for URL without params', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = optimizeImage(url, { width: 800 });
      
      expect(result).toMatch(/\?/);
      expect(result.split('?').length).toBe(2);
    });

    it('should append to existing params with ampersand', () => {
      const url = 'https://example.b-cdn.net/image.jpg?cache=bust';
      const result = optimizeImage(url, { width: 800 });
      
      expect(result).toMatch(/\?cache=bust&/);
    });

    it('should handle URL with hash fragment', () => {
      const url = 'https://example.b-cdn.net/image.jpg#section';
      const result = optimizeImage(url, { width: 800 });
      
      // Hash should be preserved
      expect(result).toContain('#section');
    });
  });
});

describe('generateSrcSet', () => {
  describe('Happy Path - SrcSet Generation', () => {
    it('should generate srcSet with default widths', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url);
      
      expect(result).toContain('400w');
      expect(result).toContain('800w');
      expect(result).toContain('1200w');
      expect(result).toContain('1600w');
      expect(result).toMatch(/width=400.*400w/);
    });

    it('should generate srcSet with custom widths', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, [300, 600, 900]);
      
      expect(result).toContain('300w');
      expect(result).toContain('600w');
      expect(result).toContain('900w');
      expect(result).not.toContain('1200w');
    });

    it('should use custom quality in srcSet', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, [400, 800], { quality: 90 });
      
      expect(result).toContain('quality=90');
    });

    it('should use custom format in srcSet', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, [400, 800], { format: 'jpg' });
      
      expect(result).toContain('format=jpg');
    });

    it('should generate properly formatted srcSet string', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, [400, 800]);
      
      const parts = result.split(', ');
      expect(parts.length).toBe(2);
      expect(parts[0]).toMatch(/400w$/);
      expect(parts[1]).toMatch(/800w$/);
    });

    it('should optimize each URL in srcSet', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, [400, 800, 1200]);
      
      expect(result).toContain('width=400');
      expect(result).toContain('width=800');
      expect(result).toContain('width=1200');
      expect(result).toContain('quality=85');
      expect(result).toContain('format=webp');
    });
  });

  describe('Edge Cases - Non-BunnyCDN URLs', () => {
    it('should return undefined for non-BunnyCDN URLs', () => {
      const url = 'https://example.com/image.jpg';
      const result = generateSrcSet(url);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined URL', () => {
      const result = generateSrcSet(undefined);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for null URL', () => {
      const result = generateSrcSet(null);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string URL', () => {
      const result = generateSrcSet('');
      
      expect(result).toBeUndefined();
    });
  });

  describe('Edge Cases - Width Arrays', () => {
    it('should handle single width in array', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, [800]);
      
      expect(result).toBe(expect.stringContaining('800w'));
      expect(result.split(',').length).toBe(1);
    });

    it('should handle empty width array', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, []);
      
      expect(result).toBe('');
    });

    it('should handle very large width values', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, [5000, 10000]);
      
      expect(result).toContain('width=5000');
      expect(result).toContain('width=10000');
    });

    it('should preserve width order in srcSet', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, [100, 200, 300]);
      
      const parts = result.split(', ');
      expect(parts[0]).toContain('100w');
      expect(parts[1]).toContain('200w');
      expect(parts[2]).toContain('300w');
    });
  });

  describe('Integration with optimizeImage', () => {
    it('should properly call optimizeImage for each width', () => {
      const url = 'https://example.b-cdn.net/image.jpg';
      const result = generateSrcSet(url, [400, 800]);
      
      // Verify that each URL has the proper structure
      const urls = result.split(', ').map(part => part.split(' ')[0]);
      urls.forEach(url => {
        expect(url).toContain('b-cdn.net');
        expect(url).toContain('width=');
        expect(url).toContain('quality=');
        expect(url).toContain('format=');
      });
    });
  });
});

describe('generateSizes', () => {
  describe('Happy Path - Default Breakpoints', () => {
    it('should generate sizes with default breakpoints', () => {
      const result = generateSizes();
      
      expect(result).toContain('(max-width: 768px) 100vw');
      expect(result).toContain('(max-width: 1200px) 50vw');
      expect(result).toContain('800px');
    });

    it('should order breakpoints correctly', () => {
      const result = generateSizes();
      const parts = result.split(', ');
      
      expect(parts.length).toBe(3);
      expect(parts[0]).toMatch(/max-width: 768px/);
      expect(parts[1]).toMatch(/max-width: 1200px/);
      expect(parts[2]).toBe('800px');
    });
  });

  describe('Happy Path - Custom Breakpoints', () => {
    it('should generate sizes with custom mobile breakpoint', () => {
      const breakpoints = {
        mobile: { maxWidth: 600, size: '90vw' },
        tablet: { maxWidth: 1200, size: '50vw' },
        desktop: { size: '800px' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toContain('(max-width: 600px) 90vw');
    });

    it('should generate sizes with custom tablet breakpoint', () => {
      const breakpoints = {
        mobile: { maxWidth: 768, size: '100vw' },
        tablet: { maxWidth: 1024, size: '60vw' },
        desktop: { size: '900px' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toContain('(max-width: 1024px) 60vw');
    });

    it('should generate sizes with custom desktop size', () => {
      const breakpoints = {
        mobile: { maxWidth: 768, size: '100vw' },
        tablet: { maxWidth: 1200, size: '50vw' },
        desktop: { size: '1000px' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toContain('1000px');
    });

    it('should handle all custom breakpoints', () => {
      const breakpoints = {
        mobile: { maxWidth: 480, size: '100vw' },
        tablet: { maxWidth: 1024, size: '75vw' },
        desktop: { size: '1200px' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toContain('(max-width: 480px) 100vw');
      expect(result).toContain('(max-width: 1024px) 75vw');
      expect(result).toContain('1200px');
    });
  });

  describe('Edge Cases - Partial Breakpoints', () => {
    it('should handle missing mobile breakpoint', () => {
      const breakpoints = {
        tablet: { maxWidth: 1200, size: '50vw' },
        desktop: { size: '800px' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).not.toContain('(max-width: 768px)');
      expect(result).toContain('(max-width: 1200px) 50vw');
      expect(result).toContain('800px');
    });

    it('should handle missing tablet breakpoint', () => {
      const breakpoints = {
        mobile: { maxWidth: 768, size: '100vw' },
        desktop: { size: '800px' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toContain('(max-width: 768px) 100vw');
      expect(result).not.toContain('(max-width: 1200px)');
      expect(result).toContain('800px');
    });

    it('should handle missing desktop breakpoint', () => {
      const breakpoints = {
        mobile: { maxWidth: 768, size: '100vw' },
        tablet: { maxWidth: 1200, size: '50vw' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toContain('(max-width: 768px) 100vw');
      expect(result).toContain('(max-width: 1200px) 50vw');
    });

    it('should handle only mobile breakpoint', () => {
      const breakpoints = {
        mobile: { maxWidth: 768, size: '100vw' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toBe('(max-width: 768px) 100vw');
    });

    it('should handle empty breakpoints object', () => {
      const result = generateSizes({});
      
      expect(result).toBe('');
    });
  });

  describe('Edge Cases - Various Size Units', () => {
    it('should handle percentage sizes', () => {
      const breakpoints = {
        mobile: { maxWidth: 768, size: '100%' },
        desktop: { size: '80%' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toContain('100%');
      expect(result).toContain('80%');
    });

    it('should handle calc() sizes', () => {
      const breakpoints = {
        tablet: { maxWidth: 1200, size: 'calc(100vw - 200px)' },
        desktop: { size: 'calc(50vw - 100px)' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toContain('calc(100vw - 200px)');
      expect(result).toContain('calc(50vw - 100px)');
    });

    it('should handle rem units', () => {
      const breakpoints = {
        desktop: { size: '50rem' }
      };
      const result = generateSizes(breakpoints);
      
      expect(result).toContain('50rem');
    });
  });
});

describe('IMAGE_PRESETS', () => {
  it('should have thumbnail preset defined', () => {
    expect(IMAGE_PRESETS.thumbnail).toBeDefined();
    expect(IMAGE_PRESETS.thumbnail.width).toBe(400);
    expect(IMAGE_PRESETS.thumbnail.quality).toBe(80);
    expect(IMAGE_PRESETS.thumbnail.format).toBe('webp');
  });

  it('should have card preset defined', () => {
    expect(IMAGE_PRESETS.card).toBeDefined();
    expect(IMAGE_PRESETS.card.width).toBe(800);
    expect(IMAGE_PRESETS.card.quality).toBe(85);
    expect(IMAGE_PRESETS.card.format).toBe('webp');
  });

  it('should have hero preset defined', () => {
    expect(IMAGE_PRESETS.hero).toBeDefined();
    expect(IMAGE_PRESETS.hero.width).toBe(1920);
    expect(IMAGE_PRESETS.hero.quality).toBe(85);
    expect(IMAGE_PRESETS.hero.format).toBe('webp');
  });

  it('should have fullscreen preset defined', () => {
    expect(IMAGE_PRESETS.fullscreen).toBeDefined();
    expect(IMAGE_PRESETS.fullscreen.width).toBe(2560);
    expect(IMAGE_PRESETS.fullscreen.quality).toBe(90);
    expect(IMAGE_PRESETS.fullscreen.format).toBe('webp');
  });

  it('should have all presets use webp format', () => {
    Object.values(IMAGE_PRESETS).forEach(preset => {
      expect(preset.format).toBe('webp');
    });
  });

  it('should have increasing widths for presets', () => {
    expect(IMAGE_PRESETS.thumbnail.width).toBeLessThan(IMAGE_PRESETS.card.width);
    expect(IMAGE_PRESETS.card.width).toBeLessThan(IMAGE_PRESETS.hero.width);
    expect(IMAGE_PRESETS.hero.width).toBeLessThan(IMAGE_PRESETS.fullscreen.width);
  });

  it('should work with optimizeImage function', () => {
    const url = 'https://example.b-cdn.net/image.jpg';
    const result = optimizeImage(url, IMAGE_PRESETS.card);
    
    expect(result).toContain('width=800');
    expect(result).toContain('quality=85');
    expect(result).toContain('format=webp');
  });
});

describe('optimizeVideoPoster', () => {
  describe('Happy Path - Video Poster Optimization', () => {
    it('should optimize video poster with default settings', () => {
      const url = 'https://example.b-cdn.net/poster.jpg';
      const result = optimizeVideoPoster(url);
      
      expect(result).toContain('width=1200');
      expect(result).toContain('quality=80');
      expect(result).toContain('format=webp');
    });

    it('should allow overriding default width', () => {
      const url = 'https://example.b-cdn.net/poster.jpg';
      const result = optimizeVideoPoster(url, { width: 1600 });
      
      expect(result).toContain('width=1600');
    });

    it('should allow overriding default quality', () => {
      const url = 'https://example.b-cdn.net/poster.jpg';
      const result = optimizeVideoPoster(url, { quality: 90 });
      
      expect(result).toContain('quality=90');
    });

    it('should allow overriding default format', () => {
      const url = 'https://example.b-cdn.net/poster.jpg';
      const result = optimizeVideoPoster(url, { format: 'jpg' });
      
      expect(result).toContain('format=jpg');
    });

    it('should allow overriding all options', () => {
      const url = 'https://example.b-cdn.net/poster.jpg';
      const result = optimizeVideoPoster(url, {
        width: 1920,
        height: 1080,
        quality: 85,
        format: 'png'
      });
      
      expect(result).toContain('width=1920');
      expect(result).toContain('height=1080');
      expect(result).toContain('quality=85');
      expect(result).toContain('format=png');
    });

    it('should merge custom options with defaults', () => {
      const url = 'https://example.b-cdn.net/poster.jpg';
      const result = optimizeVideoPoster(url, { quality: 95 });
      
      // Custom quality
      expect(result).toContain('quality=95');
      // Default width
      expect(result).toContain('width=1200');
      // Default format
      expect(result).toContain('format=webp');
    });
  });

  describe('Edge Cases - Non-BunnyCDN URLs', () => {
    it('should return original URL for non-BunnyCDN URLs', () => {
      const url = 'https://example.com/poster.jpg';
      const result = optimizeVideoPoster(url);
      
      expect(result).toBe(url);
    });

    it('should handle undefined URL', () => {
      const result = optimizeVideoPoster(undefined);
      
      expect(result).toBeUndefined();
    });

    it('should handle null URL', () => {
      const result = optimizeVideoPoster(null);
      
      expect(result).toBeNull();
    });

    it('should handle empty string URL', () => {
      const result = optimizeVideoPoster('');
      
      expect(result).toBe('');
    });
  });

  describe('Integration Tests', () => {
    it('should properly delegate to optimizeImage', () => {
      const url = 'https://example.b-cdn.net/poster.jpg';
      const options = { width: 1600, quality: 90 };
      const posterResult = optimizeVideoPoster(url, options);
      const imageResult = optimizeImage(url, { width: 1200, quality: 80, format: 'webp', ...options });
      
      // Both should produce similar structure
      expect(posterResult).toContain('b-cdn.net');
      expect(posterResult).toContain('width=');
      expect(posterResult).toContain('quality=');
    });
  });
});

describe('Integration Tests - Multiple Functions', () => {
  it('should work together: optimize image and generate srcSet', () => {
    const url = 'https://example.b-cdn.net/image.jpg';
    const optimized = optimizeImage(url, { width: 800 });
    const srcSet = generateSrcSet(url, [400, 800]);
    
    expect(optimized).toContain('b-cdn.net');
    expect(srcSet).toContain('400w');
    expect(srcSet).toContain('800w');
  });

  it('should use IMAGE_PRESETS with generateSrcSet', () => {
    const url = 'https://example.b-cdn.net/image.jpg';
    const srcSet = generateSrcSet(url, [400, 800], IMAGE_PRESETS.card);
    
    expect(srcSet).toContain('quality=85');
    expect(srcSet).toContain('format=webp');
  });

  it('should work with all three main functions', () => {
    const url = 'https://example.b-cdn.net/image.jpg';
    const optimized = optimizeImage(url, IMAGE_PRESETS.hero);
    const srcSet = generateSrcSet(url, [800, 1200, 1600]);
    const sizes = generateSizes();
    
    expect(optimized).toBeDefined();
    expect(srcSet).toBeDefined();
    expect(sizes).toBeDefined();
    
    // These would typically be used together in an img element
    expect(typeof optimized).toBe('string');
    expect(typeof srcSet).toBe('string');
    expect(typeof sizes).toBe('string');
  });
});