// Service Worker with dynamic cache versioning
const CACHE_VERSION = 'REPLACE_WITH_BUILD_VERSION'; // This will be replaced during build
const CACHE_NAME = `devprofile-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `devprofile-static-${CACHE_VERSION}`;

// Files to cache
const filesToCache = [
  '/',
  '/favicon.ico',
  '/cv.pdf',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version: ${CACHE_VERSION}`);
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static files');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('devprofile-') && name !== STATIC_CACHE_NAME)
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log(`[SW] Serving from cache: ${event.request.url}`);
        return response;
      }

      console.log(`[SW] Fetching from network: ${event.request.url}`);
      return fetch(event.request).catch((error) => {
        console.error('[SW] Fetch failed:', error);
        // Try to serve cached version if it's a basic HTML request
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
        throw error;
      });
    })
  );
});

// Force cache refresh
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches');
    caches.keys().then((names) => {
      return Promise.all(names.map((name) => caches.delete(name)));
    });
  }
});
