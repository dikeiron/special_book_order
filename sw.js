const CACHE_NAME = 'smartorder-v16';
const ASSETS = [
  './index.html',
  './manifest.json',
  './banner.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // For HTML navigation or index.html requests: Network-First strategy
  // This guarantees users always get the freshest index.html when online!
  if (
    e.request.mode === 'navigate' ||
    url.pathname.endsWith('index.html') ||
    url.pathname === '/' ||
    url.pathname.endsWith('/')
  ) {
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed (offline), try cache
          return caches.match(e.request).then((cached) => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // For other static assets: Cache-First with network fallback
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
