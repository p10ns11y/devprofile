// Service Worker with comprehensive caching strategies
// Based on https://web.dev/articles/offline-cookbook and https://web.dev/articles/stale-while-revalidate
const CACHE_VERSION = 'v20250915T091425'; // This will be replaced during build

// Multiple cache stores for different resource types
const CACHES = {
  static: `devprofile-static-${CACHE_VERSION}`,
  pages: `devprofile-pages-${CACHE_VERSION}`,
  runtime: `devprofile-runtime-${CACHE_VERSION}`
};

// Static assets to cache at install time (known at build)
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/cv.pdf',
  '/manifest.json',
  '/images/curism.png' // Profile image
];

// External assets that don't change frequently
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// Routes that should be cached for offline access
const CRITICAL_PAGES = [
  '/',
  '/cv',
  '/ama',
  '/content-hub'
];

self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version: ${CACHE_VERSION}`);
  self.skipWaiting();

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHES.static).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Cache critical pages
      caches.open(CACHES.pages).then((cache) => {
        console.log('[SW] Caching critical pages');
        return cache.addAll(CRITICAL_PAGES);
      })
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version: ${CACHE_VERSION}`);

  // Clean up old caches
  const currentCaches = Object.values(CACHES);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (!currentCaches.includes(name)) {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    })
  );

  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Caching strategies following web.dev offline cookbook
const cacheFirst = (request) => {
  return caches.match(request)
    .then(response => {
      if (response) {
        console.log(`[SW] Cache First - Serving from cache: ${request.url}`);
        return response;
      }

      console.log(`[SW] Cache First - Fetching from network: ${request.url}`);
      return fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHES.static).then(cache => {
            cache.put(request, responseClone);
            console.log(`[SW] Cache First - Cached: ${request.url}`);
          });
        }
        return networkResponse;
      });
    });
};

const staleWhileRevalidate = (request) => {
  return caches.match(request)
    .then(cachedResponse => {
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHES.runtime).then(cache => {
              cache.put(request, responseClone);
              console.log(`[SW] Stale While Revalidate - Updated cache: ${request.url}`);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.log(`[SW] Stale While Revalidate - Network failed, using cache: ${request.url}`);
          return cachedResponse || Promise.reject();
        });

      if (cachedResponse) {
        console.log(`[SW] Stale While Revalidate - Serving stale: ${request.url}`);
        fetchPromise; // Fire and forget, update cache in background
        return cachedResponse;
      } else {
        console.log(`[SW] Stale While Revalidate - Fetching fresh: ${request.url}`);
        return fetchPromise;
      }
    });
};

const networkFirst = (request, fallbackCache = CACHES.pages) => {
  return fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        caches.open(fallbackCache).then(cache => {
          cache.put(request, responseClone);
          console.log(`[SW] Network First - Updated cache: ${request.url}`);
        });
      }
      return networkResponse;
    })
    .catch(() => {
      console.log(`[SW] Network First - Network failed, trying cache: ${request.url}`);
      return caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          console.log(`[SW] Network First - Serving from cache: ${request.url}`);
          return cachedResponse;
        }
        // If no cached version, return offline page for documents
        if (request.destination === 'document') {
          return caches.match('/offline.html'); // Serve dedicated offline page
        }
        throw new Error('Offline and no cached version available');
      });
    });
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const request = event.request;

  // Skip non-GET requests and external URLs (except allowed external assets)
  if (request.method !== 'GET' || (!url.origin.includes(self.location.origin) && !EXTERNAL_ASSETS.some(asset => url.href.includes(asset)))) {
    return;
  }

  // Apply different caching strategies based on request type
  if (request.destination === 'script' ||
      request.destination === 'style' ||
      request.url.includes('_next/') ||
      request.url.includes('.js') ||
      request.url.includes('.css') ||
      request.url.includes('/images/') ||
      EXTERNAL_ASSETS.some(asset => request.url.includes(asset))) {
    // Cache First strategy for static assets
    event.respondWith(cacheFirst(request));
  } else if (request.destination === 'document' || url.pathname.startsWith('/api/')) {
    // Network First for pages and API
    event.respondWith(networkFirst(request));
  } else {
    // Stale While Revalidate for everything else
    event.respondWith(staleWhileRevalidate(request));
  }
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
