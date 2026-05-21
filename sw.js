const CACHE_NAME = 'nfaw-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './newfinelogo.png'
];

// Install Event: Runs when the app is first installed, saves assets offline
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate Event: Clears old caches instantly if you ever update CACHE_NAME
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event: Network-First Strategy
// Auto-refreshes text/products when online, falls back to saved data when offline in fields
self.addEventListener('fetch', event => {
  // Skip non-http requests (like browser extensions) to prevent errors
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If the network request is successful, update the cache with the fresh file
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If the network fails (no internet signal), load the cached asset
        return caches.match(event.request);
      })
  );
});
