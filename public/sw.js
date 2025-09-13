self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('devprofile-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/favicon.ico',
        '/cv.pdf',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
