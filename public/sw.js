// أصول برايم - Service Worker (يسمح بالتثبيت كتطبيق حقيقي)
const CACHE_NAME = 'osoul-prime-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// معالج fetch بسيط (شرط ضروري لدى Chrome لإتاحة التثبيت)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
