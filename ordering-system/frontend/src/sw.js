/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

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

