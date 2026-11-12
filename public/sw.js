// Service Worker for Quản Trò Ma Sói PWA
const CACHE_NAME = 'werewolf-pwa-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/bg-day-sun.jpg',
  '/bg-night-moon.jpg',
  '/parchment-bg.png',
  '/victory-banner.png',
  '/wolf-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching partial assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle HTTP and HTTPS requests (ignores chrome-extension://, blob:, data:, etc.)
  if (!event.request.url.startsWith('http://') && !event.request.url.startsWith('https://')) {
    return;
  }

  const url = new URL(event.request.url);

  // Skip caching for API requests and non-GET requests
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api') || url.hostname.includes('neon.tech')) {
    return;
  }

  // Stale-While-Revalidate for app shell and assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an HTML navigation, return cached root/index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
