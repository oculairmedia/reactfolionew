const CACHE_NAME = 'emmanuel-portfolio-v2';
const CDN_CACHE_NAME = 'emmanuel-cdn-cache-v1';
const IMAGE_CACHE_NAME = 'emmanuel-images-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy: Cache First for CDN resources (images, videos)
  if (url.hostname === 'oculair.b-cdn.net') {
    event.respondWith(
      caches.open(CDN_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            return response;
          }

          return fetch(request).then(networkResponse => {
            // Cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Strategy: Cache First for images
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          return response || fetch(request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Strategy: Network First for HTML (to get updates)
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }

  // Default: Cache First, then Network
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }

      return fetch(request).then(response => {
        // Only cache valid responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME, CDN_CACHE_NAME, IMAGE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});