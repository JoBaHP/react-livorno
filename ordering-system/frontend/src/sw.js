/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

// Runtime cache for menu API
registerRoute(
  ({url, request}) => request.method === 'GET' && url.pathname.endsWith('/api/menu'),
  new StaleWhileRevalidate({
    cacheName: 'api-menu',
    plugins: [
      new CacheableResponsePlugin({statuses: [0, 200]}),
      new ExpirationPlugin({maxEntries: 10, maxAgeSeconds: 5 * 60}),
    ],
  })
);

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {}

  const title = data.title || 'Notification';
  const options = {
    body: data.body || '',
    icon: '/vite.svg',
    badge: '/vite.svg',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
