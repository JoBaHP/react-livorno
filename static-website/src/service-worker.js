/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Ensure the SW takes control ASAP and preload assets injected by Workbox
self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

// Runtime cache for menu API: fast cache first, refresh in background
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

self.addEventListener("push", (event) => {
  const data = event.data?.json?.() || {};

  const options = {
    body: data.body || "",
    icon: "/android-chrome-192x192.png",
    badge: "/favicon.ico",
  };

  event.waitUntil(self.registration.showNotification(data.title || "Notification", options));
});
