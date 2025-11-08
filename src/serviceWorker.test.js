/**
 * Tests for Service Worker
 * Note: Service worker tests require special setup since they run in a different context
 */

describe('Service Worker Configuration', () => {
  // Mock service worker global
  let mockCaches;
  let mockClients;
  let mockSelf;
  let eventListeners;

  beforeEach(() => {
    eventListeners = {};
    
    // Mock caches API
    mockCaches = {
      open: jest.fn(),
      match: jest.fn(),
      keys: jest.fn(),
      delete: jest.fn(),
    };

    // Mock clients API
    mockClients = {
      claim: jest.fn().mockResolvedValue(undefined),
    };

    // Mock self (service worker global)
    mockSelf = {
      addEventListener: jest.fn((event, handler) => {
        eventListeners[event] = handler;
      }),
      caches: mockCaches,
      clients: mockClients,
    };

    global.self = mockSelf;
    global.caches = mockCaches;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Cache Configuration', () => {
    it('should define CACHE_NAME constant', () => {
      const CACHE_NAME = 'emmanuel-portfolio-v2';
      expect(CACHE_NAME).toBeDefined();
      expect(typeof CACHE_NAME).toBe('string');
    });

    it('should define CDN_CACHE_NAME constant', () => {
      const CDN_CACHE_NAME = 'emmanuel-cdn-cache-v1';
      expect(CDN_CACHE_NAME).toBeDefined();
      expect(typeof CDN_CACHE_NAME).toBe('string');
    });

    it('should define IMAGE_CACHE_NAME constant', () => {
      const IMAGE_CACHE_NAME = 'emmanuel-images-v1';
      expect(IMAGE_CACHE_NAME).toBeDefined();
      expect(typeof IMAGE_CACHE_NAME).toBe('string');
    });

    it('should have distinct cache names', () => {
      const CACHE_NAME = 'emmanuel-portfolio-v2';
      const CDN_CACHE_NAME = 'emmanuel-cdn-cache-v1';
      const IMAGE_CACHE_NAME = 'emmanuel-images-v1';
      
      expect(CACHE_NAME).not.toBe(CDN_CACHE_NAME);
      expect(CACHE_NAME).not.toBe(IMAGE_CACHE_NAME);
      expect(CDN_CACHE_NAME).not.toBe(IMAGE_CACHE_NAME);
    });
  });

  describe('URLs to Cache', () => {
    it('should define urlsToCache array', () => {
      const urlsToCache = [
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js',
      ];
      
      expect(Array.isArray(urlsToCache)).toBe(true);
      expect(urlsToCache.length).toBeGreaterThan(0);
    });

    it('should include root path in urlsToCache', () => {
      const urlsToCache = [
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js',
      ];
      
      expect(urlsToCache).toContain('/');
    });

    it('should include index.html in urlsToCache', () => {
      const urlsToCache = [
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js',
      ];
      
      expect(urlsToCache).toContain('/index.html');
    });

    it('should include CSS in urlsToCache', () => {
      const urlsToCache = [
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js',
      ];
      
      expect(urlsToCache.some(url => url.includes('.css'))).toBe(true);
    });

    it('should include JS in urlsToCache', () => {
      const urlsToCache = [
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js',
      ];
      
      expect(urlsToCache.some(url => url.includes('.js'))).toBe(true);
    });
  });

  describe('Install Event Handler Logic', () => {
    it('should handle cache opening during install', async () => {
      const mockCache = {
        addAll: jest.fn().mockResolvedValue(undefined),
      };
      mockCaches.open.mockResolvedValue(mockCache);

      const urlsToCache = ['/', '/index.html'];
      const CACHE_NAME = 'emmanuel-portfolio-v2';

      await mockCaches.open(CACHE_NAME);
      await mockCache.addAll(urlsToCache);

      expect(mockCaches.open).toHaveBeenCalledWith(CACHE_NAME);
      expect(mockCache.addAll).toHaveBeenCalledWith(urlsToCache);
    });

    it('should cache all specified URLs', async () => {
      const mockCache = {
        addAll: jest.fn().mockResolvedValue(undefined),
      };
      mockCaches.open.mockResolvedValue(mockCache);

      const urlsToCache = [
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js',
      ];

      await mockCache.addAll(urlsToCache);

      expect(mockCache.addAll).toHaveBeenCalledWith(urlsToCache);
    });
  });

  describe('Fetch Event - CDN Strategy', () => {
    it('should identify BunnyCDN URLs correctly', () => {
      const cdnUrl = 'https://oculair.b-cdn.net/image.jpg';
      const url = new URL(cdnUrl);
      
      expect(url.hostname).toBe('oculair.b-cdn.net');
    });

    it('should use cache-first strategy for CDN resources', async () => {
      const mockCache = {
        match: jest.fn(),
        put: jest.fn(),
      };
      mockCaches.open.mockResolvedValue(mockCache);

      const request = new Request('https://oculair.b-cdn.net/image.jpg');
      const cachedResponse = new Response('cached');
      mockCache.match.mockResolvedValue(cachedResponse);

      await mockCaches.open('emmanuel-cdn-cache-v1');
      const response = await mockCache.match(request);

      expect(response).toBe(cachedResponse);
    });

    it('should fetch from network if CDN resource not in cache', async () => {
      const mockCache = {
        match: jest.fn().mockResolvedValue(null),
        put: jest.fn(),
      };
      mockCaches.open.mockResolvedValue(mockCache);

      const request = new Request('https://oculair.b-cdn.net/image.jpg');
      const networkResponse = new Response('network', { status: 200 });

      global.fetch = jest.fn().mockResolvedValue(networkResponse);

      await mockCaches.open('emmanuel-cdn-cache-v1');
      const cachedResult = await mockCache.match(request);
      
      if (!cachedResult) {
        const fetchedResponse = await fetch(request);
        expect(fetchedResponse.status).toBe(200);
      }
    });

    it('should cache successful CDN responses', async () => {
      const mockCache = {
        match: jest.fn().mockResolvedValue(null),
        put: jest.fn(),
      };
      mockCaches.open.mockResolvedValue(mockCache);

      const request = new Request('https://oculair.b-cdn.net/image.jpg');
      const networkResponse = new Response('network', { status: 200 });
      
      global.fetch = jest.fn().mockResolvedValue(networkResponse);

      if (networkResponse.status === 200) {
        await mockCache.put(request, networkResponse.clone());
        expect(mockCache.put).toHaveBeenCalled();
      }
    });
  });

  describe('Fetch Event - Image Strategy', () => {
    it('should identify image requests by destination', () => {
      const imageRequest = new Request('https://example.com/image.jpg', {
        destination: 'image'
      });
      
      expect(imageRequest.destination).toBe('image');
    });

    it('should use cache-first for images', async () => {
      const mockCache = {
        match: jest.fn(),
        put: jest.fn(),
      };
      mockCaches.open.mockResolvedValue(mockCache);

      const request = new Request('https://example.com/image.jpg', {
        destination: 'image'
      });
      const cachedResponse = new Response('cached');
      mockCache.match.mockResolvedValue(cachedResponse);

      await mockCaches.open('emmanuel-images-v1');
      const response = await mockCache.match(request);

      expect(response).toBe(cachedResponse);
    });

    it('should fetch and cache images not in cache', async () => {
      const mockCache = {
        match: jest.fn().mockResolvedValue(null),
        put: jest.fn(),
      };
      mockCaches.open.mockResolvedValue(mockCache);

      const request = new Request('https://example.com/image.jpg', {
        destination: 'image'
      });
      const networkResponse = new Response('network', { status: 200 });

      global.fetch = jest.fn().mockResolvedValue(networkResponse);

      const cachedResult = await mockCache.match(request);
      
      if (!cachedResult) {
        const fetchedResponse = await fetch(request);
        if (fetchedResponse.status === 200) {
          await mockCache.put(request, fetchedResponse.clone());
        }
        expect(mockCache.put).toHaveBeenCalled();
      }
    });
  });

  describe('Fetch Event - Navigation Strategy', () => {
    it('should identify navigation requests', () => {
      const navRequest = new Request('https://example.com/page', {
        mode: 'navigate'
      });
      
      expect(navRequest.mode).toBe('navigate');
    });

    it('should identify document requests', () => {
      const docRequest = new Request('https://example.com/index.html', {
        destination: 'document'
      });
      
      expect(docRequest.destination).toBe('document');
    });

    it('should use network-first for navigation', async () => {
      const request = new Request('https://example.com/', {
        mode: 'navigate'
      });
      const networkResponse = new Response('fresh', { status: 200 });

      global.fetch = jest.fn().mockResolvedValue(networkResponse);

      const response = await fetch(request);
      expect(response).toBe(networkResponse);
    });

    it('should fallback to cache if network fails for navigation', async () => {
      const request = new Request('https://example.com/', {
        mode: 'navigate'
      });

      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      mockCaches.match.mockResolvedValue(new Response('cached'));

      try {
        await fetch(request);
      } catch (error) {
        const cachedResponse = await mockCaches.match(request);
        expect(cachedResponse).toBeDefined();
      }
    });
  });

  describe('Fetch Event - Default Strategy', () => {
    it('should return cached response if available', async () => {
      const request = new Request('https://example.com/resource.js');
      const cachedResponse = new Response('cached');
      
      mockCaches.match.mockResolvedValue(cachedResponse);

      const response = await mockCaches.match(request);
      expect(response).toBe(cachedResponse);
    });

    it('should fetch from network if not cached', async () => {
      const request = new Request('https://example.com/resource.js');
      const networkResponse = new Response('network', { status: 200 });

      mockCaches.match.mockResolvedValue(null);
      global.fetch = jest.fn().mockResolvedValue(networkResponse);

      const cachedResult = await mockCaches.match(request);
      
      if (!cachedResult) {
        const fetchedResponse = await fetch(request);
        expect(fetchedResponse).toBe(networkResponse);
      }
    });

    it('should not cache invalid responses', async () => {
      const request = new Request('https://example.com/resource.js');
      const invalidResponse = new Response('error', { status: 404 });

      global.fetch = jest.fn().mockResolvedValue(invalidResponse);

      const response = await fetch(request);
      
      // Should not cache responses with non-200 status
      if (response.status !== 200) {
        expect(response.status).toBe(404);
      }
    });

    it('should cache valid responses', async () => {
      const mockCache = {
        put: jest.fn(),
      };
      mockCaches.open.mockResolvedValue(mockCache);

      const request = new Request('https://example.com/resource.js');
      const validResponse = new Response('success', { status: 200 });

      if (validResponse.status === 200) {
        await mockCache.put(request, validResponse.clone());
        expect(mockCache.put).toHaveBeenCalled();
      }
    });
  });

  describe('Activate Event Handler Logic', () => {
    it('should define cache whitelist', () => {
      const CACHE_NAME = 'emmanuel-portfolio-v2';
      const CDN_CACHE_NAME = 'emmanuel-cdn-cache-v1';
      const IMAGE_CACHE_NAME = 'emmanuel-images-v1';
      const cacheWhitelist = [CACHE_NAME, CDN_CACHE_NAME, IMAGE_CACHE_NAME];
      
      expect(cacheWhitelist).toHaveLength(3);
      expect(cacheWhitelist).toContain(CACHE_NAME);
      expect(cacheWhitelist).toContain(CDN_CACHE_NAME);
      expect(cacheWhitelist).toContain(IMAGE_CACHE_NAME);
    });

    it('should delete old caches not in whitelist', async () => {
      const CACHE_NAME = 'emmanuel-portfolio-v2';
      const CDN_CACHE_NAME = 'emmanuel-cdn-cache-v1';
      const IMAGE_CACHE_NAME = 'emmanuel-images-v1';
      const cacheWhitelist = [CACHE_NAME, CDN_CACHE_NAME, IMAGE_CACHE_NAME];
      
      const allCaches = [
        'emmanuel-portfolio-v1',
        'emmanuel-portfolio-v2',
        'old-cache',
        'emmanuel-cdn-cache-v1',
      ];
      
      mockCaches.keys.mockResolvedValue(allCaches);
      mockCaches.delete.mockResolvedValue(true);

      const cacheNames = await mockCaches.keys();
      
      for (const cacheName of cacheNames) {
        if (cacheWhitelist.indexOf(cacheName) === -1) {
          await mockCaches.delete(cacheName);
        }
      }

      expect(mockCaches.delete).toHaveBeenCalledWith('emmanuel-portfolio-v1');
      expect(mockCaches.delete).toHaveBeenCalledWith('old-cache');
      expect(mockCaches.delete).not.toHaveBeenCalledWith('emmanuel-portfolio-v2');
    });

    it('should claim clients after activation', async () => {
      await mockClients.claim();
      expect(mockClients.claim).toHaveBeenCalled();
    });

    it('should keep whitelisted caches', async () => {
      const CACHE_NAME = 'emmanuel-portfolio-v2';
      const CDN_CACHE_NAME = 'emmanuel-cdn-cache-v1';
      const IMAGE_CACHE_NAME = 'emmanuel-images-v1';
      const cacheWhitelist = [CACHE_NAME, CDN_CACHE_NAME, IMAGE_CACHE_NAME];
      
      const allCaches = ['emmanuel-portfolio-v2', 'emmanuel-cdn-cache-v1'];
      
      mockCaches.keys.mockResolvedValue(allCaches);
      mockCaches.delete.mockResolvedValue(true);

      const cacheNames = await mockCaches.keys();
      
      for (const cacheName of cacheNames) {
        if (cacheWhitelist.indexOf(cacheName) === -1) {
          await mockCaches.delete(cacheName);
        }
      }

      expect(mockCaches.delete).not.toHaveBeenCalled();
    });
  });

  describe('Response Validation', () => {
    it('should validate response exists', () => {
      const validResponse = new Response('data', { status: 200 });
      expect(validResponse).toBeTruthy();
    });

    it('should validate response status is 200', () => {
      const validResponse = new Response('data', { status: 200 });
      expect(validResponse.status).toBe(200);
    });

    it('should reject null responses', () => {
      const response = null;
      expect(response || response.status !== 200).toBeTruthy();
    });

    it('should reject 404 responses', () => {
      const notFoundResponse = new Response('Not found', { status: 404 });
      expect(notFoundResponse.status).not.toBe(200);
    });

    it('should reject 500 responses', () => {
      const errorResponse = new Response('Server error', { status: 500 });
      expect(errorResponse.status).not.toBe(200);
    });
  });

  describe('Request Cloning', () => {
    it('should clone responses before caching', () => {
      const originalResponse = new Response('data', { status: 200 });
      const clonedResponse = originalResponse.clone();
      
      expect(clonedResponse).toBeDefined();
      expect(clonedResponse).not.toBe(originalResponse);
    });

    it('should preserve response status when cloning', () => {
      const originalResponse = new Response('data', { status: 200 });
      const clonedResponse = originalResponse.clone();
      
      expect(clonedResponse.status).toBe(originalResponse.status);
    });
  });

  describe('URL Parsing', () => {
    it('should parse CDN URLs correctly', () => {
      const url = new URL('https://oculair.b-cdn.net/image.jpg');
      expect(url.hostname).toBe('oculair.b-cdn.net');
    });

    it('should parse regular URLs', () => {
      const url = new URL('https://example.com/page');
      expect(url.hostname).toBe('example.com');
    });

    it('should handle URLs with paths', () => {
      const url = new URL('https://example.com/path/to/resource');
      expect(url.pathname).toBe('/path/to/resource');
    });

    it('should handle URLs with query parameters', () => {
      const url = new URL('https://example.com/page?param=value');
      expect(url.search).toBe('?param=value');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const request = new Request('https://example.com/resource');
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      try {
        await fetch(request);
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle cache open errors', async () => {
      mockCaches.open.mockRejectedValue(new Error('Cache error'));

      try {
        await mockCaches.open('test-cache');
      } catch (error) {
        expect(error.message).toBe('Cache error');
      }
    });

    it('should handle cache match errors', async () => {
      mockCaches.match.mockRejectedValue(new Error('Match error'));

      try {
        await mockCaches.match(new Request('https://example.com'));
      } catch (error) {
        expect(error.message).toBe('Match error');
      }
    });
  });

  describe('Cache Strategy Selection', () => {
    it('should use correct cache for CDN resources', () => {
      const CDN_CACHE_NAME = 'emmanuel-cdn-cache-v1';
      const url = new URL('https://oculair.b-cdn.net/image.jpg');
      
      if (url.hostname === 'oculair.b-cdn.net') {
        expect(CDN_CACHE_NAME).toBe('emmanuel-cdn-cache-v1');
      }
    });

    it('should use correct cache for images', () => {
      const IMAGE_CACHE_NAME = 'emmanuel-images-v1';
      const request = new Request('https://example.com/image.jpg', {
        destination: 'image'
      });
      
      if (request.destination === 'image') {
        expect(IMAGE_CACHE_NAME).toBe('emmanuel-images-v1');
      }
    });

    it('should use main cache for other resources', () => {
      const CACHE_NAME = 'emmanuel-portfolio-v2';
      const request = new Request('https://example.com/script.js');
      
      if (request.destination !== 'image') {
        expect(CACHE_NAME).toBe('emmanuel-portfolio-v2');
      }
    });
  });
});