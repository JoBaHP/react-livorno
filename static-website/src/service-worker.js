/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

// Ensure the SW takes control ASAP and preload assets injected by Workbox
self.skipWaiting();
clientsClaim();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  const data = event.data?.json?.() || {};

  const options = {
    body: data.body || "",
    icon: "/android-chrome-192x192.png",
    badge: "/favicon.ico",
  };

  event.waitUntil(self.registration.showNotification(data.title || "Notification", options));
});
